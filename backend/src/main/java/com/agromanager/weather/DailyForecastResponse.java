package com.agromanager.weather;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyForecastResponse(
        LocalDate date,
        BigDecimal tempMinC,
        BigDecimal tempMaxC,
        BigDecimal precipitationSumMm,
        Integer precipitationProbabilityPercent
) {}
