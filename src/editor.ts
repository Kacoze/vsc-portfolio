import { esc } from './utils'

// ── File switching & dynamic tabs ──────────────────────────────────────

const vsc = document.querySelector<HTMLElement>('.vsc-win')!
if (!vsc) throw new Error('No .vsc-win')

const titleEl = vsc.querySelector<HTMLElement>('[data-title]')
const tabsEl = vsc.querySelector<HTMLElement>('.tabs')!

type FileKey    = 'spec' | 'pwconfig' | 'md' | 'json' | 'readme' | 'env' | 'license'
type ScriptName = 'test' | 'build' | 'lint' | 'deploy' | 'contact'

interface FileDef {
  title: string
  name: string
  ico: string
  icoClr: string
}

const fileDefs: Record<FileKey, FileDef> = {
  spec:     { title: 'kamil.spec.ts — kamil-portfolio',        name: 'kamil.spec.ts',        ico: 'TS', icoClr: '#4B9EE3' },
  pwconfig: { title: 'playwright.config.ts — kamil-portfolio', name: 'playwright.config.ts', ico: 'TS', icoClr: '#4B9EE3' },
  md:       { title: 'about.md — kamil-portfolio',             name: 'about.md',             ico: 'md', icoClr: '#4B9EE3' },
  json:     { title: 'package.json — kamil-portfolio',         name: 'package.json',         ico: '{}', icoClr: '#F5A623' },
  readme:   { title: 'README.md — kamil-portfolio',            name: 'README.md',            ico: 'md', icoClr: '#4B9EE3' },
  env:      { title: '.env — kamil-portfolio',                 name: '.env',                 ico: '·',  icoClr: '#B594E4' },
  license:  { title: 'LICENSE — kamil-portfolio',              name: 'LICENSE',              ico: 'md', icoClr: '#B5B5B5' },
}

function activate(key: FileKey): void {
  const def = fileDefs[key]
  if (!def) return
  vsc.dataset.active = key
  if (titleEl) titleEl.textContent = def.title
  vsc.querySelectorAll<HTMLElement>('.editor-view').forEach(v =>
    v.classList.toggle('active', v.dataset.file === key)
  )
  vsc.querySelectorAll<HTMLElement>('[data-file-tab]').forEach(t => {
    const on = t.dataset.fileTab === key
    t.classList.toggle('active', on)
    t.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  vsc.querySelectorAll<HTMLElement>('[data-file-sidebar]').forEach(s => {
    const on = s.dataset.fileSidebar === key
    s.classList.toggle('active', on)
    if (on) s.setAttribute('aria-selected', 'true')
    else s.removeAttribute('aria-selected')
  })
}

function updateCloseVisibility(): void {
  const tabs = tabsEl.querySelectorAll('.tab')
  tabs.forEach(t => {
    const close = t.querySelector<HTMLElement>('.close')
    if (close) close.style.display = tabs.length <= 1 ? 'none' : ''
  })
}

function openFile(key: FileKey): void {
  const def = fileDefs[key]
  if (!def) return
  if (!tabsEl.querySelector(`[data-file-tab="${key}"]`)) {
    const btn = document.createElement('button')
    btn.className = 'tab'
    btn.type = 'button'
    btn.setAttribute('role', 'tab')
    btn.dataset.fileTab = key
    btn.innerHTML = `<span class="ico" style="color:${def.icoClr}">${def.ico}</span>${def.name}<span class="close" aria-label="Close tab" role="button">×</span>`
    tabsEl.appendChild(btn)
    updateCloseVisibility()
  }
  // View may not be in DOM yet if lazy injection hasn't fired — retry once it is
  if (!vsc.querySelector(`.editor-view[data-file="${key}"]`)) {
    setTimeout(() => openFile(key), 50)
    return
  }
  activate(key)
}

function closeFile(key: FileKey): void {
  const tabs = tabsEl.querySelectorAll('.tab')
  if (tabs.length <= 1) return
  const tab = tabsEl.querySelector<HTMLElement>(`[data-file-tab="${key}"]`)
  if (!tab) return
  const wasActive = tab.classList.contains('active')
  const fallback = (tab.previousElementSibling ?? tab.nextElementSibling) as HTMLElement | null
  tab.remove()
  updateCloseVisibility()
  if (wasActive && fallback?.dataset.fileTab) activate(fallback.dataset.fileTab as FileKey)
}

tabsEl.addEventListener('click', (e) => {
  const tab = (e.target as Element).closest<HTMLElement>('.tab')
  if (!tab) return
  const key = tab.dataset.fileTab! as FileKey
  if ((e.target as Element).classList.contains('close')) {
    e.stopPropagation()
    closeFile(key)
    return
  }
  activate(key)
})

vsc.querySelectorAll<HTMLElement>('[data-file-sidebar]').forEach(s => {
  s.addEventListener('click', () => openFile(s.dataset.fileSidebar! as FileKey))
  s.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFile(s.dataset.fileSidebar! as FileKey) }
  })
})

