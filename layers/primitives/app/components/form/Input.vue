<template>
  <div
    class="nc-input"
    :class="attrs.class"
    :style="attrs.style"
    :data-variant="props.variant"
    :data-focus-style="props.focusStyle"
    :data-filled="model !== '' || undefined"
    :data-icon="hasIcon || undefined"
    :data-suggesting="suggestion ? true : undefined"
    :data-country="isPhone ? country.code : undefined"
  >
    <label :for="inputId" class="nc-input__label" @click="onLabelClick">{{
      props.label
    }}</label>
    <div class="nc-input__field">
      <BaseIcon v-if="hasIcon" class="nc-input__icon">
        <slot name="icon">
          <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
        </slot>
      </BaseIcon>
      <div
        v-if="isPhone"
        class="nc-input__country"
        :data-open="listOpen || undefined"
        @focusout="onPickerFocusOut"
      >
        <button
          ref="countryButton"
          type="button"
          class="nc-input__country-button"
          :aria-label="`${props.countryLabel}: ${countryName(country.code)} (+${country.dial})`"
          aria-haspopup="listbox"
          :aria-expanded="listOpen"
          :aria-controls="listOpen ? listId : undefined"
          :disabled="isDisabled || props.readonly"
          @click="listOpen ? closeList() : openList()"
          @keydown="onButtonKeydown"
        >
          <span class="nc-input__country-flag" aria-hidden="true">{{
            flag(country.code)
          }}</span>
          <span class="nc-input__country-dial" aria-hidden="true"
            >+{{ country.dial }}</span
          >
          <BaseIcon class="nc-input__country-chevron">
            <svg
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </BaseIcon>
        </button>
        <div v-if="listOpen" class="nc-input__country-list">
          <input
            ref="countrySearch"
            v-model="query"
            class="nc-input__country-search"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            :aria-controls="listId"
            :aria-activedescendant="
              activeCode ? optionId(activeCode) : undefined
            "
            :aria-label="props.searchCountryLabel"
            :placeholder="props.searchCountryLabel"
            autocomplete="off"
            spellcheck="false"
            @keydown="onSearchKeydown"
          />
          <ul
            :id="listId"
            ref="optionList"
            role="listbox"
            class="nc-input__country-options"
            :aria-label="props.countryLabel"
          >
            <li
              v-for="option in filteredOptions"
              :id="optionId(option.code)"
              :key="option.code"
              role="option"
              class="nc-input__country-option"
              :aria-selected="option.code === country.code"
              :data-active="option.code === activeCode || undefined"
              @mousedown.prevent
              @pointermove="activeCode = option.code"
              @click="pickCountry(option.code)"
            >
              <span class="nc-input__country-flag" aria-hidden="true">{{
                option.flag
              }}</span>
              <span class="nc-input__country-name">{{ option.name }}</span>
              <span class="nc-input__country-dial">+{{ option.dial }}</span>
            </li>
          </ul>
          <p class="nc-input__country-empty" role="status">
            {{ filteredOptions.length ? '' : props.noCountryLabel }}
          </p>
        </div>
      </div>
      <!-- email: the suggested domain, in grey after what was typed; the typed
      part is there, hidden, only to push the suggestion after it -->
      <span v-if="suggestion" class="nc-input__suggestion" aria-hidden="true"
        ><span class="nc-input__suggestion-typed">{{ model }}</span
        >{{ suggestion }}</span
      >
      <!-- email: tells that Tab fills the suggestion in; screen readers get the
      description instead -->
      <kbd v-if="suggestion" class="nc-input__hint" aria-hidden="true">Tab</kbd>
      <!-- Hidden, and still read as the input's description -->
      <span v-if="suggestsDomains" :id="hintId" hidden>{{
        props.suggestDomainsLabel
      }}</span>
      <input
        v-bind="controlAttrs"
        :id="inputId"
        ref="control"
        class="nc-input__control"
        :value="isPhone ? national : model"
        :type="nativeType"
        :inputmode="props.type === 'number' ? 'numeric' : undefined"
        :name="isPhone ? undefined : props.name"
        :minlength="props.minlength"
        :maxlength="props.maxlength"
        :pattern="props.pattern"
        :placeholder="placeholder"
        :readonly="props.readonly"
        :autocomplete="autocomplete"
        :aria-autocomplete="suggestsDomains ? 'inline' : undefined"
        :aria-describedby="describedBy"
        :data-pointer-focus="pointerFocus || undefined"
        @beforeinput="onBeforeInput"
        @input="onInput"
        @change="onCommit"
        @keydown.enter="onCommit"
        @keydown.tab.exact="acceptSuggestion"
        @pointerdown="pointerFocus = props.readonly"
        @focus="focused = true"
        @blur="onBlur"
      />
      <button
        v-if="isPassword"
        type="button"
        class="nc-input__toggle"
        :aria-label="props.showPasswordLabel"
        :aria-pressed="revealed"
        :aria-controls="inputId"
        :disabled="isDisabled"
        @click="revealed = !revealed"
      >
        <BaseIcon>
          <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            <path v-if="revealed" d="m3 3 18 18" />
          </svg>
        </BaseIcon>
      </button>
    </div>
    <!-- tel: the form sends the whole international number, +32470123456 -->
    <input
      v-if="isPhone"
      type="hidden"
      :name="props.name"
      :value="model"
      :disabled="isDisabled"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  COUNTRIES,
  findCountry,
  flag,
  nationalDigits,
  type Country,
} from '#layers/nuxt-core-primitives/app/data/countries'

