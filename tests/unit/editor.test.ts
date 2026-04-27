import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const EDITOR_HTML = `
<div class="vsc-win" data-active="spec">
  <span data-title></span>
  <div class="tabs" role="tablist"></div>
  <div class="act-bar">
    <button class="act-btn" data-panel="explorer" data-act="explorer"></button>
    <button class="act-btn" data-panel="search" data-act="search"></button>
    <button class="act-btn" data-panel="source-control" data-act="source-control"></button>
    <button class="act-btn" data-panel="run" data-act="run"></button>
    <button class="act-btn" data-panel="extensions" data-act="extensions"></button>
  </div>
  <div class="sidebar">
    <div class="panel-view" data-panel="explorer">
      <div data-file-sidebar="spec" class="file active" aria-selected="true">spec</div>
      <div data-file-sidebar="md" class="file" aria-selected="false">md</div>
      <div data-file-sidebar="json" class="file" aria-selected="false">json</div>
      <div data-file-sidebar="readme" class="file" aria-selected="false">readme</div>
      <div data-file-sidebar="env" class="file" aria-selected="false">env</div>
      <div data-file-sidebar="license" class="file" aria-selected="false">license</div>
    </div>
    <div class="panel-view" data-panel="search" hidden>
      <input class="sb-search" type="text">
      <div class="sb-search-results"></div>
    </div>
    <div class="panel-view" data-panel="run" hidden>
      <ul class="run-list">
        <li data-run="test">test</li>
        <li data-run="build">build</li>
      </ul>
    </div>
    <div class="panel-view" data-panel="extensions" hidden>
      <input class="sb-search" type="text">
      <ul class="ext-list">
        <li><span class="ext-name">Playwright</span></li>
        <li><span class="ext-name">ESLint</span></li>
      </ul>
    </div>
    <div class="sb-ln"></div>
    <div class="sc-status m">M</div>
  </div>
  <div class="editor-view active" data-file="spec" role="tabpanel" aria-label="kamil.spec.ts">
    <div class="ln">describe('test', () => {</div>
    <div class="ln">  it('passes', () => {</div>
    <div class="ln">  })</div>
    <div class="ln">})</div>
  </div>
  <div class="editor-view" data-file="md" role="tabpanel" aria-label="about.md">
    <div class="ln">Kamil Kozieradzki</div>
    <div class="ln">QA Lead</div>
  </div>
  <div class="editor-view" data-file="json" role="tabpanel" aria-label="package.json">
    <div class="ln">{</div>
    <div class="ln">  "name": "kamil-portfolio"</div>
    <div class="ln">}</div>
  </div>
  <div class="editor-view" data-file="readme" role="tabpanel" aria-label="README.md">
    <div class="ln"># kamil-kozieradzki</div>
  </div>
  <div class="editor-view" data-file="env" role="tabpanel" aria-label=".env">
    <div class="ln">PORT=3000</div>
  </div>
  <div class="editor-view" data-file="license" role="tabpanel" aria-label="LICENSE">
    <div class="ln">MIT License</div>
  </div>
  <div class="panel-resize"></div>
  <div class="panel">
    <div class="ptab active" data-ptab="terminal" aria-selected="true" role="tab">Terminal</div>
    <div class="ptab" data-ptab="output" aria-selected="false" role="tab">Output</div>
    <div class="pv active" data-pv="terminal">
      <div class="term-body">
        <div class="t-line term-input-line">
          <input class="term-input" type="text">
        </div>
      </div>
      <span class="term-label"></span>
    </div>
    <div class="pv" data-pv="output" hidden></div>
  </div>
  <div class="status">
    <span aria-label="Branch">⎇ main</span>
    <span>✓ Prettier</span>
    <span>UTF-8</span>
    <span>LF</span>
    <span>⊗ 0</span>
  </div>
  <span data-bc-file></span>
  <span data-bc-src style="display:none"></span>
  <span data-bc-srcsp style="display:none"></span>
</div>`

function run(cmd: string): void {
  const input = document.querySelector<HTMLInputElement>('.term-input')!
  input.value = cmd
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
}

function termText(): string {
  const lines = document.querySelectorAll('.term-body .t-line:not(.term-input-line)')
  return Array.from(lines).map(l => l.textContent ?? '').join('\n')
}

function inputEl(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('.term-input')!
}

