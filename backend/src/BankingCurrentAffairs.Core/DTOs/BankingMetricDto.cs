namespace BankingCurrentAffairs.Core.DTOs;

public class BankingMetricDto
{
    public string MetricNameEn { get; set; } = string.Empty;
    public string MetricNameHi { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Change { get; set; }
    public string? Note { get; set; }
}