// Attributes such as required, disabled and aria-* go to the
// <input>; class and style stay on the root, for the site's layout
defineOptions({ inheritAttrs: false })

// TypeScript's AutoFill is too complex for a prop type, and its field list
// misses some values of the HTML standard, added here
type Autocomplete =
  | AutoFillBase
  | AutoFillField
  | 'bday'
  | 'impp'
  | 'language'
  | 'nickname'
  | 'organization-title'
  | 'photo'
  | 'sex'
  | 'url'

const props = withDefaults(
  defineProps<{
    // number: a text field that takes digits only, with a numeric keyboard; no
    // spinner, and the scroll wheel cannot change it.
    // confirm-password: a password field that must equal `match`.
    // url: a website address, http or https.
    // tel: a country picker and the number; v-model is the whole number.
    type?:
      | 'text'
      | 'email'
      | 'password'
      | 'confirm-password'
      | 'search'
      | 'url'
      | 'tel'
      | 'number'
    minlength?: number
    maxlength?: number
    pattern?: string
    placeholder?: string
    readonly?: boolean
    // What the field asks for, so browsers can fill it in: name, email, tel,
    // postal-code, current-password, new-password, one-time-code, off…
    autocomplete?: Autocomplete
    // confirm-password: the password it must equal
    match?: string
    // confirm-password: the message the browser shows when they differ
    mismatchMessage?: string
    // url: the message the browser shows for a value that is not a website
    invalidUrlMessage?: string
    // tel: the message the browser shows for a number that cannot be one
    invalidPhoneMessage?: string
    // tel: the country it opens on, as an ISO code; the visitor's country by
    // default
    defaultCountry?: string
    // tel: the countries offered, as ISO codes; all of them by default
    countries?: string[]
    // tel: the accessible name of the country button and list
    countryLabel?: string
    // tel: the placeholder and accessible name of the country search
    searchCountryLabel?: string
    // tel: what the list says when the search matches no country
    noCountryLabel?: string
    // tel: the language of the country names, as a BCP 47 tag
    locale?: string
    // password and confirm-password: the name of the show/hide button
    showPasswordLabel?: string
    // floating: the label rests inside the empty field, and moves above it on
    // focus or once filled
    variant?: 'default' | 'floating'
    // border: focus thickens the field's own border; ring: the global focus
    // ring is drawn around it
    focusStyle?: 'ring' | 'border'
    // email: suggests a common domain after what is typed, in grey, which Tab
    // fills in; on by default
    suggestDomains?: boolean
    // email: the description screen readers read for the suggestion
    suggestDomainsLabel?: string
    id?: string
    name: string
    // The accessible name, and the only text the input renders
    label: string
  }>(),
  {
    type: 'text',
    autocomplete: undefined,
    match: undefined,
    mismatchMessage: 'The passwords do not match',
    invalidUrlMessage: 'Enter a website address, such as https://example.com',
    invalidPhoneMessage: 'Enter a valid phone number',
    defaultCountry: undefined,
    countries: undefined,
    countryLabel: 'Country code',
    searchCountryLabel: 'Search a country',
    noCountryLabel: 'No country found',
    locale: 'en',
    showPasswordLabel: 'Show password',
    variant: 'default',
    focusStyle: 'border',
    suggestDomains: true,
    suggestDomainsLabel:
      'Suggests an email domain as you type; Tab fills it in',
  },
)

