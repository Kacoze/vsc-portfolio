import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Validation logic (mirrors postman.ts internal) ────────────────────────

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateForm(name: string, email: string, message: string) {
  const errors: Record<string, string> = {}
  if (!name || name.trim().length < 2) errors.name = 'Name too short'
  if (!email || !emailRe.test(email)) errors.email = 'Invalid email'
  if (!message || message.trim().length < 10) errors.message = 'Message too short'
  return errors
}

describe('contact form validation', () => {
  it('passes with valid data', () => {
    expect(validateForm('Kamil', 'kamil@example.com', 'Hello, this is a test message!')).toEqual({})
  })

  it('rejects empty name', () => {
    const e = validateForm('', 'k@x.com', 'long enough message here')
    expect(e.name).toBeDefined()
  })

  it('rejects single-char name', () => {
    const e = validateForm('K', 'k@x.com', 'long enough message here')
    expect(e.name).toBeDefined()
  })

  it('accepts two-char name', () => {
    const e = validateForm('Ko', 'k@x.com', 'long enough message here')
    expect(e.name).toBeUndefined()
  })

  it('rejects missing email', () => {
    const e = validateForm('Kamil', '', 'long enough message here')
    expect(e.email).toBeDefined()
  })

  it('rejects email without @', () => {
    expect(validateForm('Kamil', 'notanemail', 'long enough msg here').email).toBeDefined()
  })

  it('rejects email without domain', () => {
    expect(validateForm('Kamil', 'a@b', 'long enough msg here').email).toBeDefined()
  })

  it('accepts valid email', () => {
    expect(validateForm('Kamil', 'a@b.pl', 'long enough message here').email).toBeUndefined()
  })

  it('rejects message shorter than 10 chars', () => {
    const e = validateForm('Kamil', 'k@x.com', 'Hi!')
    expect(e.message).toBeDefined()
  })

  it('accepts message of exactly 10 chars', () => {
    const e = validateForm('Kamil', 'k@x.com', '1234567890')
    expect(e.message).toBeUndefined()
  })

  it('returns all three errors for empty form', () => {
    const e = validateForm('', '', '')
    expect(Object.keys(e)).toHaveLength(3)
  })

  it('name with only whitespace is rejected', () => {
    const e = validateForm('   ', 'k@x.com', 'long enough message here')
    expect(e.name).toBeDefined()
  })

  it('name with exactly 2 chars after trim is accepted', () => {
    const e = validateForm(' AB ', 'k@x.com', 'long enough message here')
    expect(e.name).toBeUndefined()
  })

  it('message with 9 chars + surrounding whitespace is rejected (trim → 9 < 10)', () => {
    const e = validateForm('Kamil', 'k@x.com', '  123456789  ')
    expect(e.message).toBeDefined()
  })

  it('message with exactly 10 whitespace chars is rejected', () => {
    const e = validateForm('Kamil', 'k@x.com', '          ')
    expect(e.message).toBeDefined()
  })

  it('email with subdomain is accepted', () => {
    expect(validateForm('Kamil', 'a@mail.example.com', 'long enough message here').email).toBeUndefined()
  })

  it('email with 2-char TLD is accepted', () => {
    expect(validateForm('Kamil', 'a@b.pl', 'long enough message here').email).toBeUndefined()
  })

  it('email with single-char TLD is rejected', () => {
    expect(validateForm('Kamil', 'a@b.c', 'long enough message here').email).toBeDefined()
  })

  it('whitespace-only email is rejected', () => {
    expect(validateForm('Kamil', '   ', 'long enough message here').email).toBeDefined()
  })

  it('all three fields whitespace-only produce 3 errors', () => {
    const e = validateForm(' ', ' ', ' ')
    expect(Object.keys(e)).toHaveLength(3)
  })
})

// ── DOM-based tests (postman.init()) ─────────────────────────────────────

const POSTMAN_HTML = `
<section class="win rest-win">
  <form id="contact-form" novalidate>
    <div class="rest-tabs" role="tablist">
      <div class="rest-tab" data-rtab="params" role="tab" aria-selected="false">Params</div>
      <div class="rest-tab active" data-rtab="body" role="tab" aria-selected="true">Body</div>
      <div class="rest-tab" data-rtab="auth" role="tab" aria-selected="false">Auth</div>
    </div>
    <div class="rest-panel" data-rpanel="params" hidden></div>
    <div class="rest-panel rest-body" data-rpanel="body"></div>
    <div class="rest-panel" data-rpanel="auth" hidden>
      <div class="rest-auth">
        <span class="rest-auth-val">No Auth</span>
      </div>
      <div class="rest-auth-extra"></div>
    </div>
    <div class="field">
      <div class="field-val">
        <input id="f-name" name="name" type="text">
        <span class="field-err" role="alert"></span>
      </div>
    </div>
    <div class="field">
      <div class="field-val">
        <input id="f-email" name="email" type="email">
        <span class="field-err" role="alert"></span>
      </div>
    </div>
    <div class="field">
      <div class="field-val">
        <textarea id="f-msg" name="message"></textarea>
        <span class="field-err" role="alert"></span>
      </div>
    </div>
    <button type="submit" class="rest-send">Send</button>
    <div class="rest-response">
      <div class="resp-head" id="resp-head"></div>
      <span class="status-code" id="resp-status">— idle</span>
      <span id="resp-time"></span>
      <div class="resp-body" id="resp-body"></div>
    </div>
  </form>
</section>`

