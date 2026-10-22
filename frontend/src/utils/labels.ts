export const taskTypeLabels: Record<string, string> = {
  SIEMBRA: 'Siembra',
  FERTILIZACION: 'Fertilización',
  PULVERIZACION: 'Pulverización',
  RIEGO: 'Riego',
  COSECHA: 'Cosecha',
  CONTROL_MALEZAS: 'Control de malezas',
  OTRA: 'Otra',
}

export const taskStatusLabels: Record<string, string> = {
  PLANIFICADA: 'Planificada',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

export const unitLabels: Record<string, string> = {
  KG: 'kg',
  LITRO: 'L',
  UNIDAD: 'u.',
  BOLSA: 'bolsas',
  TONELADA: 't',
}

export const fieldStatusLabels: Record<string, string> = {
  ACTIVE: 'Activo',
  FALLOW: 'En descanso',
  INACTIVE: 'Inactivo',
}

export const cropStatusLabels: Record<string, string> = {
  PLANTED: 'Sembrado',
  GROWING: 'En crecimiento',
  HARVESTED: 'Cosechado',
  LOST: 'Perdido',
}

export const inventoryCategoryLabels: Record<string, string> = {
  SEMILLA: 'Semilla',
  FERTILIZANTE: 'Fertilizante',
  HERBICIDA: 'Herbicida',
  FUNGICIDA: 'Fungicida',
  INSECTICIDA: 'Insecticida',
  OTRO: 'Otro',
}

export const machineryTypeLabels: Record<string, string> = {
  TRACTOR: 'Tractor',
  SEMBRADORA: 'Sembradora',
  PULVERIZADORA: 'Pulverizadora',
  COSECHADORA: 'Cosechadora',
  OTRA: 'Otra',
}

export const machineryStatusLabels: Record<string, string> = {
  OPERATIVA: 'Operativa',
  EN_MANTENIMIENTO: 'En mantenimiento',
  FUERA_DE_SERVICIO: 'Fuera de servicio',
}

export const landUseLabels: Record<string, string> = {
  AGRICULTURA: 'Agricultura',
  GANADERIA: 'Ganadería',
  MIXTO: 'Mixto',
}

export const livestockCategoryLabels: Record<string, string> = {
  TERNERO: 'Ternero/a',
  VAQUILLONA: 'Vaquillona',
  VACA: 'Vaca',
  TORO: 'Toro',
  NOVILLO: 'Novillo',
  OTRA: 'Otra',
}

export const animalSexLabels: Record<string, string> = {
  MACHO: 'Macho',
  HEMBRA: 'Hembra',
}

export const animalStatusLabels: Record<string, string> = {
  ACTIVO: 'Activo',
  VENDIDO: 'Vendido',
  MUERTO: 'Muerto',
}

export const healthEventTypeLabels: Record<string, string> = {
  VACUNACION: 'Vacunación',
  DESPARASITACION: 'Desparasitación',
  TRATAMIENTO: 'Tratamiento',
  OTRO: 'Otro',
}

export const productTypeLabels: Record<string, string> = {
  LECHE: 'Leche',
  CARNE: 'Carne',
  LANA: 'Lana',
  HUEVOS: 'Huevos',
  CUERO: 'Cuero',
  OTRO: 'Otro',
}

export const productionUnitLabels: Record<string, string> = {
  LITROS: 'L',
  KG: 'kg',
  UNIDADES: 'u.',
}

export const reproductionEventTypeLabels: Record<string, string> = {
  SERVICIO: 'Servicio',
  TACTO: 'Tacto',
  PARTO: 'Parto',
  ABORTO: 'Aborto',
}

export const serviceTypeLabels: Record<string, string> = {
  NATURAL: 'Monta natural',
  INSEMINACION: 'Inseminación',
}

export const tactoResultLabels: Record<string, string> = {
  PRENADA: 'Preñada',
  VACIA: 'Vacía',
}

export const reproductiveStateLabels: Record<string, string> = {
  PRENADA: 'Preñada',
  VACIA: 'Vacía',
  EN_SERVICIO: 'En servicio, sin tacto',
  SIN_SERVICIO: 'Sin servicio',
}
