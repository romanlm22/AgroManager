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
