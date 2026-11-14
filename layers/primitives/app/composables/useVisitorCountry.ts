import {
  asCountry,
  detectCountry,
  GEO_HEADERS,
  lookupCountry,
} from '#layers/nuxt-core-primitives/app/data/detect-country'

// The country the visitor is in, as an ISO 3166-1 code, or undefined while it
// is not known. <FormInput type="tel"> opens on it.
//
// 1. The host's geolocation header, on the server, when there is one
//    (Cloudflare, Vercel, CloudFront, App Engine): the country of the
//    visitor's IP address.
// 2. In the browser, a guess, at once: the region of the visitor's languages
//    (fr-BE) when that country shares the time of the visitor's time zone,
//    else the country of the time zone. Windows gives one zone to several
//    countries (Brussels, Copenhagen, Madrid and Paris are all Europe/Paris),
//    which is why the languages come first.
// 3. When the site sets runtimeConfig.public.nuxtCore.countryLookup, the
//    lookup service at that URL, which replaces the guess: the country of the
//    visitor's IP address, once per browser session.
//
// Shared by every input of the page, and found once.
const CACHE_KEY = 'nc-visitor-country'
let lookup: Promise<string | undefined> | undefined

const cachedLookup = async (url: string) => {
  try {
    const cached = asCountry(sessionStorage.getItem(CACHE_KEY))
    if (cached) return cached
  } catch {
    // Storage blocked: look up every time
  }

  const found = await lookupCountry(url)
  try {
    if (found) sessionStorage.setItem(CACHE_KEY, found)
  } catch {
    // Storage blocked
  }
  return found
}

export const useVisitorCountry = () => {
  const country = useState<string | undefined>('nc-visitor-country', () => {
    if (!import.meta.server) return undefined
    const headers = useRequestHeaders(GEO_HEADERS)
    return GEO_HEADERS.map(name => asCountry(headers[name])).find(Boolean)
  })
  // From the header or the lookup service, rather than guessed
  const exact = useState(
    'nc-visitor-country-exact',
    () => country.value !== undefined,
  )
  // Optional: a dev server started before the setting existed has none
  const url = useRuntimeConfig().public.nuxtCore?.countryLookup

  onMounted(async () => {
    if (exact.value) return
    country.value ??= detectCountry()
    if (!url) return

    lookup ??= cachedLookup(url)
    const found = await lookup
    if (found) {
      country.value = found
      exact.value = true
    }
  })

  return readonly(country)
}
