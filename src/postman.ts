interface AuthType {
  label: string
  extra: string
}

const SUCCESS_HTML = `<pre><span class="p">{</span>
  <span class="k">"ok"</span><span class="p">: </span><span class="b">true</span><span class="p">,</span>
  <span class="k">"message"</span><span class="p">: </span><span class="v">"delivered — reply follows"</span>
<span class="p">}</span></pre>`

const ERROR_HTML = `<pre><span class="p">{</span>
  <span class="k">"ok"</span><span class="p">: </span><span class="b">false</span><span class="p">,</span>
  <span class="k">"message"</span><span class="p">: </span><span class="v">"delivery failed — try linkedin"</span>
<span class="p">}</span></pre>`

export function init(): void {
  const restWin = document.querySelector<HTMLElement>('.rest-win')
  if (!restWin) return

  // Tab switching
  restWin.querySelectorAll<HTMLElement>('[data-rtab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.rtab!
      restWin.querySelectorAll<HTMLElement>('[data-rtab]').forEach(t => {
        t.classList.toggle('active', t.dataset.rtab === key)
        t.setAttribute('aria-selected', t.dataset.rtab === key ? 'true' : 'false')
      })
      restWin.querySelectorAll<HTMLElement>('[data-rpanel]').forEach(p => {
        if (p.dataset.rpanel === key) p.removeAttribute('hidden')
        else p.setAttribute('hidden', '')
      })
    })
  })

  // Contact form
  const form = document.getElementById('contact-form') as HTMLFormElement | null
  if (form) {
    const respHead   = document.getElementById('resp-head')!
    const respStatus = document.getElementById('resp-status')!
    const respTime   = document.getElementById('resp-time')!
    const respBody   = document.getElementById('resp-body')!

    const fieldOf = (el: HTMLElement): HTMLElement | null =>
      el.closest<HTMLElement>('.field')

    const setErr = (f: HTMLElement, msg: string): void => {
      const wrapper = fieldOf(f)
      if (wrapper) wrapper.dataset.err = '1'
      const errEl = wrapper?.querySelector<HTMLElement>('.field-err')
      if (errEl) errEl.textContent = msg
      f.setAttribute('aria-invalid', 'true')
    }

    const clrErr = (f: HTMLElement): void => {
      const wrapper = fieldOf(f)
      if (wrapper) delete wrapper.dataset.err
      const errEl = wrapper?.querySelector<HTMLElement>('.field-err')
      if (errEl) errEl.textContent = ''
      f.removeAttribute('aria-invalid')
    }

    const validEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

    const nF = form.elements.namedItem('name')    as HTMLInputElement
    const eF = form.elements.namedItem('email')   as HTMLInputElement
    const mF = form.elements.namedItem('message') as HTMLTextAreaElement

    ;[nF, eF, mF].forEach(f => f.addEventListener('input', () => clrErr(f)))

    form.addEventListener('submit', e => {
      e.preventDefault()
      const btn = form.querySelector<HTMLButtonElement>('.rest-send')!
      const n  = nF.value.trim()
      const em = eF.value.trim()
      const m  = mF.value.trim()
      let ok = true

      if (!n)           { setErr(nF, 'required');       ok = false }
      else if (n.length < 2) { setErr(nF, 'min 2 characters'); ok = false }

      if (!em)              { setErr(eF, 'required');     ok = false }
      else if (!validEmail(em)) { setErr(eF, 'invalid email'); ok = false }

      if (!m)            { setErr(mF, 'required');          ok = false }
      else if (m.length < 10) { setErr(mF, 'min 10 characters'); ok = false }

      if (!ok) return

      btn.disabled = true
      const origLabel = btn.innerHTML
      btn.innerHTML = 'Sending…'
      respHead.className = 'resp-head'
      respStatus.textContent = '— sending'
      respTime.textContent = ''
      respBody.classList.remove('visible')

      const t0 = performance.now()

      const resetBtn = (): void => {
        btn.disabled = false
        btn.innerHTML = origLabel
      }

      const showSuccess = (): void => {
        const elapsed = Math.round(performance.now() - t0)
        respHead.className = 'resp-head ok'
        respStatus.textContent = '200 OK'
        respTime.textContent = elapsed + 'ms'
        respBody.innerHTML = SUCCESS_HTML
        respBody.classList.add('visible')
        form.reset()
      }

      const showError = (): void => {
        const elapsed = Math.round(performance.now() - t0)
        respHead.className = 'resp-head err'
        respStatus.textContent = '500 error'
        respTime.textContent = elapsed + 'ms'
        respBody.innerHTML = ERROR_HTML
        respBody.classList.add('visible')
      }

      fetch(import.meta.env.VITE_CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, email: em, message: m }),
      })
        .then(r => r.json())
        .then(showSuccess)
        .catch(showError)
        .finally(resetBtn)
    })
  }

  // Auth type cycling
  const authVal   = restWin.querySelector<HTMLElement>('.rest-auth-val')
  const authExtra = restWin.querySelector<HTMLElement>('.rest-auth-extra')

  if (authVal && authExtra) {
    const authTypes: readonly AuthType[] = [
      { label: 'No Auth',      extra: '' },
      { label: 'Bearer Token', extra: '<input class="sb-search" style="width:100%;margin:8px 0 0" placeholder="Token…" type="text" aria-label="Bearer token">' },
      { label: 'Basic Auth',   extra: '<input class="sb-search" style="width:100%;margin:8px 0 0" placeholder="Username" type="text" aria-label="Username"><input class="sb-search" style="width:100%;margin:4px 0 0" placeholder="Password" type="password" aria-label="Password">' },
    ]
    let authIdx = 0
    authVal.addEventListener('click', () => {
      authIdx = (authIdx + 1) % authTypes.length
      authVal.textContent = authTypes[authIdx].label
      authExtra.innerHTML = authTypes[authIdx].extra
    })
  }

  // Run tests button
  const runBtn = document.getElementById('run-tests-btn') as HTMLButtonElement | null
  const results = document.getElementById('rest-test-results')

  if (runBtn && results) {
    interface TestCase { name: string; pass: boolean; t: number }
    const tests: readonly TestCase[] = [
      { name: 'Status is 200',       pass: true, t: 42 },
      { name: 'Response has ok:true', pass: true, t: 11 },
    ]

    runBtn.addEventListener('click', () => {
      results.innerHTML = ''
      runBtn.disabled = true
      runBtn.textContent = '⟳ Running…'
      let delay = 0

      tests.forEach(tc => {
        delay += 300 + Math.random() * 200
        setTimeout(() => {
          const line = document.createElement('div')
          const icon = tc.pass ? '<span class="rtr-pass">✓ PASS</span>' : '<span class="rtr-fail">✗ FAIL</span>'
          line.innerHTML = `${icon} <span style="color:var(--fg)">${tc.name}</span> <span style="color:var(--fg-subtle);font-size:11px">${tc.t}ms</span>`
          results.appendChild(line)
        }, delay)
      })

      setTimeout(() => {
        const sum = document.createElement('div')
        sum.className = 'rtr-sum'
        sum.textContent = `2 passing (${Math.round(delay + 50)}ms)`
        results.appendChild(sum)
        runBtn.disabled = false
        runBtn.textContent = '▶ Run Tests'
      }, delay + 400)
    })
  }
}
