import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { clamp } from '../../src/utils'

describe('clamp()', () => {
  it('value within range is unchanged', () =>
    expect(clamp(5, 0, 10)).toBe(5))

  it('value below min is clamped to min', () =>
    expect(clamp(-1, 0, 10)).toBe(0))

  it('value above max is clamped to max', () =>
    expect(clamp(11, 0, 10)).toBe(10))

  it('value at min boundary', () =>
    expect(clamp(0, 0, 10)).toBe(0))

  it('value at max boundary', () =>
    expect(clamp(10, 0, 10)).toBe(10))

  it('min equals max', () =>
    expect(clamp(5, 5, 5)).toBe(5))

  it('-Infinity is clamped to min', () =>
    expect(clamp(-Infinity, 0, 10)).toBe(0))

  it('Infinity is clamped to max', () =>
    expect(clamp(Infinity, 0, 10)).toBe(10))

  it('negative range', () =>
    expect(clamp(-5, -10, -1)).toBe(-5))

  it('value below negative range', () =>
    expect(clamp(-15, -10, -1)).toBe(-10))

  it('fractional values', () =>
    expect(clamp(0.5, 0, 1)).toBe(0.5))

  it('fractional value below min', () =>
    expect(clamp(-0.1, 0, 1)).toBe(0))

  it('fractional value above max', () =>
    expect(clamp(1.1, 0, 1)).toBe(1))
})

const WIN_HTML = `
<div class="wm-canvas">
  <div class="win" data-win-id="test"
       style="left:100px;top:50px;width:500px;height:400px;">
    <div class="win-inner">
      <div class="win-tb">
        <div class="tl">
          <span class="r"></span>
          <span class="y"></span>
          <span class="g"></span>
        </div>
      </div>
    </div>
  </div>
  <button class="dock-icon win-open" data-win="test"></button>
</div>`

