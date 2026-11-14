# Composables

Every composable, and how to document a new one. Composables are auto-imported: call them without an `import`.

## Inventory

| Composable            | File                                                     | Status | Purpose                                                        |
| --------------------- | -------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| `useBreakpoints()`    | `layers/design/app/composables/useBreakpoints.ts`        | Ready  | Reactive access to the [breakpoints](styling.md#breakpoints)   |
| `useSanitize()`       | `layers/primitives/app/composables/useSanitize.ts`       | Ready  | Clean text, URLs and payloads from outside                     |
| `useTheme()`          | `layers/design/app/composables/useTheme.ts`              | Ready  | Read and switch the [colour scheme](styling.md#colour-schemes) |
| `useVisitorCountry()` | `layers/primitives/app/composables/useVisitorCountry.ts` | Ready  | The country the visitor is in                                  |

## useBreakpoints

Reports which [breakpoint](styling.md#breakpoints) the window has reached, for layout decisions CSS cannot make: rendering a different component on small screens, or loading less on them. For anything CSS can do, such as hiding, resizing or rearranging, use the [`respond-to()` mixin](styling.md#mixins) instead: it applies before the page's JavaScript runs, so nothing jumps.

```vue
<template>
  <MobileMenu v-if="isBelowMd" />
  <DesktopMenu v-else />
</template>

<script setup lang="ts">
const { isBelow } = useBreakpoints()
const isBelowMd = isBelow('md')
</script>
```

No options.

| Returns     | Type                                               | Description                                                         |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| `active`    | `ComputedRef<Breakpoint \| undefined>`             | The widest breakpoint the window reaches, or `undefined` below `sm` |
| `isAtLeast` | `(breakpoint: Breakpoint) => ComputedRef<boolean>` | Whether the window is at least that wide, as `respond-to()`         |
| `isBelow`   | `(breakpoint: Breakpoint) => ComputedRef<boolean>` | Whether the window is narrower, as `respond-below()`                |

`Breakpoint` is `'sm' | 'md' | 'lg' | 'xl' | '2xl'`. The layer also exports `BREAKPOINTS`, their widths in pixels (`{ sm: 640, … }`), which is auto-imported like the composable: for an image's `sizes` attribute, for example. They are the same as the Sass `$breakpoints`, and a test fails if the two drift apart.

Every caller shares one state, and the page listens to one media query per breakpoint, whatever the number of callers.

**SSR:** runs on the server, which cannot know the window's width: there, and in the browser until hydration is over, it reports the smallest screen (`active` is `undefined`, `isBelow('sm')` is true), as mobile-first CSS does. The browser then updates it to the real width, so content that depends on it changes once the page has loaded. That is why CSS is the better tool for what is visible on the first paint.

## useSanitize

Cleans what comes from outside the site: a form, a query string, an API response, a paste. It removes the characters used to hide or spoof text, tidies the value, and checks URLs before they go into a link or a redirect. [`<FormInput>`](components.md#forminput) uses it as the visitor types.

```vue
<template>
  <a v-if="href" :href="href">{{ label }}</a>
</template>

<script setup lang="ts">
const { sanitize, safeUrl } = useSanitize()
const route = useRoute()

const label = computed(() =>
  sanitize(String(route.query.label ?? ''), { maxLength: 80 }),
)
const href = computed(() => safeUrl(String(route.query.next ?? '')))
</script>
```

No options.

| Returns        | Type                                                               | Description                                                                                                               |
| -------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `stripUnsafe`  | `(value: string, options?: { multiline?: boolean }) => string`     | Removes the unsafe characters, and line breaks unless `multiline`; changes nothing else, so it can run on every keystroke |
| `sanitize`     | `(value: string, options?: SanitizeOptions) => string`             | `stripUnsafe`, then the canonical Unicode form (NFC), no outer spaces, and at most `maxLength` characters                 |
| `sanitizeDeep` | `<T>(value: T, options?: SanitizeOptions) => T`                    | `sanitize` on every string and key of an object or array, at any depth                                                    |
| `escapeHtml`   | `(value: string) => string`                                        | Escapes `& < > " '`, for HTML built by hand                                                                               |
| `safeUrl`      | `(value: string, options?: SafeUrlOptions) => string \| undefined` | The normalized URL when it is safe for an `href` or a redirect, `undefined` otherwise                                     |

| `SanitizeOptions` | Type      | Default | Description                                                             |
| ----------------- | --------- | ------- | ----------------------------------------------------------------------- |
| `multiline`       | `boolean` | `false` | Keeps line breaks and tabs, for a textarea; `\r\n` and `\r` become `\n` |
| `maxLength`       | `number`  | none    | The longest value kept, in characters; an emoji is never cut in two     |

| `SafeUrlOptions` | Type       | Default                                  | Description                                                 |
| ---------------- | ---------- | ---------------------------------------- | ----------------------------------------------------------- |
| `protocols`      | `string[]` | `['http:', 'https:', 'mailto:', 'tel:']` | The schemes allowed, with their colon                       |
| `relative`       | `boolean`  | `true`                                   | Allows a path on the same site: `/about`, `?page=2`, `#top` |

What counts as unsafe:

- **Characters:** control characters, and the invisible ones that hide text or reverse its direction to spoof it: zero-width spaces, bidirectional marks and overrides (`invoice` + U+202E + `fdp.exe` shows as `invoiceexe.pdf`), line and paragraph separators, invisible operators, and tag characters, which can carry hidden text such as instructions for an AI that reads the page. The zero-width joiner and non-joiner stay, since emoji and scripts such as Persian need them, and so do the tags of the England, Scotland and Wales flags.
- **Keys:** `sanitizeDeep` drops `__proto__`, `constructor` and `prototype`, which would change the prototype of an object the payload is merged into, and drops circular references. Numbers, booleans, `null` and objects that are not plain, such as a `Date` or a `File`, are kept as they are.
- **URLs:** `safeUrl` refuses `javascript:`, `data:` and every scheme not in `protocols`, even disguised as `java\tscript:` or with leading control characters; `//evil.com` and `/\evil.com`, which browsers read as another site; and a user name or password before the host, as in `https://bank.com@evil.com`.

What it does not do:

- **It does not replace the server's checks.** A request does not have to come from the site's forms, so the server validates and escapes every value it receives. The functions are pure and work on the server too, but Nitro does not auto-import the app's composables: import the file there.
- **It does not sanitize HTML.** Vue already escapes `{{ }}` and bound attributes, so plain text needs nothing. HTML meant for `v-html` needs a real HTML sanitizer, such as [DOMPurify](https://github.com/cure53/DOMPurify); `escapeHtml` turns markup into text, it does not keep the safe part of it.
- **It does not touch passwords.** Do not run a password through it: it must stay exactly what the visitor chose.

**SSR:** runs on the server and in the browser alike: the functions have no state and give the same result on both.

## useTheme

Reads and switches the [colour scheme](styling.md#colour-schemes), dark or light. Every caller shares one state, and the design layer applies it to `<html>` on every page, so a switch anywhere repaints the whole site. Themes are [planned](theming.md); for now it handles only the colour scheme.

```vue
<template>
  <FormSwitch v-model="isDark">Dark mode</FormSwitch>
</template>

<script setup lang="ts">
const { isDark } = useTheme()
</script>
```

No options.

| Returns             | Type                           | Description                                         |
| ------------------- | ------------------------------ | --------------------------------------------------- |
| `colorScheme`       | `Readonly<Ref<ColorScheme>>`   | The current scheme, `'dark'` (default) or `'light'` |
| `isDark`            | `WritableComputedRef<boolean>` | Whether the scheme is dark; setting it switches     |
| `setColorScheme`    | `(next: ColorScheme) => void`  | Switches to the given scheme                        |
| `toggleColorScheme` | `() => void`                   | Switches to the other scheme                        |

The choice is saved for a year in the `nc-color-scheme` cookie, which the feature needs to work; it does not track the visitor.

**SSR:** runs on the server. It reads the cookie there, so the page is rendered in the visitor's scheme and does not flash on load.

## useVisitorCountry

The country the visitor is in, as an ISO 3166-1 code (`'BE'`). A [`<FormInput type="tel">`](components.md#forminput) opens on it; use it for anything else that depends on the country, such as a default currency or a shipping estimate. It is a guess for convenience, never a fact to rely on: let the visitor change whatever it decides.

```vue
<script setup lang="ts">
const country = useVisitorCountry()
const currency = computed(() => (country.value === 'GB' ? 'GBP' : 'EUR'))
</script>
```

No options.

| Returns   | Type                                 | Description                                              |
| --------- | ------------------------------------ | -------------------------------------------------------- |
| `country` | `Readonly<Ref<string \| undefined>>` | The country's code, or `undefined` while it is not known |

It looks in this order:

1. **The host's geolocation header**, on the server: `cf-ipcountry` (Cloudflare), `x-vercel-ip-country` (Vercel), `cloudfront-viewer-country` (CloudFront), `x-appengine-country` (App Engine), or `x-country-code` for any other proxy that sets it. It is the country of the visitor's IP address: behind one of these hosts, the page is rendered in the right country from the start, and nothing else runs.
2. **A guess in the browser**, at once: the region of the visitor's languages, when that country is on the same time as the visitor (`fr-BE` gives Belgium on a computer set to Brussels or Paris time, but not to New York time), else the country of the visitor's time zone. Windows gives one zone to several countries (Brussels, Copenhagen, Madrid and Paris are all `Europe/Paris`), so a Belgian browser in French or English is taken for French: a browser whose languages, time zone and Windows region all say France has nothing that tells it is in Belgium. Only the IP address does.
3. **An IP lookup service**, when the site sets one. It replaces the guess once it answers, and a phone field the visitor has not touched yet moves to the country it gives. It is asked once per browser session, without cookies, and gives up after 3 seconds.

The lookup is off by default, because it sends the visitor's IP address to that service: under the GDPR, an IP address is personal data, so the site's privacy policy names the service. Turn it on with the URL of a service that answers JSON with a `country`, `country_code` or `countryCode` field, or the bare code as text:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      nuxtCore: {
        countryLookup: 'https://api.country.is',
      },
    },
  },
})
```

`NUXT_PUBLIC_NUXT_CORE_COUNTRY_LOOKUP` sets it at runtime instead, per environment. [country.is](https://country.is) is free, without a key, and open source, so it can also run on your own server; `https://ipapi.co/json` works too. Behind a host that sends the header, the lookup never runs.

Every caller shares one state, and the browser looks once per page. The time zones of each country come from the ICU data of Node.js, through [`scripts/generate-time-zones.js`](../scripts/generate-time-zones.js); run it again when the country list changes. It sends nothing anywhere and stores nothing.

**SSR:** runs on the server, where only the header can tell. Without one, it is `undefined` there and until the page has loaded in the browser, which then finds the country: what depends on it changes once the page is ready.

## Documenting a composable

When a composable moves from stub to ready, add a section with this structure, and change its status in the inventory:

````markdown
## useExample

One or two sentences: what it does and when to use it.

```ts
const { value, set } = useExample({ initial: 1 })
```

| Option    | Type     | Default | Description        |
| --------- | -------- | ------- | ------------------ |
| `initial` | `number` | `0`     | The starting value |

| Returns | Type                     | Description        |
| ------- | ------------------------ | ------------------ |
| `value` | `Readonly<Ref<number>>`  | The current value  |
| `set`   | `(next: number) => void` | Replaces the value |

**SSR:** whether it runs on the server, and what it returns there.
````
