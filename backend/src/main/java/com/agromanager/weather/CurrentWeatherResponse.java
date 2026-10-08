package com.agromanager.weather;

import java.math.BigDecimal;

public record CurrentWeatherResponse(
        BigDecimal temperatureC,
        BigDecimal humidityPercent,
        BigDecimal precipitationMm,
        BigDecimal windSpeedKmh
) {}
