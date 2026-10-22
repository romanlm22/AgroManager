/** Fecha de hoy en formato YYYY-MM-DD, según la zona horaria de la computadora. */
export function todayIso(): string {
  return new Date().toLocaleDateString('en-CA')
}
