package com.agromanager.livestock;

import java.util.UUID;

/** Proyección: cantidad de animales activos por rodeo. */
public interface HerdAnimalCount {

    UUID getHerdId();

    long getTotal();
}