vsc.querySelectorAll<HTMLElement>('.folder.expandable').forEach(folder => {
  function toggle() {
    const open = folder.dataset.expanded !== 'false'
    folder.dataset.expanded = open ? 'false' : 'true'
    folder.setAttribute('aria-expanded', open ? 'false' : 'true')
    const chev = folder.querySelector<HTMLElement>('.chev')
    if (chev) chev.textContent = open ? '▸' : '▾'
  }
  folder.addEventListener('click', toggle)
  folder.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
  })
})

updateCloseVisibility()

// ── Activity bar, search, terminal, run panel ──────────────────────────

const actBar = vsc.querySelector<HTMLElement>('.act-bar')
const sidebar = vsc.querySelector<HTMLElement>('.sidebar')

if (actBar && sidebar) {
  function switchPanel(key: string): void {
    actBar!.querySelectorAll<HTMLElement>('.act-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.panel === key)
    )
    sidebar!.querySelectorAll<HTMLElement>('.panel-view').forEach(p => {
      if (p.dataset.panel === key) p.removeAttribute('hidden')
      else p.setAttribute('hidden', '')
    })
  }

  actBar.querySelectorAll<HTMLElement>('[data-panel]').forEach(b =>
    b.addEventListener('click', () => switchPanel(b.dataset.panel!))
  )

  // Search
  const searchInput = sidebar.querySelector<HTMLInputElement>('[data-panel="search"] .sb-search')
  const searchResults = sidebar.querySelector<HTMLElement>('.sb-search-results')
  const searchFiles: { name: string; key: FileKey }[] = [
    { name: 'kamil.spec.ts', key: 'spec' },
    { name: 'about.md',      key: 'md' },
    { name: 'package.json',  key: 'json' },
    { name: 'README.md',     key: 'readme' },
    { name: '.env',          key: 'env' },
    { name: 'LICENSE',       key: 'license' },
  ]
  const EMPTY_SEARCH = '<div class="sb-search-empty">Type to search across files…</div>'

  if (searchInput && searchResults) {
    searchResults.innerHTML = EMPTY_SEARCH
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase()
      if (!q) { searchResults.innerHTML = EMPTY_SEARCH; return }
      let html = ''
      let total = 0
      for (const file of searchFiles) {
        const view = vsc.querySelector(`[data-file="${file.key}"]`)
        if (!view) continue
        const matches: { text: string; idx: number }[] = []
        view.querySelectorAll('.ln').forEach(ln => {
          const text = ln.textContent ?? ''
          const idx = text.toLowerCase().indexOf(q)
          if (idx >= 0) matches.push({ text, idx })
        })
        if (!matches.length) continue
        total += matches.length
        html += `<div class="sr-file"><span>${esc(file.name)}</span><span class="ct">${matches.length}</span></div>`
        for (const m of matches.slice(0, 3)) {
          const before = esc(m.text.slice(Math.max(0, m.idx - 18), m.idx))
          const hit = esc(m.text.slice(m.idx, m.idx + q.length))
          const after = esc(m.text.slice(m.idx + q.length, m.idx + q.length + 38))
          html += `<div class="sr-line">${before}<mark>${hit}</mark>${after}</div>`
        }
      }
      searchResults.innerHTML = total
        ? html
        : `<div class="sb-search-empty">No results for "${esc(q)}"</div>`
    })

    searchResults.addEventListener('click', (e) => {
      const fileEl = (e.target as Element).closest<HTMLElement>('.sr-file')
      if (!fileEl) return
      const name = fileEl.querySelector('span')?.textContent ?? ''
      const file = searchFiles.find(f => f.name === name)
      if (file) openFile(file.key)
    })
  }

  // Terminal output for run panel
  const PROMPT = '<span class="muted">kamil@local</span> <span class="muted">kamil-portfolio</span> %'
  function testLine(name: string, time: string) {
    return `  <span class="pass">✓</span>  ${name.padEnd(22)}${time}   <span class="pass">PASS</span>`
  }

  const runOutputs: Record<ScriptName, string[]> = {
    test: [
      `${PROMPT} <span class="cmd">npx playwright test --project=kamil.spec</span>`, '',
      '  Running 10 tests using 1 worker', '',
      testLine('experience › 8 yrs at BF Games',    '0.50s'), testLine('experience › frontend &amp; backend',      '0.31s'), '',
      testLine('leadership › leads QA &amp; automation', '0.28s'), testLine('leadership › CI integration',         '0.24s'), testLine('leadership › coordinates QA',          '0.22s'), '',
      testLine('expertise › Playwright + TypeScript', '0.35s'), testLine('expertise › Jenkins + GH Actions',      '0.29s'), testLine('expertise › frontend background',       '0.21s'), '',
      testLine('availability › open for consulting',  '0.19s'), testLine('availability › not full-time',          '0.18s'), '',
      '  <span class="pass">10 passed</span> (4.1s)',
    ],
    build: [
      `${PROMPT} <span class="cmd">npm run build</span>`, '',
      'vite v5.4.0 building for production…', '<span class="pass">✓</span> 1 modules transformed.',
      'dist/index.html        <span class="pass">72.5 kB</span>', 'dist/index.html.gz     <span class="pass"> 8.9 kB</span>',
      '<span class="pass">✓</span> built in <span class="pass">0.28s</span>',
    ],
    lint: [
      `${PROMPT} <span class="cmd">npm run lint</span>`, '',
      'eslint src/ --cache', '',
      '  <span class="pass">0 errors</span> · 0 warnings · 0 fixable',
    ],
    deploy: [
      `${PROMPT} <span class="cmd">npm run deploy</span>`, '',
      'wrangler pages deploy dist/ --project-name kamil-portfolio',
      '✨ Deployment complete — <span class="pass">https://kamil.kozieradzcy.com</span>',
      '   duration <span class="pass">1.02s</span> · edge: global',
    ],
    contact: [
      `${PROMPT} <span class="cmd">npm run contact -- --to kamil</span>`, '',
      '→ POST /api/contact',
      '  <span class="pass">200 OK</span> · 324ms', '← message delivered',
    ],
  }

  const termBody = vsc.querySelector<HTMLElement>('.term-body')
  const termLabel = vsc.querySelector<HTMLElement>('.panel-act')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function appendLine(html: string): void {
    if (!termBody) return
    const div = document.createElement('div')
    div.className = 't-line'
    div.style.opacity = '1'
    div.innerHTML = html === '' ? '&nbsp;' : html
    const inputLine = vsc.querySelector('.term-input-line')
    if (inputLine) termBody.insertBefore(div, inputLine)
    else termBody.appendChild(div)
  }

  function scrollToBottom(): void {
    const pv = vsc.querySelector<HTMLElement>('.pv[data-pv="terminal"]')
    if (pv) pv.scrollTop = pv.scrollHeight
  }

  function focusInput(): void {
    const input = vsc.querySelector<HTMLInputElement>('.term-input')
    if (input) setTimeout(() => input.focus(), 0)
  }

  function clearTerminal(): void {
    termBody?.querySelectorAll('.t-line:not(.term-input-line)').forEach(l => l.remove())
  }

  function runScript(name: ScriptName): void {
    const lines = runOutputs[name]
    if (!termBody || !lines) return
    const inputLine = vsc.querySelector('.term-input-line')
    termBody.querySelectorAll('.t-line:not(.term-input-line)').forEach(l => l.remove())
    if (reducedMotion) {
      lines.forEach(html => appendLine(html))
    } else {
      let delay = 40
      for (const html of lines) {
        const div = document.createElement('div')
        div.className = 't-line'
        div.style.opacity = '0'
        div.innerHTML = html === '' ? '&nbsp;' : html
        if (inputLine) termBody.insertBefore(div, inputLine)
        else termBody.appendChild(div)
        const isEmpty = (div.textContent ?? '').trim() === ''
        setTimeout(() => { div.style.opacity = '1' }, delay)
        delay += isEmpty ? 45 : 75
      }
    }
    if (termLabel) termLabel.textContent = `zsh — ${name}`
    scrollToBottom()
    focusInput()
  }

  // Panel tabs (Terminal / Output / Problems / …)
  const panel = vsc.querySelector<HTMLElement>('.panel')

  function switchPtab(key: string): void {
    if (!panel) return
    panel.querySelectorAll<HTMLElement>('.ptab').forEach(b => {
      const on = b.dataset.ptab === key
      b.classList.toggle('active', on)
      b.setAttribute('aria-selected', on ? 'true' : 'false')
    })
    panel.querySelectorAll<HTMLElement>('.pv').forEach(p => {
      if (p.dataset.pv === key) { p.removeAttribute('hidden'); p.classList.add('active') }
      else { p.setAttribute('hidden', ''); p.classList.remove('active') }
    })
  }

  panel?.querySelectorAll<HTMLElement>('.ptab[data-ptab]').forEach(b =>
    b.addEventListener('click', () => switchPtab(b.dataset.ptab!))
  )

  sidebar.querySelectorAll<HTMLElement>('.run-list li[data-run]').forEach(item => {
    const run = () => { switchPtab('terminal'); runScript(item.dataset.run! as ScriptName) }
    item.addEventListener('click', run)
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run() }
    })
  })

  // Terminal REPL
  const termInput = vsc.querySelector<HTMLInputElement>('.term-input')
  const history: string[] = []
  let histIdx = -1

  const fileMap: Record<string, FileKey> = {
    'kamil.spec.ts': 'spec', spec: 'spec',
    'about.md': 'md',
    'package.json': 'json',
    'README.md': 'readme', 'readme.md': 'readme',
    '.env': 'env',
    'LICENSE': 'license', license: 'license',
  }

  function cmdHelp(): void {
    appendLine('<span class="muted">Available commands:</span>')
    appendLine('  <span class="pass">npm</span> test | run build | run lint | run deploy | run contact')
    appendLine('  <span class="pass">ls</span> [-la]  <span class="pass">cat</span> &lt;file&gt;  <span class="pass">git</span> status|log')
    appendLine('  <span class="pass">pwd</span>  <span class="pass">whoami</span>  <span class="pass">date</span>  <span class="pass">echo</span>  <span class="pass">clear</span>  <span class="pass">help</span>')
  }

  function cmdLs(args: string[]): void {
    if (args[0] === '-la' || args[0] === '-a' || args[0] === '-l') {
      appendLine('total 48')
      appendLine('drwxr-xr-x  kamil  staff   160 Apr 23 12:04  <span class="kw">node_modules</span>/')
      appendLine('drwxr-xr-x  kamil  staff    96 Apr 23 12:04  <span class="kw">src</span>/')
      appendLine('-rw-r--r--  kamil  staff   264 Apr 23 12:04  .env')
      appendLine('-rw-r--r--  kamil  staff  1075 Apr 23 12:04  LICENSE')
      appendLine('-rw-r--r--  kamil  staff   612 Apr 23 12:04  README.md')
      appendLine('-rw-r--r--  kamil  staff   812 Apr 23 12:04  package.json')
    } else {
      appendLine('<span class="kw">node_modules</span>/  <span class="kw">src</span>/  .env  LICENSE  README.md  package.json')
    }
  }

  function cmdCat(args: string[]): void {
    const f = args[0]
    if (!f) { appendLine('<span style="color:var(--err)">cat:</span> missing file operand'); return }
    const key = fileMap[f] ?? fileMap[f.toLowerCase()]
    if (!key) { appendLine(`<span style="color:var(--err)">cat:</span> ${esc(f)}: No such file or directory`); return }
    const view = vsc.querySelector(`[data-file="${key}"]`)
    if (!view) { appendLine(`<span style="color:var(--err)">cat:</span> ${esc(f)}: read error`); return }
    view.querySelectorAll('.ln').forEach(ln => appendLine(ln.innerHTML || '&nbsp;'))
  }

  function cmdGit(args: string[]): void {
    if (args[0] === 'status') {
      appendLine('On branch <span class="pass">main</span>')
      appendLine('Changes not staged:  <span style="color:var(--warn)">modified:</span> kamil.spec.ts  <span style="color:var(--warn)">modified:</span> package.json')
      appendLine('Untracked:  <span class="pass">.env</span>')
      return
    }
    if (args[0] === 'log') {
      appendLine('<span class="num">ca99037</span> feat: activity bar panels')
      appendLine('<span class="num">45a01c1</span> feat: collapsible src folder')
      appendLine('<span class="num">7245a16</span> a11y: raise .panel-act contrast')
      return
    }
    appendLine(`<span style="color:var(--err)">git:</span> '${esc(args[0] ?? '')}' is not a git command.`)
  }

  function runCommand(raw: string): void {
    const trimmed = raw.trim()
    appendLine(`<span class="muted">kamil@local</span> <span class="muted">kamil-portfolio</span> % <span class="cmd">${esc(trimmed)}</span>`)
    if (!trimmed) return
    const [cmd, ...args] = trimmed.split(/\s+/)
    switch (cmd.toLowerCase()) {
      case 'clear':   clearTerminal(); return
      case 'help':    cmdHelp(); return
      case 'ls':      cmdLs(args); return
      case 'cat':     cmdCat(args); return
      case 'pwd':     appendLine('/Users/kamil/kamil-portfolio'); return
      case 'whoami':  appendLine('kamil'); return
      case 'date':    appendLine(new Date().toString()); return
      case 'echo':    appendLine(esc(args.join(' '))); return
      case 'git':     cmdGit(args); return
      case 'npm': {
        const script = args[0] === 'test' ? 'test' : args[0] === 'run' ? args[1] : null
        const key = script as ScriptName | null
        if (key && key in runOutputs) {
          runOutputs[key].slice(1).forEach((html: string) => appendLine(html))
        } else {
          appendLine(`<span style="color:var(--err)">npm ERR!</span> Missing script: "${esc(args.join(' '))}"`)
        }
        return
      }
    }
    appendLine(`<span style="color:var(--err)">zsh:</span> command not found: ${esc(cmd)}`)
  }

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const val = termInput.value
        if (val.trim()) { history.push(val); histIdx = history.length }
        runCommand(val)
        termInput.value = ''
        scrollToBottom()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (histIdx > 0) termInput.value = history[--histIdx] ?? ''
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (histIdx < history.length - 1) termInput.value = history[++histIdx] ?? ''
        else { histIdx = history.length; termInput.value = '' }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault()
        clearTerminal()
      }
    })
    termBody?.addEventListener('click', (e) => {
      const t = e.target as Element
      if (t.tagName !== 'A' && t.tagName !== 'INPUT') focusInput()
    })
  }

  // Extensions search
  const extSearch = sidebar.querySelector<HTMLInputElement>('[data-panel="ext"] .sb-search')
  extSearch?.addEventListener('input', () => {
    const q = extSearch.value.trim().toLowerCase()
    sidebar!.querySelectorAll<HTMLElement>('.ext-list li').forEach(li => {
      const name = li.querySelector('.ext-name')?.textContent?.toLowerCase() ?? ''
      li.style.display = !q || name.includes(q) ? '' : 'none'
    })
  })
}

