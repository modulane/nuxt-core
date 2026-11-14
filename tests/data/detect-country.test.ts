import { describe, expect, it, vi } from 'vitest'
import {
  asCountry,
  detectCountry,
  lookupCountry,
} from '../../layers/primitives/app/data/detect-country'

// In winter: Brussels and Paris are on GMT+01:00, London on GMT
const winter = new Date('2026-01-15T12:00:00Z')

describe('detectCountry', () => {
  it('takes the region of a language that shares the time zone', () => {
    // Windows reports Europe/Paris for Brussels too
    expect(detectCountry('Europe/Paris', ['fr-BE', 'fr'], winter)).toBe('BE')
    expect(detectCountry('Europe/Paris', ['nl', 'nl-BE'], winter)).toBe('BE')
  })

  it('takes the country of the time zone otherwise', () => {
    // US time is far from Paris: an American browser in Belgium
    expect(detectCountry('Europe/Paris', ['en-US'], winter)).toBe('FR')
    expect(detectCountry('Europe/Paris', ['fr'], winter)).toBe('FR')
    expect(detectCountry('Europe/London', ['fr-BE'], winter)).toBe('GB')
    expect(detectCountry('America/New_York', ['en-GB'], winter)).toBe('US')
  })

  it('knows the old and the current names of a zone', () => {
    expect(detectCountry('Asia/Calcutta', [], winter)).toBe('IN')
    expect(detectCountry('Asia/Kolkata', [], winter)).toBe('IN')
    expect(detectCountry('Europe/Kyiv', [], winter)).toBe('UA')
  })

  it('finds nothing in a zone of no country', () => {
    expect(detectCountry('Etc/UTC', ['en'], winter)).toBeUndefined()
  })

  it('skips a language it cannot read', () => {
    expect(detectCountry('Europe/Brussels', ['%%', 'nl-BE'], winter)).toBe('BE')
  })
})

describe('asCountry', () => {
  it('reads a geolocation header', () => {
    expect(asCountry('be')).toBe('BE')
    expect(asCountry(' FR ')).toBe('FR')
  })

  it('refuses what is no country: unknown, Tor, empty', () => {
    expect(asCountry('XX')).toBeUndefined()
    expect(asCountry('T1')).toBeUndefined()
    expect(asCountry('')).toBeUndefined()
    expect(asCountry(undefined)).toBeUndefined()
  })
})

describe('lookupCountry', () => {
  const answer = (body: string, ok = true) =>
    vi.fn(async () => new Response(body, { status: ok ? 200 : 500 }))

  it('reads the country of a JSON answer', async () => {
    expect(
      await lookupCountry('x', answer('{"ip":"1.2.3.4","country":"BE"}')),
    ).toBe('BE')
    expect(await lookupCountry('x', answer('{"country_code":"nl"}'))).toBe('NL')
    expect(await lookupCountry('x', answer('{"countryCode":"LU"}'))).toBe('LU')
  })

  it('reads a bare code', async () => {
    expect(await lookupCountry('x', answer('FR\n'))).toBe('FR')
  })

  it('asks without cookies', async () => {
    const fetcher = answer('BE')
    await lookupCountry('https://api.example/country', fetcher)

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.example/country',
      expect.objectContaining({ credentials: 'omit' }),
    )
  })

  it('gives nothing when the service fails', async () => {
    expect(await lookupCountry('x', answer('BE', false))).toBeUndefined()
    expect(await lookupCountry('x', answer('{oops'))).toBeUndefined()
    expect(
      await lookupCountry(
        'x',
        vi.fn(async () => {
          throw new TypeError('offline')
        }),
      ),
    ).toBeUndefined()
  })
})
