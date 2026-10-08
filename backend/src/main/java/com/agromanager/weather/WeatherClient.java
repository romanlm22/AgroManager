package com.agromanager.weather;

import java.math.BigDecimal;

/**
 * Contrato para obtener datos climáticos de un punto geográfico.
 *
 * Ninguna otra clase del proyecto debe conocer qué proveedor externo
 * implementa esto (hoy Open-Meteo). Para cambiar de proveedor en el
 * futuro, alcanza con crear una nueva implementación de esta interfaz
 * y marcarla como el bean primario (o quitar @Primary de la actual).
 */
public interface WeatherClient {

    WeatherForecast getForecast(BigDecimal latitude, BigDecimal longitude);
}
