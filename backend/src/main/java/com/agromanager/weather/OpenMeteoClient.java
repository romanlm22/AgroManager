package com.agromanager.weather;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Única clase del proyecto que conoce la URL y el formato de respuesta
 * específicos de Open-Meteo (https://open-meteo.com). Implementa
 * {@link WeatherClient}, de forma que el resto del sistema nunca
 * depende directamente de este proveedor.
 */
@Component
public class OpenMeteoClient implements WeatherClient {

    private final RestClient restClient;

    public OpenMeteoClient(
            RestClient.Builder restClientBuilder,
            @Value("${app.weather.open-meteo.base-url:https://api.open-meteo.com}") String baseUrl) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
    }

    @Override
    public WeatherForecast getForecast(BigDecimal latitude, BigDecimal longitude) {
        OpenMeteoApiResponse apiResponse;

        try {
            apiResponse = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/forecast")
                            .queryParam("latitude", latitude)
                            .queryParam("longitude", longitude)
                            .queryParam("current",
                                    "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m")
                            .queryParam("daily",
                                    "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max")
                            .queryParam("forecast_days", 7)
                            .queryParam("timezone", "auto")
                            .build())
                    .retrieve()
                    .body(OpenMeteoApiResponse.class);
        } catch (RestClientException e) {
            throw new WeatherProviderException("Unable to reach Open-Meteo", e);
        }

        if (apiResponse == null || apiResponse.current() == null || apiResponse.daily() == null) {
            throw new WeatherProviderException("Open-Meteo returned an unexpected empty response");
        }

        return mapToForecast(apiResponse);
    }

    private WeatherForecast mapToForecast(OpenMeteoApiResponse api) {
        CurrentWeatherResponse current = new CurrentWeatherResponse(
                api.current().temperature2m(),
                api.current().relativeHumidity2m(),
                api.current().precipitation(),
                api.current().windSpeed10m()
        );

        DailyBlock daily = api.daily();
        List<DailyForecastResponse> forecast = new ArrayList<>();

        for (int i = 0; i < daily.time().size(); i++) {
            forecast.add(new DailyForecastResponse(
                    daily.time().get(i),
                    daily.temperature2mMin().get(i),
                    daily.temperature2mMax().get(i),
                    daily.precipitationSum().get(i),
                    daily.precipitationProbabilityMax().get(i)
            ));
        }

        return new WeatherForecast(current, forecast);
    }

    // --- DTOs internos, solo para deserializar la respuesta de Open-Meteo.
    // No se exponen fuera de esta clase.

    private record OpenMeteoApiResponse(CurrentBlock current, DailyBlock daily) {}

    private record CurrentBlock(
            @JsonProperty("temperature_2m") BigDecimal temperature2m,
            @JsonProperty("relative_humidity_2m") BigDecimal relativeHumidity2m,
            BigDecimal precipitation,
            @JsonProperty("wind_speed_10m") BigDecimal windSpeed10m
    ) {}

    private record DailyBlock(
            List<LocalDate> time,
            @JsonProperty("temperature_2m_max") List<BigDecimal> temperature2mMax,
            @JsonProperty("temperature_2m_min") List<BigDecimal> temperature2mMin,
            @JsonProperty("precipitation_sum") List<BigDecimal> precipitationSum,
            @JsonProperty("precipitation_probability_max") List<Integer> precipitationProbabilityMax
    ) {}
}
