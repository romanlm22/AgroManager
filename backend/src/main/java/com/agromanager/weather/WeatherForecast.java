package com.agromanager.weather;

import java.util.List;

/**
 * Representación interna, agnóstica de proveedor, del clima de un punto
 * geográfico. Cualquier implementación de {@link WeatherClient} debe
 * devolver este tipo, sin filtrar estructuras propias de su API externa.
 */
public record WeatherForecast(
        CurrentWeatherResponse current,
        List<DailyForecastResponse> daily
) {}