// ── Terminal panel resize ──────────────────────────────────────────────

const panelResizeHandle = vsc.querySelector<HTMLElement>('.panel-resize')
const termPanel = vsc.querySelector<HTMLElement>('.panel')

panelResizeHandle?.addEventListener('mousedown', (e) => {
  panelResizeHandle.classList.add('dragging')
  const startY = e.clientY
  const startH = termPanel!.offsetHeight
  const onMove = (e: MouseEvent) => {
    termPanel!.style.height = Math.max(80, Math.min(startH + (startY - e.clientY), 480)) + 'px'
  }
  const onUp = () => {
    panelResizeHandle.classList.remove('dragging')
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
  e.preventDefault()
})

// ── Line highlight & breakpoints ───────────────────────────────────────

const sbLn = vsc.querySelector<HTMLElement>('.sb-ln')

vsc.querySelectorAll<HTMLElement>('.editor-view').forEach(view => {
  view.addEventListener('click', (e) => {
    const ln = (e.target as Element).closest<HTMLElement>('.ln')
    if (!ln) return
    if (e.clientX - ln.getBoundingClientRect().left < 52) {
      ln.classList.toggle('bp')
      return
    }
    ln.classList.toggle('hi')
    const idx = Array.from(view.querySelectorAll('.ln')).indexOf(ln) + 1
    if (sbLn) sbLn.textContent = `Ln ${idx}, Col ${window.getSelection()?.anchorOffset ?? 1}`
  })
})

// ── Status bar ─────────────────────────────────────────────────────────

const status = vsc.querySelector<HTMLElement>('.status')

if (status) {
  const branchSpan = status.querySelector<HTMLElement>('[aria-label="Branch"]')
  if (branchSpan) {
    const branches = ['main', 'feat/wm-redesign', 'feat/interactive']
    let curBranch = 0
    let dropdown: HTMLElement | null = null
    const closeDrop = () => { dropdown?.remove(); dropdown = null }

    branchSpan.addEventListener('click', (e) => {
      e.stopPropagation()
      if (dropdown) { closeDrop(); return }
      dropdown = document.createElement('ul')
      dropdown.className = 'branch-dropdown'
      branches.forEach((b, i) => {
        const li = document.createElement('li')
        if (i === curBranch) li.classList.add('cur')
        li.textContent = b
        li.addEventListener('click', (e) => {
          e.stopPropagation()
          curBranch = i
          branchSpan.textContent = `⎇ ${b}`
          closeDrop()
        })
        dropdown!.appendChild(li)
      })
      branchSpan.style.position = 'relative'
      branchSpan.appendChild(dropdown)
      setTimeout(() => document.addEventListener('click', closeDrop, { once: true }), 0)
    })
  }

  const spans = Array.from(status.querySelectorAll<HTMLElement>('span'))

  const errSpan = spans.find(s => s.textContent?.includes('⊗'))
  errSpan?.addEventListener('click', () =>
    vsc.querySelector<HTMLElement>('[data-ptab="problems"]')?.click()
  )

  const pretSpan = spans.find(s => s.textContent?.includes('Prettier'))
  pretSpan?.addEventListener('click', () => {
    pretSpan.textContent = 'Formatting…'
    setTimeout(() => { pretSpan.textContent = '✓ Prettier' }, 700)
  })

  const encSpan = spans.find(s => s.textContent?.includes('UTF'))
  if (encSpan) {
    const encs = ['UTF-8', 'UTF-16', 'ASCII']
    let ei = 0
    encSpan.addEventListener('click', () => { ei = (ei + 1) % encs.length; encSpan.textContent = encs[ei] })
  }

  const lfSpan = spans.find(s => s.textContent?.trim() === 'LF')
  if (lfSpan) {
    const lfs = ['LF', 'CRLF', 'CR']
    let li = 0
    lfSpan.addEventListener('click', () => { li = (li + 1) % lfs.length; lfSpan.textContent = lfs[li] })
  }
}

// ── Source control: stage / unstage ────────────────────────────────────

vsc.querySelectorAll<HTMLElement>('.sc-status').forEach(s => {
  s.addEventListener('click', (e) => {
    e.stopPropagation()
    if (s.textContent === 'S') {
      s.textContent = s.dataset.orig ?? 'M'
      s.className = `sc-status ${s.dataset.cls ?? 'm'}`
    } else {
      s.dataset.orig = s.textContent ?? ''
      s.dataset.cls = s.classList[1] ?? 'm'
      s.textContent = 'S'
      s.className = 'sc-status staged'
    }
  })
})

// ── Package.json version tooltips ──────────────────────────────────────

const jsonView = document.querySelector<HTMLElement>('.editor-view[data-file="json"]')
if (jsonView) {
  const hints: Record<string, string> = {
    '@playwright/test': '✓ 1.46.0 · up to date',
    'cypress':          '⚠ 14.2.1 available',
    'typescript':       '✓ 5.5.4 · up to date',
    '@types/node':      '✓ 20.14.0 · up to date',
    'eslint':           '⚠ 9.12.0 available',
    'prettier':         '✓ 3.3.3 · up to date',
    'vite':             '✓ 5.4.0 · up to date',
    'docker':           '✓ 26.0.0 · up to date',
  }
  const tip = document.createElement('div')
  tip.className = 'pkg-tip'
  tip.style.display = 'none'
  document.body.appendChild(tip)

  jsonView.addEventListener('mouseover', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('.prop')
    if (!el) return
    const msg = hints[el.textContent?.replace(/"/g, '').trim() ?? '']
    if (!msg) return
    tip.textContent = msg
    tip.style.display = 'block'
  })
  jsonView.addEventListener('mousemove', (e) => {
    tip.style.left = e.clientX + 14 + 'px'
    tip.style.top = e.clientY - 28 + 'px'
  })
  jsonView.addEventListener('mouseout', (e) => {
    if (!(e.target as Element).closest('.prop')) tip.style.display = 'none'
  })
}

// ── Breadcrumbs ────────────────────────────────────────────────────────

const bcFile = vsc.querySelector<HTMLElement>('[data-bc-file]')
const bcSrc  = vsc.querySelector<HTMLElement>('[data-bc-src]')
const bcSrcSp = vsc.querySelector<HTMLElement>('[data-bc-srcsp]')
const inSrc: Record<string, boolean> = { spec: true, md: true }
const fileNames: Record<string, string> = {
  spec: 'kamil.spec.ts', pwconfig: 'playwright.config.ts',
  md: 'about.md', json: 'package.json',
  readme: 'README.md', env: '.env', license: 'LICENSE',
}

new MutationObserver(() => {
  const key = vsc.dataset.active ?? ''
  if (bcFile) bcFile.textContent = fileNames[key] ?? key
  if (bcSrc) bcSrc.style.display = inSrc[key] ? '' : 'none'
  if (bcSrcSp) bcSrcSp.style.display = inSrc[key] ? '' : 'none'
}).observe(vsc, { attributes: true, attributeFilter: ['data-active'] })

// ── Minimap ────────────────────────────────────────────────────────────

const mm = document.getElementById('vsc-minimap')
if (mm) {
  const tokenColors: Record<string, string> = {
    kw: '#569CD6', str: '#CE9178', fn: '#DCDCAA', cmt: '#6A9955',
    num: '#B5CEA8', prop: '#9CDCFE', type: '#4EC9B0',
    'md-h': '#569CD6', 'md-h2': '#4EC9B0',
  }

  function buildMinimap(view: Element, mmEl: HTMLElement): void {
    mmEl.innerHTML = '<div class="mm-cursor" id="mm-cursor"></div>'
    const cursor = mmEl.querySelector<HTMLElement>('.mm-cursor')
    const frag = document.createDocumentFragment()
    let count = 0
    view.querySelectorAll('.ln').forEach((ln, i) => {
      if (i > 200) return
      const div = document.createElement('div')
      div.className = 'mm-line'
      const token = ln.querySelector('.kw,.str,.fn,.cmt,.num,.prop,.type,.md-h,.md-h2')
      const cls = token?.className.split(' ')[0] ?? ''
      div.style.width = Math.min(Math.max((ln.textContent!.length / 80) * 36, 4), 36) + 'px'
      div.style.background = tokenColors[cls] ?? 'rgba(180,180,180,0.3)'
      frag.appendChild(div)
      count++
    })
    mmEl.appendChild(frag)
    const contentH = count * 2

    function updateCursor(): void {
      const el = view as HTMLElement
      const range = el.scrollHeight - el.clientHeight
      const pct = range > 0 ? el.scrollTop / range : 0
      if (cursor) cursor.style.top = pct * Math.max(contentH - 40, 0) + 'px'
    }

    view.addEventListener('scroll', updateCursor)
    requestAnimationFrame(updateCursor)
    mmEl.addEventListener('click', (e) => {
      const relY = e.clientY - mmEl.getBoundingClientRect().top
      const el = view as HTMLElement
      el.scrollTop = Math.min(relY / contentH, 1) * (el.scrollHeight - el.clientHeight)
    })
  }

  new MutationObserver(() => {
    const key = vsc.dataset.active
    const view = vsc.querySelector(`.editor-view[data-file="${key}"]`)
    if (view) setTimeout(() => buildMinimap(view, mm), 50)
  }).observe(vsc, { attributes: true, attributeFilter: ['data-active'] })

  const initView = vsc.querySelector('.editor-view.active')
  if (initView) {
    const fn = (): void => buildMinimap(initView, mm)
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2000 })
    else setTimeout(fn, 200)
  }
}

