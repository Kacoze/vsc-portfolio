type ResizeDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

const RESIZE_DIRS: readonly ResizeDir[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']

interface PreMaxState {
  l: string
  t: string
  w: string
  h: string
}

interface WinState {
  el: HTMLElement
  minimized: boolean
  closed: boolean
  maximized: boolean
  preMax: PreMaxState | null
  z: number
}

const canvas = document.querySelector<HTMLElement>('.wm-canvas')!
if (!canvas) throw new Error('No .wm-canvas')

const isMobile = (): boolean => window.innerWidth <= 767

export const state: Record<string, WinState> = {}
let zTop = 20
const MIN_W = 480
const MIN_H = 300

document.querySelectorAll<HTMLElement>('.win[data-win-id]').forEach(win => initWin(win))

document.querySelectorAll<HTMLElement>('.dock-icon[data-win]').forEach(icon => {
  icon.addEventListener('click', () => {
    icon.classList.remove('dock-bounce')
    restoreWin(icon.dataset.win!)
  })
})

export function initWin(win: HTMLElement): void {
  const id = win.dataset.winId!
  state[id] = { el: win, minimized: false, closed: false, maximized: false, preMax: null, z: 0 }
  addRh(win, id)
  win.addEventListener('mousedown', () => bringFront(win, id), true)

  const tb = win.querySelector<HTMLElement>('.win-tb')
  if (tb) {
    tb.addEventListener('mousedown', e => startDrag(e, win, id))
    tb.addEventListener('dblclick', e => {
      if ((e.target as Element).closest('.tl')) return
      win.querySelector<HTMLElement>('.tl .g')?.click()
    })
  }

  const tl = win.querySelector('.tl')
  if (tl) {
    tl.querySelector('.r')?.addEventListener('click', () => closeWin(id))
    tl.querySelector('.y')?.addEventListener('click', () => minimizeWin(id))
    tl.querySelector('.g')?.addEventListener('click', () => toggleMax(id))
  }

  const start = win.dataset.winStart
  if (start === 'minimized') {
    state[id].minimized = true
    if (!isMobile()) {
      win.style.display = 'none'
      updateDock(id)
    }
  } else if (start === 'maximized') {
    state[id].preMax = {
      l: win.dataset.premaxL ?? '',
      t: win.dataset.premaxT ?? '',
      w: win.dataset.premaxW ?? '',
      h: win.dataset.premaxH ?? '',
    }
    state[id].maximized = true
    win.classList.add('maximized')
  }

  bringFront(win, id)
}

function bringFront(win: HTMLElement, id: string): void {
  win.style.zIndex = String(++zTop)
  if (state[id]) state[id].z = zTop
}

function startDrag(e: MouseEvent, win: HTMLElement, id: string): void {
  if (isMobile() || (e.target as Element).closest('.tl') || state[id].maximized) return
  bringFront(win, id)
  const ox = e.clientX - win.offsetLeft
  const oy = e.clientY - win.offsetTop
  const DOCK_H = 90

  const onMove = (e: MouseEvent): void => {
    const newLeft = Math.max(-(win.offsetWidth - 100), Math.min(e.clientX - ox, canvas.clientWidth - 100))
    const newTop = Math.max(0, Math.min(e.clientY - oy, canvas.clientHeight - DOCK_H - 28))
    win.style.left = newLeft + 'px'
    win.style.top = newTop + 'px'
  }

  const onUp = (): void => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
  e.preventDefault()
}

function addRh(win: HTMLElement, id: string): void {
  const frag = document.createDocumentFragment()
  for (const dir of RESIZE_DIRS) {
    const h = document.createElement('div')
    h.className = `rh rh-${dir}`
    h.dataset.dir = dir
    h.addEventListener('mousedown', e => {
      startResize(e, win, id, dir)
      e.stopPropagation()
    })
    frag.appendChild(h)
  }
  win.appendChild(frag)
}

function startResize(e: MouseEvent, win: HTMLElement, id: string, dir: ResizeDir): void {
  if (isMobile() || state[id].maximized) return
  bringFront(win, id)

  const sx = e.clientX
  const sy = e.clientY
  const sl = win.offsetLeft
  const st = win.offsetTop
  const sw = win.offsetWidth
  const sh = win.offsetHeight

  const onMove = (e: MouseEvent): void => {
    const dx = e.clientX - sx
    const dy = e.clientY - sy
    let l = sl, t = st, w = sw, h = sh

    if (dir.includes('e')) w = Math.max(MIN_W, sw + dx)
    if (dir.includes('s')) h = Math.max(MIN_H, sh + dy)
    if (dir.includes('w')) { w = Math.max(MIN_W, sw - dx); if (w > MIN_W) l = sl + dx }
    if (dir.includes('n')) { h = Math.max(MIN_H, sh - dy); if (h > MIN_H) t = Math.max(0, st + dy) }

    win.style.left = l + 'px'
    win.style.top = t + 'px'
    win.style.width = w + 'px'
    win.style.height = h + 'px'
  }

  const onUp = (): void => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
  e.preventDefault()
}

function toggleMax(id: string): void {
  if (isMobile()) return
  const win = state[id].el
  const s = state[id]

  if (s.maximized) {
    const p = s.preMax!
    win.style.transition = 'all .25s cubic-bezier(.4,0,.2,1)'
    win.style.left = p.l
    win.style.top = p.t
    win.style.width = p.w
    win.style.height = p.h
    win.classList.remove('maximized')
    s.maximized = false
    setTimeout(() => { win.style.transition = '' }, 260)
  } else {
    s.preMax = { l: win.style.left, t: win.style.top, w: win.style.width, h: win.style.height }
    s.maximized = true
    bringFront(win, id)
    win.style.transition = 'all .25s cubic-bezier(.4,0,.2,1)'
    win.style.left = '0'
    win.style.top = '0'
    win.style.width = '100%'
    win.style.height = canvas.clientHeight - 90 + 'px'
    win.classList.add('maximized')
    setTimeout(() => { win.style.transition = '' }, 260)
  }
}

function minimizeWin(id: string): void {
  if (isMobile()) return
  const win = state[id].el
  const icon = document.querySelector<HTMLElement>(`.dock-icon[data-win="${id}"]`)
  const ir = icon?.getBoundingClientRect() ?? { left: 32, top: window.innerHeight / 2 }
  const wr = win.getBoundingClientRect()

  win.style.transformOrigin = `${ir.left - wr.left + 22}px ${ir.top - wr.top + 22}px`
  win.style.transition = 'transform .3s cubic-bezier(.4,0,.2,1),opacity .3s'
  win.style.transform = 'scale(0.05)'
  win.style.opacity = '0'
  state[id].minimized = true
  updateDock(id)

  setTimeout(() => {
    win.style.display = 'none'
    win.style.transform = ''
    win.style.opacity = ''
    win.style.transition = ''
  }, 310)
}

function closeWin(id: string): void {
  if (isMobile()) return
  const win = state[id].el

  win.style.transition = 'opacity .2s,transform .2s'
  win.style.opacity = '0'
  win.style.transform = 'scale(0.95)'
  state[id].closed = true
  updateDock(id)

  setTimeout(() => {
    win.style.display = 'none'
    win.style.transform = ''
    win.style.opacity = ''
    win.style.transition = ''
  }, 210)
}

function restoreWin(id: string): void {
  const s = state[id]
  if (!s) return
  if (!s.closed && !s.minimized) { bringFront(s.el, id); return }

  s.closed = false
  s.minimized = false
  const win = s.el
  win.style.display = ''
  bringFront(win, id)
  win.style.opacity = '0'
  win.style.transform = 'scale(0.95)'
  win.style.transition = 'opacity .2s,transform .2s'

  requestAnimationFrame(() => {
    win.style.opacity = '1'
    win.style.transform = 'scale(1)'
    setTimeout(() => { win.style.transition = '' }, 220)
  })

  updateDock(id)
}

function updateDock(id: string): void {
  const icon = document.querySelector(`.dock-icon[data-win="${id}"]`)
  if (!icon) return
  const s = state[id]
  icon.classList.toggle('win-open', !s.closed && !s.minimized)
  icon.classList.toggle('win-minimized', s.minimized)
  icon.classList.toggle('win-closed', s.closed)
}
