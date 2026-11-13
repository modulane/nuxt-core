// @vitest-environment nuxt
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { FormInput } from '#components'

const required = { name: 'email', label: 'Email' }

describe('FormInput', () => {
  it('renders a text input with its hooks by default', async () => {
    const wrapper = await mountSuspended(FormInput, { props: required })
    const input = wrapper.get('input')

    expect(wrapper.classes()).toContain('nc-input')
    expect(input.classes()).toContain('nc-input__control')
    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('name')).toBe('email')
    expect(wrapper.get('label').classes()).toContain('nc-input__label')
  })

  it('links the label to the input', async () => {
    const wrapper = await mountSuspended(FormInput, { props: required })
    const id = wrapper.get('input').attributes('id')

    expect(id).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(id)
    expect(wrapper.get('label').text()).toBe('Email')
  })

  // useId() is unique within one app, and each mount is an app of its own, so
  // both inputs are on the same page here
  it('gives each input its own id', async () => {
    const wrapper = await mountSuspended({
      render: () => [h(FormInput, required), h(FormInput, required)],
    })
    const [first, second] = wrapper.findAll('input')

    expect(first!.attributes('id')).toBeTruthy()
    expect(first!.attributes('id')).not.toBe(second!.attributes('id'))
  })

  it('uses the id it is given', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, id: 'contact-email' },
    })

    expect(wrapper.get('input').attributes('id')).toBe('contact-email')
    expect(wrapper.get('label').attributes('for')).toBe('contact-email')
  })

  it('renders number as a text field with a numeric keyboard', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'number' },
    })
    const input = wrapper.get('input')

    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('inputmode')).toBe('numeric')
  })

  it('passes its constraints to the input, and leaves out unset ones', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, maxlength: 50, placeholder: 'ada@example.com' },
    })
    const input = wrapper.get('input')

    expect(input.attributes('maxlength')).toBe('50')
    expect(input.attributes('placeholder')).toBe('ada@example.com')
    expect(input.attributes('minlength')).toBeUndefined()
    expect(input.attributes('pattern')).toBeUndefined()
    expect(input.attributes('readonly')).toBeUndefined()
  })

  it('lets browsers fill it in, with the value it is given', async () => {
    const byDefault = await mountSuspended(FormInput, { props: required })
    const email = await mountSuspended(FormInput, {
      props: { ...required, autocomplete: 'email' },
    })

    expect(byDefault.get('input').attributes('autocomplete')).toBe('on')
    expect(email.get('input').attributes('autocomplete')).toBe('email')
  })

  it('suggests the saved password, and a new one to confirm', async () => {
    const password = await mountSuspended(FormInput, {
      props: { ...required, type: 'password' },
    })
    const confirmation = await mountSuspended(FormInput, {
      props: { ...required, type: 'confirm-password' },
    })

    expect(password.get('input').attributes('autocomplete')).toBe(
      'current-password',
    )
    expect(confirmation.get('input').attributes('type')).toBe('password')
    expect(confirmation.get('input').attributes('autocomplete')).toBe(
      'new-password',
    )
  })

  it('blocks the form while the confirmation differs from the password', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: {
        ...required,
        type: 'confirm-password',
        match: 'secret',
        modelValue: 'secrte',
      },
    })
    const input = wrapper.get('input').element

    expect(input.validity.customError).toBe(true)
    expect(input.validationMessage).toBe('The passwords do not match')

    await wrapper.setProps({ modelValue: 'secret' })

    expect(input.validity.customError).toBe(false)
  })

  it('leaves an empty confirmation to required', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'confirm-password', match: 'secret' },
    })

    expect(wrapper.get('input').element.validity.customError).toBe(false)
  })

  it('shows its own mismatch message', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: {
        ...required,
        type: 'confirm-password',
        match: 'secret',
        modelValue: 'autre',
        mismatchMessage: 'Les mots de passe ne correspondent pas',
      },
    })

    expect(wrapper.get('input').element.validationMessage).toBe(
      'Les mots de passe ne correspondent pas',
    )
  })

  it('refuses a typed character that is not a digit in number', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'number' },
    })
    const typed = (data: string) => {
      const event = new InputEvent('beforeinput', {
        data,
        inputType: 'insertText',
        cancelable: true,
      })
      wrapper.get('input').element.dispatchEvent(event)
      return event.defaultPrevented
    }

    expect(typed('a')).toBe(true)
    expect(typed('-')).toBe(true)
    expect(typed('7')).toBe(false)
  })

  it('keeps only the digits of a paste in number', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'number' },
    })
    const input = wrapper.get('input')

    await input.setValue('12 34-ab5')

    expect(input.element.value).toBe('12345')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['12345'])
  })

  it('shows https:// as the placeholder of url, unless given one', async () => {
    const url = await mountSuspended(FormInput, {
      props: { ...required, type: 'url' },
    })
    const own = await mountSuspended(FormInput, {
      props: { ...required, type: 'url', placeholder: 'https://example.com' },
    })
    const text = await mountSuspended(FormInput, { props: required })

    expect(url.get('input').attributes('placeholder')).toBe('https://')
    expect(own.get('input').attributes('placeholder')).toBe(
      'https://example.com',
    )
    expect(text.get('input').attributes('placeholder')).toBeUndefined()
  })

  describe('email domain suggestions', () => {
    const email = { ...required, type: 'email' as const }
    const SUGGESTION = '.nc-input__suggestion'

    it('shows name@gmail.com as the placeholder, unless given one', async () => {
      const wrapper = await mountSuspended(FormInput, { props: email })
      const own = await mountSuspended(FormInput, {
        props: { ...email, placeholder: 'you@work.com' },
      })
      const off = await mountSuspended(FormInput, {
        props: { ...email, suggestDomains: false },
      })

      expect(wrapper.get('input').attributes('placeholder')).toBe(
        'name@gmail.com',
      )
      expect(own.get('input').attributes('placeholder')).toBe('you@work.com')
      expect(off.get('input').attributes('placeholder')).toBeUndefined()
    })

    it('suggests a domain after what is typed, while focused', async () => {
      const wrapper = await mountSuspended(FormInput, { props: email })
      const input = wrapper.get('input')

      await input.setValue('ada')
      expect(wrapper.find(SUGGESTION).exists()).toBe(false)

      await input.trigger('focus')
      expect(wrapper.find(SUGGESTION).text()).toBe('ada@gmail.com')
      expect(wrapper.find(SUGGESTION).attributes('aria-hidden')).toBe('true')
      expect(input.attributes('aria-autocomplete')).toBe('inline')

      await input.setValue('ada@o')
      expect(wrapper.find(SUGGESTION).text()).toBe('ada@outlook.com')

      await input.setValue('ada@acme')
      expect(wrapper.find(SUGGESTION).exists()).toBe(false)

      await input.setValue('ada@gmail.com')
      expect(wrapper.find(SUGGESTION).exists()).toBe(false)

      await input.setValue('ada@o')
      await input.trigger('blur')
      expect(wrapper.find(SUGGESTION).exists()).toBe(false)
    })

    it('suggests nothing for an empty value or one that cannot be an address', async () => {
      const wrapper = await mountSuspended(FormInput, { props: email })
      const input = wrapper.get('input')
      await input.trigger('focus')

      for (const value of ['', '@gm', 'a@b@g']) {
        await input.setValue(value)
        expect(wrapper.find(SUGGESTION).exists()).toBe(false)
      }
    })

    it('shows the Tab key while it suggests, and marks the root', async () => {
      const wrapper = await mountSuspended(FormInput, { props: email })
      const input = wrapper.get('input')
      await input.trigger('focus')

      expect(wrapper.find('.nc-input__hint').exists()).toBe(false)
      expect(wrapper.attributes('data-suggesting')).toBeUndefined()

      await input.setValue('ada')
      expect(wrapper.get('.nc-input__hint').text()).toBe('Tab')
      expect(wrapper.get('.nc-input__hint').attributes('aria-hidden')).toBe(
        'true',
      )
      expect(wrapper.attributes('data-suggesting')).toBeDefined()

      await input.setValue('ada@acme')
      expect(wrapper.find('.nc-input__hint').exists()).toBe(false)
    })

    it('describes the suggestion to screen readers, after the site description', async () => {
      const wrapper = await mountSuspended(FormInput, {
        props: email,
        attrs: { 'aria-describedby': 'email-error' },
      })
      const own = await mountSuspended(FormInput, {
        props: { ...email, suggestDomainsLabel: 'Tab complète le domaine' },
      })
      const off = await mountSuspended(FormInput, {
        props: { ...email, suggestDomains: false },
        attrs: { 'aria-describedby': 'email-error' },
      })

      const [error, hint] = wrapper
        .get('input')
        .attributes('aria-describedby')!
        .split(' ')
      expect(error).toBe('email-error')
      const description = wrapper.get(`[id="${hint}"]`)
      expect(description.attributes('hidden')).toBeDefined()
      expect(description.text()).toBe(
        'Suggests an email domain as you type; Tab fills it in',
      )

      const ownHint = own.get('input').attributes('aria-describedby')
      expect(own.get(`[id="${ownHint}"]`).text()).toBe(
        'Tab complète le domaine',
      )

      expect(off.get('input').attributes('aria-describedby')).toBe(
        'email-error',
      )
    })

    it('fills the suggestion in on Tab, not Shift+Tab', async () => {
      const wrapper = await mountSuspended(FormInput, { props: email })
      const input = wrapper.get('input')
      await input.trigger('focus')

      await input.setValue('ada@h')
      await input.trigger('keydown', { key: 'Tab', shiftKey: true })
      expect(input.element.value).toBe('ada@h')

      await input.trigger('keydown', { key: 'Tab' })
      expect(input.element.value).toBe('ada@hotmail.com')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        'ada@hotmail.com',
      ])
    })

    it('suggests nothing when turned off, read-only or not an email', async () => {
      const off = await mountSuspended(FormInput, {
        props: { ...email, suggestDomains: false },
      })
      const readonly = await mountSuspended(FormInput, {
        props: { ...email, readonly: true, modelValue: 'ada' },
      })
      const text = await mountSuspended(FormInput, { props: required })

      for (const wrapper of [off, readonly, text]) {
        const input = wrapper.get('input')
        await input.trigger('focus')
        if (wrapper !== readonly) await input.setValue('ada')
        expect(wrapper.find(SUGGESTION).exists()).toBe(false)
        expect(input.attributes('aria-autocomplete')).toBeUndefined()
      }
    })
  })

  it('adds https:// to a url without a scheme, on change and on Enter', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'url' },
    })
    const input = wrapper.get('input')

    await input.setValue('github.com')
    await input.trigger('change')

    expect(input.element.value).toBe('https://github.com')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      'https://github.com',
    ])

    input.element.value = 'nuxt.com'
    await input.trigger('keydown', { key: 'Enter' })

    expect(input.element.value).toBe('https://nuxt.com')
  })

  it('keeps a url that has a scheme, and an empty one', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'url' },
    })
    const input = wrapper.get('input')

    await input.setValue('http://example.com')
    await input.trigger('change')
    expect(input.element.value).toBe('http://example.com')

    await input.setValue('mailto:ada@example.com')
    await input.trigger('change')
    expect(input.element.value).toBe('mailto:ada@example.com')
    // Kept, but not a website
    expect(input.element.validity.customError).toBe(true)

    await input.setValue('')
    await input.trigger('change')
    expect(input.element.value).toBe('')
  })

  it('accepts a website, with or without its scheme', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'url' },
    })
    const input = wrapper.get('input')
    const valid = async (value: string) => {
      await input.setValue(value)
      return !input.element.validity.customError
    }

    expect(await valid('github.com')).toBe(true)
    expect(await valid('https://www.example.co.uk/path?q=1#top')).toBe(true)
    expect(await valid('http://xn--bcher-kva.example')).toBe(true)
    expect(await valid('')).toBe(true)
  })

  it('refuses a url that is not a website', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'url' },
    })
    const input = wrapper.get('input')
    const invalid = async (value: string) => {
      await input.setValue(value)
      return input.element.validity.customError
    }

    expect(await invalid('example')).toBe(true)
    expect(await invalid('localhost:3000')).toBe(true)
    expect(await invalid('https://192.168.0.1')).toBe(true)
    expect(await invalid('ftp://example.com')).toBe(true)
    expect(await invalid('javascript:alert(1)')).toBe(true)
    expect(await invalid('https://bank.com@evil.com')).toBe(true)
    expect(await invalid('https://-example.com')).toBe(true)
    expect(input.element.validationMessage).toBe(
      'Enter a website address, such as https://example.com',
    )
  })

  it('shows its own invalid url message', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: {
        ...required,
        type: 'url',
        modelValue: 'example',
        invalidUrlMessage: 'Entrez une adresse web',
      },
    })

    expect(wrapper.get('input').element.validationMessage).toBe(
      'Entrez une adresse web',
    )
  })

  it('removes invisible and control characters as they come', async () => {
    const wrapper = await mountSuspended(FormInput, { props: required })
    const input = wrapper.get('input')
    const invisible = String.fromCharCode(0x200b, 0x202e, 0x7)

    await input.setValue(`Ada${invisible} Lovelace`)

    expect(input.element.value).toBe('Ada Lovelace')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      'Ada Lovelace',
    ])
  })

  it('keeps the zero-width joiner of an emoji', async () => {
    const wrapper = await mountSuspended(FormInput, { props: required })
    const input = wrapper.get('input')
    const emoji = String.fromCodePoint(0x1f469, 0x200d, 0x1f4bb)

    await input.setValue(emoji)

    expect(input.element.value).toBe(emoji)
  })

  it('trims the value and normalizes it on change', async () => {
    const wrapper = await mountSuspended(FormInput, { props: required })
    const input = wrapper.get('input')
    // An e followed by a combining acute accent becomes a single é
    const composed = `Ren${String.fromCharCode(0xe9)}`

    await input.setValue(`  Rene${String.fromCharCode(0x301)}  `)
    await input.trigger('change')

    expect(input.element.value).toBe(composed)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([composed])
  })

  it('removes spaces from email and url', async () => {
    const email = await mountSuspended(FormInput, {
      props: { ...required, type: 'email' },
    })
    const url = await mountSuspended(FormInput, {
      props: { ...required, type: 'url' },
    })

    await email.get('input').setValue('ada @example.com ')
    await url.get('input').setValue('git hub.com')

    expect(email.get('input').element.value).toBe('ada@example.com')
    // setValue sends change too, which adds the scheme
    expect(url.get('input').element.value).toBe('https://github.com')
  })

  it('never changes a password', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'password' },
    })
    const input = wrapper.get('input')
    const password = ` p${String.fromCharCode(0x200b)}ss `

    await input.setValue(password)
    await input.trigger('change')

    expect(input.element.value).toBe(password)
  })

  it('leaves the value of other types as it is', async () => {
    const wrapper = await mountSuspended(FormInput, { props: required })
    const input = wrapper.get('input')

    await input.setValue('github.com 12')
    await input.trigger('change')

    expect(input.element.value).toBe('github.com 12')
  })

  it('shows a decorative magnifier in search, and no icon elsewhere', async () => {
    const search = await mountSuspended(FormInput, {
      props: { ...required, type: 'search' },
    })
    const text = await mountSuspended(FormInput, { props: required })
    const icon = search.get('.nc-input__icon')

    expect(icon.classes()).toContain('nc-icon')
    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(icon.find('svg').exists()).toBe(true)
    expect(text.find('.nc-input__icon').exists()).toBe(false)
  })

  it('shows the icon it is given, in any type', async () => {
    const search = await mountSuspended(FormInput, {
      props: { ...required, type: 'search' },
      slots: { icon: () => h('i', { class: 'own' }) },
    })
    const email = await mountSuspended(FormInput, {
      props: required,
      slots: { icon: () => h('i', { class: 'own' }) },
    })

    expect(search.find('.nc-input__icon .own').exists()).toBe(true)
    expect(search.find('.nc-input__icon svg').exists()).toBe(false)
    expect(email.find('.nc-input__icon .own').exists()).toBe(true)
  })

  it('shows and hides a password with a toggle button', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'password' },
    })
    const input = wrapper.get('input')
    const toggle = wrapper.get('.nc-input__toggle')

    expect(toggle.element.tagName).toBe('BUTTON')
    expect(toggle.attributes('type')).toBe('button')
    expect(toggle.attributes('aria-label')).toBe('Show password')
    expect(toggle.attributes('aria-controls')).toBe(input.attributes('id'))
    expect(toggle.attributes('aria-pressed')).toBe('false')
    expect(input.attributes('type')).toBe('password')

    await toggle.trigger('click')

    expect(toggle.attributes('aria-pressed')).toBe('true')
    expect(input.attributes('type')).toBe('text')

    await toggle.trigger('click')

    expect(input.attributes('type')).toBe('password')
  })

  it('gives confirm-password the toggle too, and no other type', async () => {
    const confirmation = await mountSuspended(FormInput, {
      props: { ...required, type: 'confirm-password' },
    })
    const text = await mountSuspended(FormInput, { props: required })

    expect(confirmation.find('.nc-input__toggle').exists()).toBe(true)
    expect(text.find('.nc-input__toggle').exists()).toBe(false)
  })

  it('names the toggle with its own label, and disables it with the input', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: {
        ...required,
        type: 'password',
        showPasswordLabel: 'Afficher le mot de passe',
      },
      attrs: { disabled: true },
    })
    const toggle = wrapper.get('.nc-input__toggle')

    expect(toggle.attributes('aria-label')).toBe('Afficher le mot de passe')
    expect(toggle.attributes('disabled')).toBeDefined()
  })

  it('hides the password again when its form is sent', async () => {
    const form = document.createElement('form')
    document.body.append(form)
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, type: 'password' },
      attachTo: form,
    })

    await wrapper.get('.nc-input__toggle').trigger('click')
    expect(wrapper.get('input').attributes('type')).toBe('text')

    form.dispatchEvent(new Event('submit'))
    await nextTick()

    expect(wrapper.get('input').attributes('type')).toBe('password')
    wrapper.unmount()
    form.remove()
  })

  it('marks a read-only input focused by a pointer, until it loses focus', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, readonly: true },
    })
    const input = wrapper.get('input')

    expect(input.attributes('data-pointer-focus')).toBeUndefined()

    await input.trigger('pointerdown')
    expect(input.attributes('data-pointer-focus')).toBeDefined()

    await input.trigger('blur')
    expect(input.attributes('data-pointer-focus')).toBeUndefined()
  })

  it('does not focus the input from its label', async () => {
    const clickLabel = async (readonly: boolean) => {
      const wrapper = await mountSuspended(FormInput, {
        props: { ...required, readonly },
      })
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      wrapper.get('label').element.dispatchEvent(event)
      return event.defaultPrevented
    }

    expect(await clickLabel(true)).toBe(true)
    expect(await clickLabel(false)).toBe(true)
  })

  it('never marks an editable input focused by a pointer', async () => {
    const wrapper = await mountSuspended(FormInput, { props: required })
    const input = wrapper.get('input')

    await input.trigger('pointerdown')

    expect(input.attributes('data-pointer-focus')).toBeUndefined()
  })

  it('has the default variant unless told otherwise', async () => {
    const byDefault = await mountSuspended(FormInput, { props: required })
    const floating = await mountSuspended(FormInput, {
      props: { ...required, variant: 'floating' },
    })

    expect(byDefault.attributes('data-variant')).toBe('default')
    expect(floating.attributes('data-variant')).toBe('floating')
  })

  it('has the border focus style unless told otherwise', async () => {
    const byDefault = await mountSuspended(FormInput, { props: required })
    const ring = await mountSuspended(FormInput, {
      props: { ...required, focusStyle: 'ring' },
    })

    expect(byDefault.attributes('data-focus-style')).toBe('border')
    expect(ring.attributes('data-focus-style')).toBe('ring')
  })

  it('marks the root while it has a value', async () => {
    const wrapper = await mountSuspended(FormInput, { props: required })

    expect(wrapper.attributes('data-filled')).toBeUndefined()

    await wrapper.get('input').setValue('ada@example.com')
    expect(wrapper.attributes('data-filled')).toBeDefined()

    await wrapper.get('input').setValue('')
    expect(wrapper.attributes('data-filled')).toBeUndefined()
  })

  it('marks the root while it shows an icon', async () => {
    const search = await mountSuspended(FormInput, {
      props: { ...required, type: 'search' },
    })
    const text = await mountSuspended(FormInput, { props: required })

    expect(search.attributes('data-icon')).toBeDefined()
    expect(text.attributes('data-icon')).toBeUndefined()
  })

  it('shows v-model and emits what the user types', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: { ...required, modelValue: 'ada@example.com' },
    })
    const input = wrapper.get('input')

    expect(input.element.value).toBe('ada@example.com')

    await input.setValue('grace@example.com')

    expect(wrapper.emitted('update:modelValue')).toEqual([
      ['grace@example.com'],
    ])
  })

  it('passes attributes to the input, and classes to the root', async () => {
    const wrapper = await mountSuspended(FormInput, {
      props: required,
      attrs: {
        class: 'custom',
        required: true,
        disabled: true,
        'aria-invalid': 'true',
      },
    })
    const input = wrapper.get('input')

    expect(wrapper.classes()).toContain('custom')
    expect(input.classes()).not.toContain('custom')
    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.attributes('required')).toBeUndefined()
  })

  describe('tel', () => {
    // Belgium, so that the tests never depend on where they run
    const phone = {
      name: 'phone',
      label: 'Phone',
      type: 'tel' as const,
      defaultCountry: 'BE',
    }
    const belgium = String.fromCodePoint(0x1f1e7, 0x1f1ea)
    const control = (wrapper: { get: (selector: string) => unknown }) =>
      (wrapper.get('.nc-input__control') as { element: HTMLInputElement })
        .element
    // Types without leaving the field: setValue sends change too, which a
    // browser sends only once the visitor leaves it
    const typeIn = async (
      wrapper: Awaited<ReturnType<typeof mountSuspended>>,
      value: string,
    ) => {
      control(wrapper).value = value
      await wrapper.get('.nc-input__control').trigger('input')
    }

    it('opens on its default country, with its flag and calling code', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })
      const button = wrapper.get('.nc-input__country-button')

      expect(wrapper.attributes('data-country')).toBe('BE')
      expect(button.attributes('type')).toBe('button')
      expect(button.attributes('aria-label')).toBe(
        'Country code: Belgium (+32)',
      )
      expect(button.attributes('aria-haspopup')).toBe('listbox')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(button.get('.nc-input__country-flag').text()).toBe(belgium)
      expect(button.get('.nc-input__country-dial').text()).toBe('+32')
      expect(button.find('.nc-input__country-chevron svg').exists()).toBe(true)
      expect(wrapper.find('.nc-input__country-list').exists()).toBe(false)
      expect(wrapper.get('.nc-input__control').attributes('type')).toBe('tel')
    })

    describe("the visitor's country", () => {
      const visitor = () => useState<string | undefined>('nc-visitor-country')
      afterEach(() => {
        visitor().value = undefined
      })

      it('opens on it without a default country', async () => {
        visitor().value = 'NL'
        const wrapper = await mountSuspended(FormInput, {
          props: { name: 'phone', label: 'Phone', type: 'tel' },
        })

        expect(wrapper.attributes('data-country')).toBe('NL')
      })

      it('moves to it once found, until the visitor types or picks', async () => {
        visitor().value = 'NL'
        const untouched = await mountSuspended(FormInput, {
          props: { name: 'phone', label: 'Phone', type: 'tel' },
        })
        const typed = await mountSuspended(FormInput, {
          props: { name: 'phone', label: 'Phone', type: 'tel' },
        })
        await typed.get('.nc-input__control').setValue('0612')

        visitor().value = 'DE'
        await nextTick()

        expect(untouched.attributes('data-country')).toBe('DE')
        expect(typed.attributes('data-country')).toBe('NL')
      })

      it('gives way to the default country', async () => {
        visitor().value = 'NL'
        const wrapper = await mountSuspended(FormInput, { props: phone })

        expect(wrapper.attributes('data-country')).toBe('BE')
      })

      it('is skipped when not offered', async () => {
        visitor().value = 'US'
        const wrapper = await mountSuspended(FormInput, {
          props: {
            name: 'phone',
            label: 'Phone',
            type: 'tel',
            countries: ['LU', 'BE'],
          },
        })

        expect(wrapper.attributes('data-country')).toBe('LU')
      })
    })

    // Opens the country list, attached to the page so that focus works
    const openList = async () => {
      const wrapper = await mountSuspended(FormInput, {
        props: phone,
        attachTo: document.body,
      })
      await wrapper.get('.nc-input__country-button').trigger('click')
      await nextTick()
      return wrapper
    }
    const options = (wrapper: Awaited<ReturnType<typeof openList>>) =>
      wrapper.findAll('[role="option"]')
    const key = async (
      wrapper: Awaited<ReturnType<typeof openList>>,
      name: string,
    ) => {
      await wrapper.get('.nc-input__country-search').trigger('keydown', {
        key: name,
      })
      await nextTick()
    }

    it('lists the countries, with their flag, name and calling code', async () => {
      const wrapper = await openList()
      const belgium = wrapper.get('[role="option"][aria-selected="true"]')

      expect(belgium.get('.nc-input__country-name').text()).toBe('Belgium')
      expect(belgium.get('.nc-input__country-dial').text()).toBe('+32')
      expect(options(wrapper).length).toBeGreaterThan(200)
      wrapper.unmount()
    })

    it('opens its list with a search field that takes the focus', async () => {
      const wrapper = await openList()
      const button = wrapper.get('.nc-input__country-button')
      const search = wrapper.get('.nc-input__country-search')
      const list = wrapper.get('[role="listbox"]')

      expect(button.attributes('aria-expanded')).toBe('true')
      expect(button.attributes('aria-controls')).toBe(list.attributes('id'))
      expect(document.activeElement).toBe(search.element)
      expect(search.attributes('role')).toBe('combobox')
      expect(search.attributes('aria-controls')).toBe(list.attributes('id'))
      expect(search.attributes('aria-label')).toBe('Search a country')
      // On the picked country
      expect(search.attributes('aria-activedescendant')).toBe(
        wrapper.get('[aria-selected="true"]').attributes('id'),
      )
      wrapper.unmount()
    })

    it('opens its list with the arrow keys too', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })

      await wrapper
        .get('.nc-input__country-button')
        .trigger('keydown', { key: 'ArrowDown' })

      expect(wrapper.find('.nc-input__country-list').exists()).toBe(true)
    })

    it('searches by name, without accents, by ISO code and by calling code', async () => {
      const wrapper = await openList()
      const search = wrapper.get('.nc-input__country-search')
      const names = () =>
        options(wrapper).map(option =>
          option.get('.nc-input__country-name').text(),
        )

      await search.setValue('bel')
      expect(names()).toEqual(['Belarus', 'Belgium', 'Belize'])

      await search.setValue('cote')
      expect(names()).toEqual(['Côte d’Ivoire'])

      // The ISO code first, then the names that contain it
      await search.setValue('nl')
      expect(names()[0]).toBe('Netherlands')
      expect(names()).toContain('Finland')

      // Names that start with the search first
      await search.setValue('nether')
      expect(names()).toEqual(['Netherlands', 'Caribbean Netherlands'])

      await search.setValue('+35')
      expect(names()).toContain('Luxembourg')
      expect(names()).not.toContain('Belgium')
      wrapper.unmount()
    })

    it('says when no country matches', async () => {
      const wrapper = await openList()
      const empty = wrapper.get('.nc-input__country-empty')

      expect(empty.text()).toBe('')
      expect(empty.attributes('role')).toBe('status')

      await wrapper.get('.nc-input__country-search').setValue('zzz')

      expect(options(wrapper)).toHaveLength(0)
      expect(empty.text()).toBe('No country found')
      wrapper.unmount()
    })

    it('picks a country with the arrows and Enter, then focuses the number', async () => {
      const wrapper = await openList()
      const search = wrapper.get('.nc-input__country-search')

      await search.setValue('bel')
      expect(search.attributes('aria-activedescendant')).toBe(
        options(wrapper)[0]!.attributes('id'),
      )

      await key(wrapper, 'ArrowDown')
      expect(options(wrapper)[1]!.attributes('data-active')).toBeDefined()

      await key(wrapper, 'ArrowDown')
      await key(wrapper, 'ArrowDown')
      await key(wrapper, 'ArrowUp')
      await key(wrapper, 'Enter')

      expect(wrapper.attributes('data-country')).toBe('BE')
      expect(wrapper.find('.nc-input__country-list').exists()).toBe(false)
      expect(document.activeElement).toBe(control(wrapper))
      wrapper.unmount()
    })

    it('picks a country with a click', async () => {
      const wrapper = await openList()

      await wrapper.get('.nc-input__country-search').setValue('nether')
      await options(wrapper)[0]!.trigger('click')

      expect(wrapper.attributes('data-country')).toBe('NL')
      wrapper.unmount()
    })

    it('closes on Escape, back on its button, without picking', async () => {
      const wrapper = await openList()

      await key(wrapper, 'ArrowDown')
      await key(wrapper, 'Escape')

      expect(wrapper.find('.nc-input__country-list').exists()).toBe(false)
      expect(wrapper.attributes('data-country')).toBe('BE')
      expect(document.activeElement).toBe(
        wrapper.get('.nc-input__country-button').element,
      )
      wrapper.unmount()
    })

    it('closes once the focus leaves it', async () => {
      const wrapper = await openList()

      await wrapper
        .get('.nc-input__country')
        .trigger('focusout', { relatedTarget: document.body })

      expect(wrapper.find('.nc-input__country-list').exists()).toBe(false)
      wrapper.unmount()
    })

    it('offers only the countries it is given, named in its locale', async () => {
      const wrapper = await mountSuspended(FormInput, {
        props: {
          ...phone,
          countries: ['FR', 'BE', 'NL'],
          defaultCountry: 'FR',
          locale: 'fr',
        },
      })
      await wrapper.get('.nc-input__country-button').trigger('click')
      const names = wrapper
        .findAll('.nc-input__country-name')
        .map(name => name.text())

      expect(names).toEqual(['Belgique', 'France', 'Pays-Bas'])
      expect(wrapper.attributes('data-country')).toBe('FR')
    })

    it('emits the international number, without the leading 0', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })

      await wrapper.get('.nc-input__control').setValue('0470 12 34 56')

      expect(control(wrapper).value).toBe('0470 12 34 56')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        '+32470123456',
      ])
    })

    it('keeps the leading 0 where the number needs it', async () => {
      const wrapper = await mountSuspended(FormInput, {
        props: { ...phone, defaultCountry: 'IT' },
      })

      await wrapper.get('.nc-input__control').setValue('06 1234 5678')

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        '+390612345678',
      ])
    })

    it('keeps only digits, spaces and a + at the start', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })
      const input = wrapper.get('.nc-input__control')

      await input.setValue('0470-12.34 ab(56)+')
      expect(control(wrapper).value).toBe('04701234 56')

      await typeIn(wrapper, ' +32 470+12')
      expect(control(wrapper).value).toBe(' +32 47012')
    })

    it('sends the international number with the form', async () => {
      const wrapper = await mountSuspended(FormInput, {
        props: { ...phone, modelValue: '+32470123456' },
      })
      const hidden = wrapper.get('input[type="hidden"]')

      expect(hidden.attributes('name')).toBe('phone')
      expect((hidden.element as HTMLInputElement).value).toBe('+32470123456')
      expect(
        wrapper.get('.nc-input__control').attributes('name'),
      ).toBeUndefined()
    })

    it('picks the country of a calling code once the visitor leaves', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })
      const type = async (text: string) => {
        for (const character of text) {
          await typeIn(wrapper, control(wrapper).value + character)
        }
      }

      await type('+33 6 12 34 56 78')

      // Nothing moves while typing, but v-model is already right
      expect(wrapper.attributes('data-country')).toBe('BE')
      expect(control(wrapper).value).toBe('+33 6 12 34 56 78')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        '+33612345678',
      ])

      await wrapper.get('.nc-input__control').trigger('change')

      expect(wrapper.attributes('data-country')).toBe('FR')
      expect(control(wrapper).value).toBe('6 12 34 56 78')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        '+33612345678',
      ])
    })

    it('picks it on Enter too', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })

      await typeIn(wrapper, '+31 6 12345678')
      await wrapper
        .get('.nc-input__control')
        .trigger('keydown', { key: 'Enter' })

      expect(wrapper.attributes('data-country')).toBe('NL')
    })

    it('waits for the whole calling code: +25 is none, +255 is Tanzania', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })
      const input = wrapper.get('.nc-input__control')

      await input.setValue('+25')
      expect(wrapper.attributes('data-country')).toBe('BE')
      expect(control(wrapper).validity.customError).toBe(true)

      await input.setValue('+255')
      expect(wrapper.attributes('data-country')).toBe('TZ')

      await input.setValue('+250')
      expect(wrapper.attributes('data-country')).toBe('RW')
    })

    it('moves from +1 to the country of its area code', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })
      const input = wrapper.get('.nc-input__control')

      await input.setValue('+1')
      expect(wrapper.attributes('data-country')).toBe('US')

      await input.setValue('+187')
      expect(wrapper.attributes('data-country')).toBe('US')

      await input.setValue('+1876 555 1234')
      expect(wrapper.attributes('data-country')).toBe('JM')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        '+18765551234',
      ])
    })

    it('keeps the picked country among those that share a code', async () => {
      const wrapper = await mountSuspended(FormInput, {
        props: { ...phone, defaultCountry: 'CA' },
      })

      await wrapper.get('.nc-input__control').setValue('+1 416 555 0123')

      expect(wrapper.attributes('data-country')).toBe('CA')
    })

    it('reads 00 as the start of a calling code', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })

      await wrapper.get('.nc-input__control').setValue('0044 7911 123456')

      expect(wrapper.attributes('data-country')).toBe('GB')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        '+447911123456',
      ])
    })

    it('drops a 0 written after the calling code', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })

      await wrapper.get('.nc-input__control').setValue('+32 0470 12 34 56')

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        '+32470123456',
      ])
    })

    it('keeps what follows the calling code on change', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })
      const input = wrapper.get('.nc-input__control')

      control(wrapper).value = '+33 6 12 34 56 78'
      await input.trigger('input')
      await input.trigger('change')

      expect(control(wrapper).value).toBe('6 12 34 56 78')
      expect(wrapper.attributes('data-country')).toBe('FR')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        '+33612345678',
      ])
    })

    it('shows a number set from v-model in its country', async () => {
      const wrapper = await mountSuspended(FormInput, {
        props: { ...phone, modelValue: '+18765551234' },
      })

      expect(wrapper.attributes('data-country')).toBe('JM')
      expect(control(wrapper).value).toBe('5551234')

      await wrapper.setProps({ modelValue: '+12025550123' })
      expect(wrapper.attributes('data-country')).toBe('US')
      expect(control(wrapper).value).toBe('2025550123')

      await wrapper.setProps({ modelValue: '' })
      expect(control(wrapper).value).toBe('')
    })

    it('keeps the number in the newly picked country', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })

      await wrapper.get('.nc-input__control').setValue('612345678')
      await wrapper.get('.nc-input__country-button').trigger('click')
      await wrapper.get('.nc-input__country-search').setValue('nether')
      await wrapper.get('[role="option"]').trigger('click')

      expect(wrapper.attributes('data-country')).toBe('NL')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        '+31612345678',
      ])
    })

    it('refuses a number too short or too long', async () => {
      const wrapper = await mountSuspended(FormInput, { props: phone })
      const input = wrapper.get('.nc-input__control')
      const invalid = async (value: string) => {
        await input.setValue(value)
        return control(wrapper).validity.customError
      }

      expect(await invalid('047')).toBe(true)
      expect(await invalid('1234567890123456')).toBe(true)
      expect(await invalid('+999 1234')).toBe(true)
      expect(control(wrapper).validationMessage).toBe(
        'Enter a valid phone number',
      )
      expect(await invalid('0470 12 34 56')).toBe(false)
      expect(await invalid('+33 6 12 34 56 78')).toBe(false)
      expect(await invalid('')).toBe(false)
    })

    it('disables its country picker with the input, and when read-only', async () => {
      const disabled = await mountSuspended(FormInput, {
        props: phone,
        attrs: { disabled: true },
      })
      const readonly = await mountSuspended(FormInput, {
        props: { ...phone, readonly: true },
      })

      expect(
        disabled.get('.nc-input__country-button').attributes('disabled'),
      ).toBeDefined()
      expect(
        disabled.get('input[type="hidden"]').attributes('disabled'),
      ).toBeDefined()
      expect(
        readonly.get('.nc-input__country-button').attributes('disabled'),
      ).toBeDefined()
    })

    it('has no country picker in other types', async () => {
      const wrapper = await mountSuspended(FormInput, { props: required })

      expect(wrapper.find('.nc-input__country').exists()).toBe(false)
      expect(wrapper.attributes('data-country')).toBeUndefined()
    })
  })
})