defineSlots<{
  // A decorative icon at the start of the field; search has a magnifier
  icon?: () => unknown
}>()

const model = defineModel<string>({ default: '' })
const control = useTemplateRef<HTMLInputElement>('control')

const isPassword = computed(
  () => props.type === 'password' || props.type === 'confirm-password',
)
const isPhone = computed(() => props.type === 'tel')
// readonly: focused by a click or a tap rather than the keyboard. Browsers match
// :focus-visible on any focus of a text field, even one that cannot be typed in,
// so CSS alone cannot keep the focus ring for keyboard users only.
const pointerFocus = ref(false)

// A click on the label does not focus the input: only the input itself does.
// The label still names it for screen readers.
const onLabelClick = (event: MouseEvent) => {
  event.preventDefault()
}

// password and confirm-password: shown as text while the toggle is pressed
const revealed = ref(false)

const nativeType = computed(() => {
  if (props.type === 'number') return 'text'
  if (isPassword.value) return revealed.value ? 'text' : 'password'
  return props.type
})

// Hidden again before the form is sent, so the browser never saves the
// password as plain text
const hide = () => {
  revealed.value = false
}
onMounted(() => control.value?.form?.addEventListener('submit', hide))
onBeforeUnmount(() => control.value?.form?.removeEventListener('submit', hide))

const placeholder = computed(() => {
  if (props.placeholder !== undefined) return props.placeholder
  if (props.type === 'url') return 'https://'
  if (suggestsDomains.value) return `name@${DOMAINS[0]}`
  return undefined
})

// A password manager offers the saved password to sign in, and a new one to
// confirm; anything else is left to the browser
const autocomplete = computed<Autocomplete>(() => {
  if (props.autocomplete) return props.autocomplete
  if (props.type === 'password') return 'current-password'
  if (props.type === 'confirm-password') return 'new-password'
  return 'on'
})

// Sanitizing: useSanitize() says which characters are unsafe
const { stripUnsafe, sanitize } = useSanitize()

// Cleans the field with `clean`, which only removes characters, and keeps the
// caret where it was. email has no caret position to keep.
const strip = (input: HTMLInputElement, clean: (value: string) => string) => {
  const value = clean(input.value)
  if (value === input.value) return

  const caret = input.selectionStart
  const kept = caret === null ? null : clean(input.value.slice(0, caret))
  input.value = value
  if (kept !== null) input.setSelectionRange(kept.length, kept.length)
}

// number: refuse a typed character that is not a digit
const onBeforeInput = (event: InputEvent) => {
  if (
    props.type === 'number' &&
    event.inputType === 'insertText' &&
    event.data &&
    /\D/.test(event.data)
  ) {
    event.preventDefault()
  }
}

// What still gets through (a paste, autofill, a drop) is cleaned as it comes:
// number keeps its digits, email and url lose their spaces, and the other types
// lose the unsafe characters. A password is never changed: it must stay exactly
// what the visitor chose.
const onInput = (event: Event) => {
  const input = event.target as HTMLInputElement

  if (isPhone.value) return onPhoneInput(input)

  if (props.type === 'number') {
    strip(input, value => value.replace(/\D/g, ''))
  } else if (props.type === 'email' || props.type === 'url') {
    strip(input, value => stripUnsafe(value).replace(/\s/g, ''))
  } else if (!isPassword.value) strip(input, stripUnsafe)

  model.value = input.value
}

// On change and on Enter rather than while typing, so it never gets in the way,
// and before the form checks the value: the value loses its outer spaces and
// takes the canonical Unicode form, and url gets https:// when it has no scheme,
// so github.com becomes https://github.com.
const onCommit = (event: Event) => {
  if (isPassword.value || props.type === 'number') return
  if ((event as KeyboardEvent).isComposing) return

  const input = event.target as HTMLInputElement
  if (isPhone.value) return onPhoneCommit(input)

  let value = sanitize(input.value)
  if (props.type === 'url') value = withScheme(value)

  if (value !== input.value) {
    input.value = value
    model.value = value
  }
}