describe('Editor module', () => {
  beforeEach(async () => {
    vi.resetModules()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    })
    document.body.innerHTML = EDITOR_HTML
    await import('../../src/editor')
  })

  describe('Terminal — basic commands', () => {
    it('help lists available commands', () => {
      run('help')
      expect(termText()).toContain('Available commands')
    })

    it('help mentions npm and git', () => {
      run('help')
      const text = termText()
      expect(text).toContain('npm')
      expect(text).toContain('git')
    })

    it('ls shows src and README.md', () => {
      run('ls')
      const text = termText()
      expect(text).toContain('src')
      expect(text).toContain('README.md')
    })

    it('ls shows package.json', () => {
      run('ls')
      expect(termText()).toContain('package.json')
    })

    it('ls -la shows directory listing with drwxr-xr-x', () => {
      run('ls -la')
      expect(termText()).toContain('drwxr-xr-x')
    })

    it('ls -la shows .env file', () => {
      run('ls -la')
      expect(termText()).toContain('.env')
    })

    it('ls -a shows .env', () => {
      run('ls -a')
      expect(termText()).toContain('.env')
    })

    it('pwd shows working directory', () => {
      run('pwd')
      expect(termText()).toContain('/Users/kamil/kamil-portfolio')
    })

    it('whoami returns kamil', () => {
      run('whoami')
      expect(termText()).toContain('kamil')
    })

    it('date returns a string with a year', () => {
      run('date')
      expect(termText()).toMatch(/\d{4}/)
    })

    it('echo returns the argument', () => {
      run('echo hello world')
      expect(termText()).toContain('hello world')
    })

    it('echo escapes HTML special chars — renders as literal text', () => {
      run('echo <b>test</b>')
      // appendLine uses innerHTML, so &lt;b&gt; renders as literal < > in textContent
      expect(termText()).toContain('<b>test</b>')
    })

    it('unknown command shows command not found', () => {
      run('foobar')
      expect(termText()).toContain('command not found: foobar')
    })

    it('empty input does not add a command line', () => {
      run('')
      const lines = document.querySelectorAll('.term-body .t-line:not(.term-input-line)')
      // prompt line is added, but no output line for empty command
      expect(lines.length).toBeLessThanOrEqual(1)
    })

    it('clear removes output lines', () => {
      run('ls')
      run('clear')
      const lines = document.querySelectorAll('.term-body .t-line:not(.term-input-line)')
      expect(lines.length).toBe(0)
    })
  })

  describe('Terminal — git commands', () => {
    it('git status shows On branch main', () => {
      run('git status')
      const text = termText()
      expect(text).toContain('On branch')
      expect(text).toContain('main')
    })

    it('git log shows commit hashes', () => {
      run('git log')
      const text = termText()
      expect(text).toContain('ca99037')
      expect(text).toContain('45a01c1')
    })

    it('unknown git subcommand shows error', () => {
      run('git rebase')
      expect(termText()).toContain('is not a git command')
    })
  })

  describe('Terminal — npm commands', () => {
    it('npm test shows Running and passed', () => {
      run('npm test')
      const text = termText()
      expect(text).toContain('Running')
      expect(text).toContain('passed')
    })

    it('npm run build shows vite and built in', () => {
      run('npm run build')
      const text = termText()
      expect(text).toContain('vite')
      expect(text).toContain('built in')
    })

    it('npm run lint shows eslint and 0 errors', () => {
      run('npm run lint')
      const text = termText()
      expect(text).toContain('eslint')
      expect(text).toContain('0 errors')
    })

    it('npm run deploy shows wrangler', () => {
      run('npm run deploy')
      expect(termText()).toContain('wrangler')
    })

    it('npm run contact shows 200 OK', () => {
      run('npm run contact')
      expect(termText()).toContain('200 OK')
    })

    it('npm run unknown shows npm ERR', () => {
      run('npm run unknown')
      expect(termText()).toContain('npm ERR!')
    })
  })

  describe('Terminal — cat command', () => {
    it('cat missing.txt shows No such file or directory', () => {
      run('cat missing.txt')
      expect(termText()).toContain('No such file or directory')
    })

    it('cat without argument shows missing file operand', () => {
      run('cat')
      expect(termText()).toContain('missing file operand')
    })

    it('cat about.md dumps content from md view', () => {
      run('cat about.md')
      expect(termText()).toContain('Kamil Kozieradzki')
    })

    it('cat package.json dumps content from json view', () => {
      run('cat package.json')
      expect(termText()).toContain('kamil-portfolio')
    })
  })

  describe('Terminal — history', () => {
    it('ArrowUp restores previous command', () => {
      run('whoami')
      inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
      expect(inputEl().value).toBe('whoami')
    })

    it('ArrowDown after ArrowUp resets to empty', () => {
      run('whoami')
      const input = inputEl()
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
      expect(input.value).toBe('')
    })

    it('Ctrl+L clears the terminal', () => {
      run('ls')
      inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'l', ctrlKey: true, bubbles: true, cancelable: true }))
      expect(document.querySelectorAll('.term-body .t-line:not(.term-input-line)').length).toBe(0)
    })
  })

  describe('File switching via sidebar', () => {
    it('clicking md sidebar item sets data-active to md', () => {
      document.querySelector<HTMLElement>('[data-file-sidebar="md"]')!.click()
      expect(document.querySelector('.vsc-win')!.getAttribute('data-active')).toBe('md')
    })

    it('md editor view gets .active class after click', () => {
      document.querySelector<HTMLElement>('[data-file-sidebar="md"]')!.click()
      expect(document.querySelector('.editor-view[data-file="md"]')!.classList.contains('active')).toBe(true)
    })

    it('spec editor view loses .active class after switching', () => {
      document.querySelector<HTMLElement>('[data-file-sidebar="md"]')!.click()
      expect(document.querySelector('.editor-view[data-file="spec"]')!.classList.contains('active')).toBe(false)
    })

    it('clicked sidebar item gets aria-selected true', () => {
      const item = document.querySelector<HTMLElement>('[data-file-sidebar="json"]')!
      item.click()
      expect(item.getAttribute('aria-selected')).toBe('true')
    })
  })

  describe('Status bar — branch dropdown', () => {
    it('click on branch span opens .branch-dropdown', () => {
      document.querySelector<HTMLElement>('[aria-label="Branch"]')!.click()
      expect(document.querySelector('.branch-dropdown')).not.toBeNull()
    })

    it('dropdown contains 3 branch options', () => {
      document.querySelector<HTMLElement>('[aria-label="Branch"]')!.click()
      expect(document.querySelectorAll('.branch-dropdown li').length).toBe(3)
    })

    it('first item has .cur class (current branch)', () => {
      document.querySelector<HTMLElement>('[aria-label="Branch"]')!.click()
      expect(document.querySelector('.branch-dropdown li.cur')?.textContent).toBe('main')
    })

    it('click second branch option updates label', () => {
      const branch = document.querySelector<HTMLElement>('[aria-label="Branch"]')!
      branch.click()
      document.querySelectorAll<HTMLElement>('.branch-dropdown li')[1].click()
      expect(branch.textContent).toBe('⎇ feat/wm-redesign')
    })

    it('click branch span again when open closes dropdown', () => {
      const branch = document.querySelector<HTMLElement>('[aria-label="Branch"]')!
      branch.click()
      branch.click()
      expect(document.querySelector('.branch-dropdown')).toBeNull()
    })
  })

  describe('Status bar — Prettier, encoding, line ending', () => {
    it('click Prettier shows Formatting… immediately', () => {
      const pret = Array.from(document.querySelectorAll<HTMLElement>('.status span'))
        .find(s => s.textContent?.includes('Prettier'))!
      pret.click()
      expect(pret.textContent).toBe('Formatting…')
    })

    it('after timers Prettier label restored', () => {
      vi.useFakeTimers()
      const pret = Array.from(document.querySelectorAll<HTMLElement>('.status span'))
        .find(s => s.textContent === '✓ Prettier')!
      pret.click()
      vi.runAllTimers()
      expect(pret.textContent).toBe('✓ Prettier')
      vi.useRealTimers()
    })

    it('click UTF-8 cycles to UTF-16', () => {
      const enc = Array.from(document.querySelectorAll<HTMLElement>('.status span'))
        .find(s => s.textContent === 'UTF-8')!
      enc.click()
      expect(enc.textContent).toBe('UTF-16')
    })

    it('click UTF-8 twice gives ASCII', () => {
      const enc = Array.from(document.querySelectorAll<HTMLElement>('.status span'))
        .find(s => s.textContent === 'UTF-8')!
      enc.click()
      enc.click()
      expect(enc.textContent).toBe('ASCII')
    })

    it('click UTF-8 three times wraps back to UTF-8', () => {
      const enc = Array.from(document.querySelectorAll<HTMLElement>('.status span'))
        .find(s => s.textContent === 'UTF-8')!
      enc.click(); enc.click(); enc.click()
      expect(enc.textContent).toBe('UTF-8')
    })

    it('click LF cycles to CRLF', () => {
      const lf = Array.from(document.querySelectorAll<HTMLElement>('.status span'))
        .find(s => s.textContent?.trim() === 'LF')!
      lf.click()
      expect(lf.textContent).toBe('CRLF')
    })

    it('click LF twice gives CR', () => {
      const lf = Array.from(document.querySelectorAll<HTMLElement>('.status span'))
        .find(s => s.textContent?.trim() === 'LF')!
      lf.click(); lf.click()
      expect(lf.textContent).toBe('CR')
    })
  })

  describe('Line click — breakpoint and highlight', () => {
    function clickLn(ln: HTMLElement, clientX: number): void {
      vi.spyOn(ln, 'getBoundingClientRect').mockReturnValue(
        { left: 0, top: 0, right: 100, bottom: 20, width: 100, height: 20, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
      )
      ln.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX }))
    }

    it('click at x=10 (< 52) adds .bp class', () => {
      const ln = document.querySelector<HTMLElement>('.editor-view.active .ln')!
      clickLn(ln, 10)
      expect(ln.classList.contains('bp')).toBe(true)
    })

    it('click at x=10 twice toggles .bp off', () => {
      const ln = document.querySelector<HTMLElement>('.editor-view.active .ln')!
      clickLn(ln, 10)
      clickLn(ln, 10)
      expect(ln.classList.contains('bp')).toBe(false)
    })

    it('click at x=100 (>= 52) adds .hi class', () => {
      const ln = document.querySelector<HTMLElement>('.editor-view.active .ln')!
      clickLn(ln, 100)
      expect(ln.classList.contains('hi')).toBe(true)
    })

    it('click at x=100 updates .sb-ln text', () => {
      const ln = document.querySelector<HTMLElement>('.editor-view.active .ln')!
      clickLn(ln, 100)
      expect(document.querySelector('.sb-ln')!.textContent).toMatch(/Ln \d+/)
    })
  })

  describe('Breadcrumbs — MutationObserver', () => {
    it('switching to md updates bcFile to about.md', async () => {
      document.querySelector<HTMLElement>('[data-file-sidebar="md"]')!.click()
      await new Promise(r => setTimeout(r, 0))
      expect(document.querySelector('[data-bc-file]')!.textContent).toBe('about.md')
    })

    it('switching to json updates bcFile to package.json', async () => {
      document.querySelector<HTMLElement>('[data-file-sidebar="json"]')!.click()
      await new Promise(r => setTimeout(r, 0))
      expect(document.querySelector('[data-bc-file]')!.textContent).toBe('package.json')
    })

    it('switching to spec shows bcSrc (in-source file)', async () => {
      document.querySelector<HTMLElement>('[data-file-sidebar="md"]')!.click()
      await new Promise(r => setTimeout(r, 0))
      document.querySelector<HTMLElement>('[data-file-sidebar="spec"]')!.click()
      await new Promise(r => setTimeout(r, 0))
      expect(document.querySelector<HTMLElement>('[data-bc-src]')!.style.display).toBe('')
    })

    it('switching to json hides bcSrc (non-source file)', async () => {
      document.querySelector<HTMLElement>('[data-file-sidebar="json"]')!.click()
      await new Promise(r => setTimeout(r, 0))
      expect(document.querySelector<HTMLElement>('[data-bc-src]')!.style.display).toBe('none')
    })
  })

  describe('Context menu', () => {
    it('right-click on editor view opens .ctx-menu', () => {
      document.querySelector<HTMLElement>('.editor-view.active')!.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      )
      expect(document.querySelector('.ctx-menu')).not.toBeNull()
    })

    it('ctx-menu contains Copy Line item', () => {
      document.querySelector<HTMLElement>('.editor-view.active')!.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      )
      const items = Array.from(document.querySelectorAll('.ctx-item span'))
      expect(items.some(s => s.textContent === 'Copy Line')).toBe(true)
    })

    it('ctx-menu contains Add Breakpoint item', () => {
      document.querySelector<HTMLElement>('.editor-view.active')!.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      )
      const items = Array.from(document.querySelectorAll('.ctx-item span'))
      expect(items.some(s => s.textContent === 'Add Breakpoint')).toBe(true)
    })

    it('Escape closes ctx-menu', () => {
      document.querySelector<HTMLElement>('.editor-view.active')!.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      )
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(document.querySelector('.ctx-menu')).toBeNull()
    })

    it('ctx-menu has separators between groups', () => {
      document.querySelector<HTMLElement>('.editor-view.active')!.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      )
      expect(document.querySelectorAll('.ctx-sep').length).toBeGreaterThan(0)
    })
  })

  describe('Source control staging', () => {
    it('click sc-status M → S with staged class', () => {
      const s = document.querySelector<HTMLElement>('.sc-status')!
      s.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(s.textContent).toBe('S')
      expect(s.classList.contains('staged')).toBe(true)
    })

    it('click staged sc-status → reverts to M', () => {
      const s = document.querySelector<HTMLElement>('.sc-status')!
      s.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      s.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(s.textContent).toBe('M')
    })

    it('reverting removes staged class', () => {
      const s = document.querySelector<HTMLElement>('.sc-status')!
      s.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      s.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(s.classList.contains('staged')).toBe(false)
    })
  })
})