describe('Window Manager — DOM', () => {
  let mod: typeof import('../../src/wm')

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.resetModules()
    document.body.innerHTML = WIN_HTML
    mod = await import('../../src/wm')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initWin state', () => {
    it('state[test] is defined after module import', () => {
      expect(mod.state['test']).toBeDefined()
    })

    it('minimized is false on init', () => {
      expect(mod.state['test'].minimized).toBe(false)
    })

    it('closed is false on init', () => {
      expect(mod.state['test'].closed).toBe(false)
    })

    it('maximized is false on init', () => {
      expect(mod.state['test'].maximized).toBe(false)
    })

    it('el points to the .win element', () => {
      expect(mod.state['test'].el).toBe(document.querySelector('[data-win-id="test"]'))
    })
  })

  describe('data-win-start="minimized"', () => {
    it('sets display:none on desktop', async () => {
      vi.resetModules()
      document.body.innerHTML = `
        <div class="wm-canvas">
          <div class="win" data-win-id="m" data-win-start="minimized"
               style="left:0;top:0;width:500px;height:400px;">
            <div class="win-inner"><div class="win-tb"><div class="tl"></div></div></div>
          </div>
          <button class="dock-icon" data-win="m"></button>
        </div>`
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 })
      const m = await import('../../src/wm')
      const win = document.querySelector<HTMLElement>('[data-win-id="m"]')!
      expect(win.style.display).toBe('none')
      expect(m.state['m'].minimized).toBe(true)
    })

    it('does NOT set display:none on mobile', async () => {
      vi.resetModules()
      document.body.innerHTML = `
        <div class="wm-canvas">
          <div class="win" data-win-id="mob" data-win-start="minimized"
               style="left:0;top:0;width:500px;height:400px;">
            <div class="win-inner"><div class="win-tb"><div class="tl"></div></div></div>
          </div>
          <button class="dock-icon" data-win="mob"></button>
        </div>`
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 })
      const m = await import('../../src/wm')
      const win = document.querySelector<HTMLElement>('[data-win-id="mob"]')!
      expect(win.style.display).not.toBe('none')
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 })
    })
  })

  describe('close button (.r)', () => {
    it('sets state.closed to true', () => {
      document.querySelector<HTMLElement>('.tl .r')!.click()
      expect(mod.state['test'].closed).toBe(true)
    })

    it('hides window after animation', () => {
      document.querySelector<HTMLElement>('.tl .r')!.click()
      vi.runAllTimers()
      expect(document.querySelector<HTMLElement>('[data-win-id="test"]')!.style.display).toBe('none')
    })

    it('updates dock icon to win-closed', () => {
      document.querySelector<HTMLElement>('.tl .r')!.click()
      expect(document.querySelector('.dock-icon')!.classList.contains('win-closed')).toBe(true)
    })
  })

  describe('minimize button (.y)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 })
    })

    it('sets state.minimized to true', () => {
      document.querySelector<HTMLElement>('.tl .y')!.click()
      expect(mod.state['test'].minimized).toBe(true)
    })

    it('updates dock icon to win-minimized', () => {
      document.querySelector<HTMLElement>('.tl .y')!.click()
      expect(document.querySelector('.dock-icon')!.classList.contains('win-minimized')).toBe(true)
    })

    it('hides window after animation', () => {
      document.querySelector<HTMLElement>('.tl .y')!.click()
      vi.runAllTimers()
      expect(document.querySelector<HTMLElement>('[data-win-id="test"]')!.style.display).toBe('none')
    })
  })

  describe('dock icon restores window', () => {
    it('restores closed window — state.closed becomes false', () => {
      document.querySelector<HTMLElement>('.tl .r')!.click()
      vi.runAllTimers()
      document.querySelector<HTMLElement>('.dock-icon')!.click()
      expect(mod.state['test'].closed).toBe(false)
    })

    it('restores closed window — display cleared', () => {
      document.querySelector<HTMLElement>('.tl .r')!.click()
      vi.runAllTimers()
      document.querySelector<HTMLElement>('.dock-icon')!.click()
      expect(document.querySelector<HTMLElement>('[data-win-id="test"]')!.style.display).toBe('')
    })

    it('dock icon shows win-open after restore', () => {
      document.querySelector<HTMLElement>('.tl .r')!.click()
      document.querySelector<HTMLElement>('.dock-icon')!.click()
      expect(document.querySelector('.dock-icon')!.classList.contains('win-open')).toBe(true)
    })
  })

  describe('bringFront', () => {
    it('increases zIndex when window is clicked', () => {
      const win = document.querySelector<HTMLElement>('[data-win-id="test"]')!
      const before = parseInt(win.style.zIndex || '0')
      win.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      const after = parseInt(win.style.zIndex || '0')
      expect(after).toBeGreaterThan(before)
    })
  })

  describe('updateDock', () => {
    it('win-open class when not closed and not minimized', () => {
      expect(document.querySelector('.dock-icon')!.classList.contains('win-open')).toBe(true)
    })
  })

  describe('toggleMax (green button)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 })
    })

    it('click .g adds .maximized class', () => {
      document.querySelector<HTMLElement>('.tl .g')!.click()
      expect(document.querySelector('[data-win-id="test"]')!.classList.contains('maximized')).toBe(true)
    })

    it('click .g sets state.maximized to true', () => {
      document.querySelector<HTMLElement>('.tl .g')!.click()
      expect(mod.state['test'].maximized).toBe(true)
    })

    it('click .g saves preMax with original dimensions', () => {
      const win = document.querySelector<HTMLElement>('[data-win-id="test"]')!
      win.style.left = '100px'
      win.style.top = '50px'
      document.querySelector<HTMLElement>('.tl .g')!.click()
      expect(mod.state['test'].preMax?.l).toBe('100px')
      expect(mod.state['test'].preMax?.t).toBe('50px')
    })

    it('click .g twice removes .maximized class', () => {
      document.querySelector<HTMLElement>('.tl .g')!.click()
      document.querySelector<HTMLElement>('.tl .g')!.click()
      expect(document.querySelector('[data-win-id="test"]')!.classList.contains('maximized')).toBe(false)
    })

    it('click .g twice sets state.maximized to false', () => {
      document.querySelector<HTMLElement>('.tl .g')!.click()
      document.querySelector<HTMLElement>('.tl .g')!.click()
      expect(mod.state['test'].maximized).toBe(false)
    })

    it('click .g twice restores original left/top', () => {
      const win = document.querySelector<HTMLElement>('[data-win-id="test"]')!
      win.style.left = '100px'
      win.style.top = '50px'
      document.querySelector<HTMLElement>('.tl .g')!.click()
      document.querySelector<HTMLElement>('.tl .g')!.click()
      expect(win.style.left).toBe('100px')
      expect(win.style.top).toBe('50px')
    })

    it('after unmaximize vi.runAllTimers clears transition', () => {
      document.querySelector<HTMLElement>('.tl .g')!.click()
      document.querySelector<HTMLElement>('.tl .g')!.click()
      vi.runAllTimers()
      expect(document.querySelector<HTMLElement>('[data-win-id="test"]')!.style.transition).toBe('')
    })
  })

  describe('startDrag', () => {
    let win: HTMLElement
    let tb: HTMLElement
    let canvas: HTMLElement

    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 })
      win = document.querySelector<HTMLElement>('[data-win-id="test"]')!
      tb = win.querySelector<HTMLElement>('.win-tb')!
      canvas = document.querySelector<HTMLElement>('.wm-canvas')!
      Object.defineProperty(canvas, 'clientWidth', { value: 1440, configurable: true })
      Object.defineProperty(canvas, 'clientHeight', { value: 900, configurable: true })
      Object.defineProperty(win, 'offsetLeft', { value: 100, configurable: true })
      Object.defineProperty(win, 'offsetTop', { value: 50, configurable: true })
      Object.defineProperty(win, 'offsetWidth', { value: 500, configurable: true })
    })

    it('mousemove after mousedown on win-tb moves window', () => {
      // ox = clientX(150) - offsetLeft(100) = 50; newLeft = 250 - 50 = 200
      // oy = clientY(70)  - offsetTop(50)  = 20; newTop  = 120 - 20 = 100
      tb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 150, clientY: 70 }))
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 250, clientY: 120 }))
      expect(win.style.left).toBe('200px')
      expect(win.style.top).toBe('100px')
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })

    it('mouseup stops drag — subsequent mousemove has no effect', () => {
      tb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 150, clientY: 70 }))
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 250, clientY: 120 }))
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
      const leftAfterUp = win.style.left
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 800, clientY: 500 }))
      expect(win.style.left).toBe(leftAfterUp)
    })

    it('drag clamps left at canvas.clientWidth - 100', () => {
      tb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 150, clientY: 70 }))
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 99999, clientY: 70 }))
      expect(parseInt(win.style.left)).toBeLessThanOrEqual(1440 - 100)
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })
  })

  describe('startResize', () => {
    let win: HTMLElement

    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 })
      win = document.querySelector<HTMLElement>('[data-win-id="test"]')!
      Object.defineProperty(win, 'offsetLeft', { value: 100, configurable: true })
      Object.defineProperty(win, 'offsetTop', { value: 50, configurable: true })
      Object.defineProperty(win, 'offsetWidth', { value: 500, configurable: true })
      Object.defineProperty(win, 'offsetHeight', { value: 400, configurable: true })
    })

    it('addRh adds 8 resize handles to window', () => {
      expect(win.querySelectorAll('.rh').length).toBe(8)
    })

    it('mousedown on .rh-se + mousemove increases width and height', () => {
      const rh = win.querySelector<HTMLElement>('.rh-se')!
      rh.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 600, clientY: 450 }))
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 650, clientY: 480 }))
      expect(parseInt(win.style.width)).toBeGreaterThan(500)
      expect(parseInt(win.style.height)).toBeGreaterThan(400)
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })

    it('resize respects MIN_W — width does not go below 480', () => {
      const rh = win.querySelector<HTMLElement>('.rh-w')!
      rh.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 250 }))
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 99999, clientY: 250 }))
      expect(parseInt(win.style.width)).toBeGreaterThanOrEqual(480)
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })

    it('mouseup ends resize — further mousemove has no effect', () => {
      const rh = win.querySelector<HTMLElement>('.rh-se')!
      rh.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 600, clientY: 450 }))
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 650, clientY: 480 }))
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
      const widthAfterUp = win.style.width
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 900, clientY: 700 }))
      expect(win.style.width).toBe(widthAfterUp)
    })
  })
})
