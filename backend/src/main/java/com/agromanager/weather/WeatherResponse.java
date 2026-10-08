package com.agromanager.weather;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record WeatherResponse(
        UUID farmId,
        BigDecimal latitude,
        BigDecimal longitude,
        CurrentWeatherResponse current,
        List<DailyForecastResponse> forecast
) {}