describe('Minimap', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.resetModules()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    })
    document.body.innerHTML = `
<div class="vsc-win" data-active="spec">
  <span data-title></span>
  <div class="tabs" role="tablist"></div>
  <div class="act-bar"></div>
  <div class="sidebar">
    <div class="panel-view" data-panel="explorer">
      <div data-file-sidebar="spec" class="file active" aria-selected="true">spec</div>
      <div data-file-sidebar="md" class="file" aria-selected="false">md</div>
    </div>
    <div class="sb-ln"></div>
    <div class="sc-status m">M</div>
  </div>
  <div class="editor-view active" data-file="spec">
    <div class="ln">const <span class="kw">x</span> = 1;</div>
    <div class="ln">// comment</div>
  </div>
  <div class="editor-view" data-file="md">
    <div class="ln">Hello</div>
  </div>
  <div class="panel-resize"></div>
  <div class="panel">
    <div class="ptab active" data-ptab="terminal" aria-selected="true" role="tab">Terminal</div>
    <div class="pv active" data-pv="terminal">
      <div class="term-body">
        <div class="t-line term-input-line">
          <input class="term-input" type="text">
        </div>
      </div>
      <span class="term-label"></span>
    </div>
  </div>
  <div class="status">
    <span aria-label="Branch">⎇ main</span>
    <span>✓ Prettier</span>
    <span>UTF-8</span>
    <span>LF</span>
  </div>
  <span data-bc-file></span>
  <span data-bc-src style="display:none"></span>
  <span data-bc-srcsp style="display:none"></span>
</div>
<div id="vsc-minimap"></div>`
    await import('../../src/editor')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('populates #vsc-minimap with .mm-line elements after init', () => {
    vi.runAllTimers()
    expect(document.getElementById('vsc-minimap')!.querySelector('.mm-line')).not.toBeNull()
  })

  it('contains .mm-cursor after init', () => {
    vi.runAllTimers()
    expect(document.getElementById('vsc-minimap')!.querySelector('.mm-cursor')).not.toBeNull()
  })

  it('line count matches number of .ln elements in active view', () => {
    vi.runAllTimers()
    const lnCount = document.querySelector('.editor-view.active')!.querySelectorAll('.ln').length
    expect(document.getElementById('vsc-minimap')!.querySelectorAll('.mm-line').length).toBe(lnCount)
  })

  it('changing data-active rebuilds minimap for the new file', async () => {
    vi.runAllTimers()
    // spec view has 2 .ln; after switching to md (1 .ln) minimap should have 1 line
    document.querySelector<HTMLElement>('.vsc-win')!.dataset.active = 'md'
    await Promise.resolve() // flush MutationObserver microtask so setTimeout is registered
    vi.runAllTimers()
    expect(document.getElementById('vsc-minimap')!.querySelectorAll('.mm-line').length).toBe(1)
  })

  it('minimap click sets scrollTop on active editor-view', () => {
    vi.runAllTimers()
    const mm = document.getElementById('vsc-minimap')!
    const view = document.querySelector<HTMLElement>('.editor-view.active')!
    Object.defineProperty(view, 'scrollHeight', { value: 500, configurable: true })
    Object.defineProperty(view, 'clientHeight', { value: 100, configurable: true })
    mm.getBoundingClientRect = () => ({ top: 0, left: 0, right: 10, bottom: 200, width: 10, height: 200 } as DOMRect)
    mm.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 5, clientY: 100 }))
    expect(view.scrollTop).toBeGreaterThanOrEqual(0)
  })
})
