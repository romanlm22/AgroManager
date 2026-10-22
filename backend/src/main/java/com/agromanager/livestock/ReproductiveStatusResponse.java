package com.agromanager.livestock;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Estado reproductivo de una hembra activa. estimatedDueDate solo existe cuando está
 * preñada y hay un servicio registrado; daysToDue es negativo si la fecha ya pasó.
 */
public record ReproductiveStatusResponse(
        UUID animalId,
        String animalTagNumber,
        ReproductiveState state,
        LocalDate lastServiceDate,
        LocalDate lastTactoDate,
        LocalDate lastBirthDate,
        LocalDate estimatedDueDate,
        Integer daysToDue
) {}