// email: the domains suggested after what is typed, the most common first.
// Before the @, the first one is suggested; after it, the first one that starts
// with what follows the @.
const DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
]
const suggestsDomains = computed(
  () => props.type === 'email' && props.suggestDomains && !props.readonly,
)
const focused = ref(false)

const onBlur = () => {
  focused.value = false
  pointerFocus.value = false
}

// What completes the typed value, shown in grey while the input has focus:
// @gmail.com after `ada`, mail.com after `ada@g`; nothing once the domain
// matches none of them, or the value cannot be an address
const suggestion = computed(() => {
  if (!suggestsDomains.value || !focused.value) return ''

  const value = model.value
  const at = value.indexOf('@')
  if (at === -1) return value ? `@${DOMAINS[0]}` : ''
  if (at === 0 || value.includes('@', at + 1)) return ''

  const typed = value.slice(at + 1).toLowerCase()
  const domain = DOMAINS.find(
    domain => domain.startsWith(typed) && domain !== typed,
  )
  return domain ? domain.slice(typed.length) : ''
})

// Tab fills the suggestion in, then moves on as usual. Leaving any other way
// keeps only what was typed, so nothing changes by accident.
const acceptSuggestion = (event: KeyboardEvent) => {
  if (!suggestion.value || event.isComposing) return

  const input = event.target as HTMLInputElement
  input.value = sanitize(input.value + suggestion.value)
  model.value = input.value
}

// url: what the value becomes once it has a scheme
const withScheme = (value: string) =>
  value && !/^[a-z][a-z\d+.-]*:/i.test(value)
    ? `https://${value.replace(/^\/+/, '')}`
    : value

// url: a website, http or https, on a domain with a top-level domain. No
// localhost or IP address, and no user name or password before the host, since
// https://bank.com@evil.com is a common trick to hide where a link goes.
const LABEL = /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i
const TLD = /^(?:[a-z]{2,63}|xn--[a-z\d-]{1,59})$/i
const isWebsite = (value: string) => {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }

  if (!['http:', 'https:'].includes(url.protocol)) return false
  if (url.username || url.password) return false

  const labels = url.hostname.split('.')
  return (
    labels.length > 1 &&
    labels.every(label => LABEL.test(label)) &&
    TLD.test(labels.at(-1)!)
  )
}

