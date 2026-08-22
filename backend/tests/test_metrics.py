import pytest

from app.analytics.metrics import (
    cagr,
    correlation,
    growth_rate,
    max_drawdown,
    moving_average,
    profit_margin,
    rolling_returns,
    sharpe_ratio,
    volatility,
)


def test_growth_and_cagr() -> None:
    assert growth_rate(120, 100) == 0.2
    assert round(cagr(100, 121, 2) or 0, 4) == 0.1


def test_moving_average_and_rolling_returns() -> None:
    assert moving_average([1, 2, 3, 4], 2) == [None, 1.5, 2.5, 3.5]
    result = rolling_returns([100, 110, 121], 1)
    assert result[0] is None
    assert result[1:] == pytest.approx([0.1, 0.1])


def test_risk_metrics() -> None:
    values = [100, 120, 90, 130]
    returns = [0.02, 0.01, -0.03, 0.04]
    assert round(max_drawdown(values) or 0, 4) == -0.25
    assert volatility(returns) is not None
    assert sharpe_ratio(returns) is not None
    assert round(correlation([1, 2, 3], [2, 4, 6]) or 0, 4) == 1.0
    assert profit_margin(25, 100) == 0.25
