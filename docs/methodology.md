# Methodology

## Financial calculations

### CAGR
\[
CAGR = \left(rac{Ending\ Value}{Beginning\ Value}ight)^{1/n} - 1
\]

### Percentage change
\[
rac{Current - Previous}{|Previous|}
\]

### Moving average
Arithmetic mean over a rolling window.

### Volatility
Sample standard deviation of returns multiplied by the square root of an annualization factor.

### Sharpe ratio
Mean excess return divided by return volatility, annualized.

### Maximum drawdown
Largest peak-to-trough percentage decline over a series.

### Correlation
Pearson correlation coefficient between two aligned series.

### Rolling returns
Return over a specified lookback window.

## Personal finance methodology

- transaction types are normalized to `income` and `expense`
- monthly spending is computed by calendar month
- recurring expenses are inferred from repeated descriptions/categories
- savings rate is `net_savings / total_income`

## Event analysis methodology

The event analyzer is descriptive rather than causal:
- select a broad event window
- compare market performance before, during, and after
- show relevant macro indicators
- describe possible transmission mechanisms

## Scenario simulator methodology

The simulator uses a transparent, simplified coefficient-based model. It is intended to illustrate directional sensitivity, not forecast actual macro outcomes.

## ML methodology

The ML demo uses a synthetic binary classification problem and compares Logistic Regression with Random Forest using a train/test split and standard classification metrics.