// tel: the offered countries, in the order given; the first one is the fallback
const countryList = computed(() =>
  props.countries
    ? props.countries
        .map(code => COUNTRIES.find(country => country.code === code))
        .filter(country => country !== undefined)
    : COUNTRIES,
)
// By name in the input's language
const countryOptions = computed(() =>
  countryList.value
    .map(country => ({
      ...country,
      flag: flag(country.code),
      name: countryName(country.code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, props.locale)),
)

// tel: the country the visitor is in; only looked for when there is a phone
// field on the page
const visitorCountry = isPhone.value
  ? useVisitorCountry()
  : shallowRef<string | undefined>(undefined)

const offered = (code: string | undefined) =>
  code ? countryList.value.find(country => country.code === code) : undefined

// The country it opens on: the site's choice, else the visitor's country, else
// the first one offered (the United States in the full list)
const startCountry = () =>
  offered(props.defaultCountry) ??
  offered(visitorCountry.value) ??
  (props.countries ? countryList.value[0] : offered('US')) ??
  COUNTRIES[0]!

// tel: the picked country, and the number as the visitor typed it
const country = shallowRef<Country>(startCountry())
const national = ref('')

// Once the visitor has typed or picked a country, or the value came from
// v-model, the country found later never replaces theirs
let chosen = false
watch(visitorCountry, () => {
  if (!chosen && !national.value.trim()) country.value = startCountry()
})

// A number written with its calling code, +33 6 12… or 0033 6 12…: its digits,
// its country once the calling code is complete, and what follows the calling
// code, as typed. E.164 calling codes are prefix-free: +25 is no country, so
// none of +250 to +259 is ever mistaken for it; the longest match is the one.
// Countries that share a code (+1, +7, +44…) keep the picked one when it
// matches, then the visitor's.
const parseInternational = (value: string) => {
  const prefix = value.match(/^\s*(\+|00)/)
  if (!prefix) return undefined

  const digits = value.slice(prefix[0].length).replace(/\D/g, '')
  const match = findCountry(digits, countryList.value, [
    country.value.code,
    props.defaultCountry,
    visitorCountry.value,
  ])
  if (!match) return { digits }

  let index = prefix[0].length
  for (let seen = 0; seen < match.country.dial.length; index++) {
    if (/\d/.test(value[index]!)) seen++
  }
  return { digits, country: match.country, rest: value.slice(index).trim() }
}

// The international number, +32470123456, or '' while it has no digits after
// the calling code. A calling code that matches no country is kept as typed,
// +999, and the field is invalid.
const composed = computed(() => {
  const value = national.value.trim()
  const international = parseInternational(value)

  if (international && !international.country) {
    return international.digits ? `+${international.digits}` : ''
  }

  const target = international?.country ?? country.value
  const digits = nationalDigits(international?.rest ?? value, target.code)
  return digits ? `+${target.dial}${digits}` : ''
})

// Shows a number set from outside: v-model, or a reset
const showNumber = (value: string) => {
  const international = parseInternational(value)
  if (value) chosen = true

  if (international?.country) {
    country.value = international.country
    national.value = international.rest
  } else {
    national.value = value
  }
}

watch(
  model,
  value => {
    if (isPhone.value && value !== composed.value) showNumber(value)
  },
  { immediate: true },
)

// The field keeps what the visitor types: digits, the spaces between them, and
// a + at the start. v-model already gets the right number for a calling code
// typed in front (+33…, 0033…), but the flag waits for the visitor to leave the
// field, so nothing moves while they type.
const onPhoneInput = (input: HTMLInputElement) => {
  strip(input, value => value.replace(/[^\d +]|(?<!^\s*)\+/g, ''))
  chosen = true

  national.value = input.value
  model.value = composed.value
}

// On change and on Enter, a number typed with its calling code picks its
// country, and the field keeps what follows the code, which the flag now shows
const onPhoneCommit = (input: HTMLInputElement) => {
  const international = parseInternational(input.value)
  if (!international?.country) return

  country.value = international.country
  input.value = international.rest
  national.value = international.rest
}

// tel: picks a country; the number stays, in the new country
const pickCountry = (code: string) => {
  const international = parseInternational(national.value)
  if (international) {
    national.value = international.rest ?? international.digits
  }

  chosen = true
  country.value = offered(code) ?? country.value
  model.value = composed.value
  closeList()
  control.value?.focus()
}

// tel: the country list. A button opens it, with a search field that filters
// the countries by name, ISO code or calling code, and the arrow keys move
// through them. It follows the combobox pattern of the ARIA practices: the
// focus stays in the search field, and aria-activedescendant names the
// country it is on.
const listOpen = ref(false)
const query = ref('')
const activeCode = ref<string>()
const countryButton = useTemplateRef<HTMLButtonElement>('countryButton')
const countrySearch = useTemplateRef<HTMLInputElement>('countrySearch')
const optionList = useTemplateRef<HTMLUListElement>('optionList')
const listId = `${useId()}-countries`
const optionId = (code: string) => `${listId}-${code}`

const names = computed(
  () => new Intl.DisplayNames([props.locale], { type: 'region' }),
)
const countryName = (code: string) => names.value.of(code) ?? code

// Belgique matches belgique, and Côte d'Ivoire matches cote
const fold = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

// The best matches first: the ISO code, then names that start with the search,
// then calling codes, then names that contain it
const filteredOptions = computed(() => {
  const words = fold(query.value).trim()
  if (!words) return countryOptions.value

  const digits = words.replace(/^\+/, '')
  const rank = (option: (typeof countryOptions.value)[number]) => {
    const name = fold(option.name)
    if (option.code.toLowerCase() === words) return 0
    if (name.startsWith(words)) return 1
    if (/^\d+$/.test(digits) && option.dial.startsWith(digits)) return 2
    if (name.includes(words)) return 3
    return undefined
  }

  return countryOptions.value
    .map(option => ({ option, rank: rank(option) }))
    .filter(match => match.rank !== undefined)
    .sort((a, b) => a.rank! - b.rank!)
    .map(match => match.option)
})

// A new search moves to its best match
watch(query, () => {
  activeCode.value = filteredOptions.value[0]?.code
})

// Scrolls the list alone to show a country. scrollIntoView would also scroll
// the page, and every other scrolling box around the field.
const showOption = (code: string, block: 'nearest' | 'center') => {
  const list = optionList.value
  const option = document.getElementById(optionId(code))
  if (!list || !option) return

  const top =
    option.getBoundingClientRect().top -
    list.getBoundingClientRect().top -
    list.clientTop +
    list.scrollTop
  const bottom = top + option.offsetHeight
  if (block === 'center') {
    list.scrollTop = top - (list.clientHeight - option.offsetHeight) / 2
  } else if (top < list.scrollTop) {
    list.scrollTop = top
  } else if (bottom > list.scrollTop + list.clientHeight) {
    list.scrollTop = bottom - list.clientHeight
  }
}

// Keeps the active country in view as the arrows move
watch(activeCode, async code => {
  if (!code) return
  await nextTick()
  showOption(code, 'nearest')
})

const openList = async () => {
  query.value = ''
  activeCode.value = country.value.code
  listOpen.value = true
  await nextTick()
  countrySearch.value?.focus({ preventScroll: true })
  showOption(country.value.code, 'center')
}

const closeList = () => {
  listOpen.value = false
}

const onButtonKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openList()
  }
}

