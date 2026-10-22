package com.agromanager.livestock;

/**
 * Estado reproductivo actual de una hembra, calculado a partir de sus eventos.
 */
public enum ReproductiveState {
    /** Último tacto positivo posterior al último servicio. */
    PRENADA,
    /** Último tacto negativo posterior al último servicio. */
    VACIA,
    /** Tiene servicio sin un tacto posterior que lo confirme. */
    EN_SERVICIO,
    /** Parió o abortó y todavía no tiene un nuevo servicio. */
    SIN_SERVICIO
}
