export const PORTAL_TZ = 'America/New_York'

export function formatPortalDateTime(iso: string): string {
  return (
    new Date(iso).toLocaleString('en-US', {
      timeZone: PORTAL_TZ,
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }) + ' ET'
  )
}

export function formatPortalDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: PORTAL_TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
