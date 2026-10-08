package com.agromanager.weather;

import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;
    private final WeatherClient weatherClient;

    public WeatherResponse getWeatherForFarm(UUID farmId, User currentUser) {
        Farm farm = getAuthorizedFarm(farmId, currentUser);

        if (farm.getLatitude() == null || farm.getLongitude() == null) {
            throw new MissingFarmCoordinatesException(
                    "This farm has no coordinates set; cannot fetch weather data. " +
                    "Update the farm with latitude/longitude first.");
        }

        WeatherForecast forecast = weatherClient.getForecast(farm.getLatitude(), farm.getLongitude());

        return new WeatherResponse(
                farm.getId(),
                farm.getLatitude(),
                farm.getLongitude(),
                forecast.current(),
                forecast.daily()
        );
    }

    private Farm getAuthorizedFarm(UUID farmId, User currentUser) {
        boolean hasAccess = farmUserRepository.existsByFarmIdAndUserId(farmId, currentUser.getId());

        if (!hasAccess) {
            throw new FarmAccessDeniedException("You do not have access to this farm");
        }

        return farmRepository.findById(farmId)
                .orElseThrow(() -> new NoSuchElementException("Farm not found"));
    }
}