const moveActive = (step: number) => {
  const options = filteredOptions.value
  if (!options.length) return

  const index = options.findIndex(option => option.code === activeCode.value)
  const next = Math.min(Math.max(index + step, 0), options.length - 1)
  activeCode.value = options[index === -1 ? 0 : next]!.code
}

const onSearchKeydown = (event: KeyboardEvent) => {
  const steps: Record<string, number> = {
    ArrowDown: 1,
    ArrowUp: -1,
    PageDown: 10,
    PageUp: -10,
  }

  if (event.key in steps) {
    event.preventDefault()
    moveActive(steps[event.key]!)
  } else if (event.key === 'Enter') {
    // Never sends the form
    event.preventDefault()
    if (activeCode.value) pickCountry(activeCode.value)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeList()
    countryButton.value?.focus()
  }
}

// Closes once the focus leaves the button and the list: Tab, or a click
// elsewhere on the page
const onPickerFocusOut = (event: FocusEvent) => {
  const picker = event.currentTarget as HTMLElement
  if (!picker.contains(event.relatedTarget as Node | null)) closeList()
}

// The browser blocks the form and shows the message while the value is wrong.
// An empty field is left to `required`.
const validationMessage = computed(() => {
  if (props.type === 'confirm-password') {
    const mismatch = model.value !== '' && model.value !== (props.match ?? '')
    return mismatch ? props.mismatchMessage : ''
  }

  if (props.type === 'url') {
    const value = model.value.trim()
    return value && !isWebsite(withScheme(value)) ? props.invalidUrlMessage : ''
  }

  // E.164: at most 15 digits with the calling code; no country has numbers of
  // fewer than 4 digits after it
  if (isPhone.value && national.value.trim()) {
    const value = national.value.trim()
    const international = parseInternational(value)
    if (international && !international.country) {
      return props.invalidPhoneMessage
    }

    const target = international?.country ?? country.value
    const digits = nationalDigits(international?.rest ?? value, target.code)
    const valid = digits.length >= 4 && target.dial.length + digits.length <= 15
    return valid ? '' : props.invalidPhoneMessage
  }

  return ''
})

watchEffect(() => {
  control.value?.setCustomValidity(validationMessage.value)
})

const slots = useSlots()
const hasIcon = computed(() => props.type === 'search' || !!slots.icon)

const attrs = useAttrs()
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
// A disabled input disables its toggle and its country picker too
const isDisabled = computed(
  () => attrs.disabled !== undefined && attrs.disabled !== false,
)

// Called once in setup, so the id never changes and matches after hydration
const autoId = useId()
const inputId = computed(() => props.id ?? autoId)

// email: the suggestion's description, after the site's own, such as an error
const hintId = computed(() => `${inputId.value}-domains`)
const describedBy = computed(
  () =>
    [attrs['aria-describedby'], suggestsDomains.value && hintId.value]
      .filter(Boolean)
      .join(' ') || undefined,
)
</script>
