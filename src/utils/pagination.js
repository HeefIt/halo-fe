export function normalizePageSize(value, fallback = 10) {
  const candidate = value?.target?.value ?? value
  const parsed = Number(candidate)

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }

  const fallbackValue = Number(fallback)
  return Number.isFinite(fallbackValue) && fallbackValue > 0 ? fallbackValue : 10
}