describe('postman.init() — DOM', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.resetModules()
    document.body.innerHTML = POSTMAN_HTML
    const mod = await import('../../src/postman')
    mod.init()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('tab switching', () => {
    it('clicking params tab shows params panel', () => {
      document.querySelector<HTMLElement>('[data-rtab="params"]')!.click()
      expect(document.querySelector('[data-rpanel="params"]')!.hasAttribute('hidden')).toBe(false)
    })

    it('clicking params tab hides body panel', () => {
      document.querySelector<HTMLElement>('[data-rtab="params"]')!.click()
      expect(document.querySelector('[data-rpanel="body"]')!.hasAttribute('hidden')).toBe(true)
    })

    it('clicking auth tab shows auth panel', () => {
      document.querySelector<HTMLElement>('[data-rtab="auth"]')!.click()
      expect(document.querySelector('[data-rpanel="auth"]')!.hasAttribute('hidden')).toBe(false)
    })

    it('clicked tab gets aria-selected=true', () => {
      const tab = document.querySelector<HTMLElement>('[data-rtab="params"]')!
      tab.click()
      expect(tab.getAttribute('aria-selected')).toBe('true')
    })

    it('other tabs get aria-selected=false after switch', () => {
      document.querySelector<HTMLElement>('[data-rtab="params"]')!.click()
      expect(document.querySelector('[data-rtab="body"]')!.getAttribute('aria-selected')).toBe('false')
    })
  })

  describe('auth type cycling', () => {
    it('clicking auth-val changes label', () => {
      const authVal = document.querySelector<HTMLElement>('.rest-auth-val')!
      authVal.click()
      expect(authVal.textContent).not.toBe('No Auth')
    })

    it('clicking auth-val cycles through types', () => {
      const authVal = document.querySelector<HTMLElement>('.rest-auth-val')!
      authVal.click()
      const first = authVal.textContent
      authVal.click()
      const second = authVal.textContent
      expect(second).not.toBe(first)
    })

    it('clicking auth-val 3 times returns to No Auth', () => {
      const authVal = document.querySelector<HTMLElement>('.rest-auth-val')!
      authVal.click()
      authVal.click()
      authVal.click()
      expect(authVal.textContent).toBe('No Auth')
    })

    it('Bearer Token type adds input to auth-extra', () => {
      document.querySelector<HTMLElement>('.rest-auth-val')!.click()
      expect(document.querySelector('.rest-auth-extra input')).not.toBeNull()
    })
  })

  describe('form submission — validation', () => {
    it('empty form shows validation errors (button stays disabled briefly)', () => {
      const btn = document.querySelector<HTMLButtonElement>('.rest-send')!
      document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      // validation failed → fetch not called, btn stays enabled
      expect(btn.disabled).toBe(false)
    })

    it('name field gets aria-invalid when empty', () => {
      document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      expect(document.getElementById('f-name')!.getAttribute('aria-invalid')).toBe('true')
    })
  })

  describe('form submission — fetch mock', () => {
    it('valid submit calls fetch with POST method and JSON body', async () => {
      vi.stubEnv('VITE_CONTACT_URL', 'https://example.com/contact')
      const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
        json: async () => ({ ok: true }),
      } as Response)

      ;(document.getElementById('f-name') as HTMLInputElement).value = 'Kamil'
      ;(document.getElementById('f-email') as HTMLInputElement).value = 'kamil@example.com'
      ;(document.getElementById('f-msg') as HTMLTextAreaElement).value = 'Hello, this is a test message!'
      document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.com/contact',
        expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
      )
      fetchMock.mockRestore()
      vi.unstubAllEnvs()
    })

    it('valid submit disables button during fetch', () => {
      vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}))

      ;(document.getElementById('f-name') as HTMLInputElement).value = 'Kamil'
      ;(document.getElementById('f-email') as HTMLInputElement).value = 'k@x.com'
      ;(document.getElementById('f-msg') as HTMLTextAreaElement).value = '1234567890ab'
      document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      expect(document.querySelector<HTMLButtonElement>('.rest-send')!.disabled).toBe(true)
    })

    it('successful response shows 200 OK', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: async () => ({ ok: true }),
      } as Response)

      ;(document.getElementById('f-name') as HTMLInputElement).value = 'Kamil'
      ;(document.getElementById('f-email') as HTMLInputElement).value = 'k@example.com'
      ;(document.getElementById('f-msg') as HTMLTextAreaElement).value = '1234567890ab'
      document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await vi.runAllTimersAsync()
      expect(document.getElementById('resp-status')!.textContent).toBe('200 OK')
    })

    it('fetch error shows 500 error', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network error'))

      ;(document.getElementById('f-name') as HTMLInputElement).value = 'Kamil'
      ;(document.getElementById('f-email') as HTMLInputElement).value = 'k@example.com'
      ;(document.getElementById('f-msg') as HTMLTextAreaElement).value = '1234567890ab'
      document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await vi.runAllTimersAsync()
      expect(document.getElementById('resp-status')!.textContent).toBe('500 error')
    })

    it('button re-enabled after successful response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: async () => ({ ok: true }),
      } as Response)

      ;(document.getElementById('f-name') as HTMLInputElement).value = 'Kamil'
      ;(document.getElementById('f-email') as HTMLInputElement).value = 'k@example.com'
      ;(document.getElementById('f-msg') as HTMLTextAreaElement).value = '1234567890ab'
      document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await vi.runAllTimersAsync()
      expect(document.querySelector<HTMLButtonElement>('.rest-send')!.disabled).toBe(false)
    })
  })
})