// ── Context menu ───────────────────────────────────────────────────────

let ctxMenu: HTMLElement | null = null
const closeCtxMenu = () => { ctxMenu?.remove(); ctxMenu = null }

function openCtxMenu(x: number, y: number, ln: HTMLElement | null) {
  closeCtxMenu()
  ctxMenu = document.createElement('div')
  ctxMenu.className = 'ctx-menu'

  const items = [
    {
      label: 'Copy Line', kbd: 'Ctrl+C',
      fn: () => { try { navigator.clipboard.writeText(ln?.textContent ?? '') } catch { /* clipboard blocked */ } },
    },
    {
      label: ln?.classList.contains('bp') ? 'Remove Breakpoint' : 'Add Breakpoint', kbd: 'F9',
      fn: () => ln?.classList.toggle('bp'),
    },
    { sep: true },
    {
      label: 'Find in Files', kbd: '⇧Ctrl+F',
      fn: () => vsc.querySelector<HTMLElement>('[data-panel="search"]')?.click(),
    },
    {
      label: 'Format Document', kbd: '⇧Alt+F',
      fn: () => {
        const ps = Array.from(vsc.querySelectorAll<HTMLElement>('.status span'))
          .find(s => s.textContent?.includes('Prettier'))
        if (ps) { ps.textContent = 'Formatting…'; setTimeout(() => { ps.textContent = '✓ Prettier' }, 700) }
      },
    },
    { sep: true },
    {
      label: 'Clear Highlights', kbd: 'Ctrl+K K',
      fn: () => vsc.querySelectorAll('.ln.hi').forEach(l => l.classList.remove('hi')),
    },
  ]

  for (const item of items) {
    if ('sep' in item) {
      ctxMenu.appendChild(Object.assign(document.createElement('div'), { className: 'ctx-sep' }))
      continue
    }
    const el = document.createElement('div')
    el.className = 'ctx-item'
    el.innerHTML = `<span>${item.label}</span><span class="ctx-kbd">${item.kbd}</span>`
    el.addEventListener('click', () => { item.fn(); closeCtxMenu() })
    ctxMenu.appendChild(el)
  }

  ctxMenu.style.left = x + 'px'
  ctxMenu.style.top = y + 'px'
  document.body.appendChild(ctxMenu)
  setTimeout(() => document.addEventListener('click', closeCtxMenu, { once: true }), 0)
}

vsc.querySelectorAll<HTMLElement>('.editor-view').forEach(view => {
  view.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    openCtxMenu(e.clientX, e.clientY, (e.target as Element).closest<HTMLElement>('.ln'))
  })
})

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCtxMenu() })

// ── Package.json script click → run in terminal ────────────────────────

vsc.querySelectorAll<HTMLElement>('.editor-view[data-file="json"] .ln[data-script]').forEach(ln => {
  ln.addEventListener('click', () => {
    const name = ln.dataset.script!
    vsc.querySelector<HTMLElement>('[data-ptab="terminal"]')?.click()
    vsc.querySelector<HTMLElement>(`.run-list li[data-run="${name}"]`)?.click()
  })
})
