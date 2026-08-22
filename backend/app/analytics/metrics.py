from __future__ import annotations

import math
from collections.abc import Sequence

import numpy as np


def growth_rate(current: float, previous: float) -> float | None:
    if previous == 0:
        return None
    return (current - previous) / abs(previous)


pct_change = growth_rate


def cagr(start_value: float, end_value: float, periods: int) -> float | None:
    if start_value <= 0 or end_value < 0 or periods <= 0:
        return None
    return (end_value / start_value) ** (1 / periods) - 1


def moving_average(values: Sequence[float], window: int) -> list[float | None]:
    if window <= 0:
        raise ValueError("window must be positive")
    result: list[float | None] = []
    for index in range(len(values)):
        if index + 1 < window:
            result.append(None)
            continue
        chunk = values[index + 1 - window : index + 1]
        result.append(sum(chunk) / window)
    return result


def volatility(returns: Sequence[float], annualization_factor: int = 12) -> float | None:
    if len(returns) < 2:
        return None
    return float(np.std(returns, ddof=1) * math.sqrt(annualization_factor))


def sharpe_ratio(returns: Sequence[float], risk_free_rate: float = 0.0) -> float | None:
    if len(returns) < 2:
        return None
    excess = np.array(returns) - risk_free_rate / 12
    std = np.std(excess, ddof=1)
    if std == 0:
        return None
    return float(np.mean(excess) / std * math.sqrt(12))


def max_drawdown(values: Sequence[float]) -> float | None:
    if not values:
        return None
    peak = values[0]
    max_dd = 0.0
    for value in values:
        peak = max(peak, value)
        if peak == 0:
            continue
        drawdown = (value - peak) / peak
        max_dd = min(max_dd, drawdown)
    return max_dd


def correlation(series_a: Sequence[float], series_b: Sequence[float]) -> float | None:
    if len(series_a) != len(series_b) or len(series_a) < 2:
        return None
    return float(np.corrcoef(np.array(series_a), np.array(series_b))[0, 1])


def rolling_returns(values: Sequence[float], window: int) -> list[float | None]:
    if window <= 0:
        raise ValueError("window must be positive")
    result: list[float | None] = []
    for index in range(len(values)):
        if index < window or values[index - window] == 0:
            result.append(None)
            continue
        result.append((values[index] / values[index - window]) - 1)
    return result


def profit_margin(net_income: float, revenue: float) -> float | None:
    if revenue == 0:
        return None
    return net_income / revenue
