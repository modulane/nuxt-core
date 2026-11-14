import { COUNTRIES } from './countries'
import { TIME_ZONES } from './time-zones'

// Finds the country the visitor is in; see useVisitorCountry()

export const GEO_HEADERS: Lowercase<string>[] = [
  'cf-ipcountry',
  'x-vercel-ip-country',
  'cloudfront-viewer-country',
  'x-appengine-country',
  'x-country-code',
]

const known = new Set(COUNTRIES.map(country => country.code))
export const asCountry = (value: string | null | undefined) => {
  const code = value?.trim().toUpperCase()
  return code && known.has(code) ? code : undefined
}

let zones: Map<string, string> | undefined
const countryOfZone = (zone: string) => {
  zones ??= new Map(
    TIME_ZONES.trim()
      .split(' ')
      .flatMap(entry => {
        const [code, list] = entry.split(':')
        return list!.split(',').map(name => [name, code!] as const)
      }),
  )
  return zones.get(zone)
}

const zonesOfCountry = (code: string) =>
  TIME_ZONES.trim()
    .split(' ')
    .find(entry => entry.startsWith(`${code}:`))
    ?.slice(3)
    .split(',') ?? []

// GMT+01:00 for Europe/Brussels in winter
const offset = (timeZone: string, date: Date) => {
  try {
    return new Intl.DateTimeFormat('en', {
      timeZone,
      timeZoneName: 'longOffset',
    })
      .formatToParts(date)
      .find(part => part.type === 'timeZoneName')?.value
  } catch {
    return undefined
  }
}

export const detectCountry = (
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  languages: readonly string[] = navigator.languages,
  date = new Date(),
) => {
  const own = offset(timeZone, date)

  for (const language of languages) {
    let region: string | undefined
    try {
      region = asCountry(new Intl.Locale(language).region)
    } catch {
      continue
    }
    if (!region) continue
    if (zonesOfCountry(region).some(zone => offset(zone, date) === own)) {
      return region
    }
  }

  return countryOfZone(timeZone)
}

// The country of the visitor's IP address, from the lookup service the site
// chose: JSON with a `country`, `country_code` or `countryCode` field
// (api.country.is, ipapi.co/json…), or the bare code as text. Undefined when it
// fails or takes more than 3 seconds: the guess from the browser then stays.
export const lookupCountry = async (url: string, fetcher = fetch) => {
  try {
    const response = await fetcher(url, {
      credentials: 'omit',
      signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) return undefined

    const text = (await response.text()).trim()
    if (!text.startsWith('{')) return asCountry(text)

    const data = JSON.parse(text) as Record<string, string | undefined>
    return asCountry(data.country ?? data.country_code ?? data.countryCode)
  } catch {
    return undefined
  }
}
