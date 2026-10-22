package com.agromanager.livestock;

import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.field.Field;
import com.agromanager.field.FieldRepository;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;
import java.util.UUID;

/**
 * Verificaciones de acceso compartidas por los servicios de ganadería: el usuario
 * debe pertenecer al establecimiento y todo lo referenciado (lotes, rodeos) debe
 * pertenecer a ese mismo establecimiento.
 */
@Component
@RequiredArgsConstructor
class LivestockAccess {

    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;
    private final FieldRepository fieldRepository;
    private final HerdRepository herdRepository;
    private final AnimalRepository animalRepository;

    Farm getAuthorizedFarm(UUID farmId, User currentUser) {
        boolean hasAccess = farmUserRepository.existsByFarmIdAndUserId(farmId, currentUser.getId());

        if (!hasAccess) {
            throw new FarmAccessDeniedException("You do not have access to this farm");
        }

        return farmRepository.findById(farmId)
                .orElseThrow(() -> new NoSuchElementException("Farm not found"));
    }

    /** Devuelve null si no se indicó lote; 404 si el lote no es del establecimiento. */
    Field resolveField(UUID farmId, UUID fieldId) {
        if (fieldId == null) {
            return null;
        }

        return fieldRepository.findByIdAndFarmId(fieldId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Field not found"));
    }

    /** Devuelve null si no se indicó animal; 404 si el animal no es del establecimiento. */
    Animal resolveAnimal(UUID farmId, UUID animalId) {
        if (animalId == null) {
            return null;
        }

        return animalRepository.findByIdAndFarmId(animalId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Animal not found"));
    }

    /** Devuelve null si no se indicó rodeo; 404 si el rodeo no es del establecimiento. */
    Herd resolveHerd(UUID farmId, UUID herdId) {
        if (herdId == null) {
            return null;
        }

        return herdRepository.findByIdAndFarmId(herdId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Herd not found"));
    }
}
