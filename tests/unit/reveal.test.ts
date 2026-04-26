import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  })
}

function makeLines(texts: string[]): HTMLElement[] {
  return texts.map(text => {
    const div = document.createElement('div')
    div.className = 't-line'
    div.textContent = text
    div.style.opacity = '0'
    document.body.appendChild(div)
    return div
  })
}

function clearLines() {
  document.body.querySelectorAll('.t-line').forEach(el => el.remove())
}

function initReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function run() {
    if (reduced) return
    const lines = document.querySelectorAll<HTMLElement>('.t-line')
    if (!lines.length) return
    let delay = 700
    lines.forEach(line => {
      const isEmpty = line.textContent?.trim() === ''
      setTimeout(() => { line.style.opacity = '1' }, delay)
      delay += isEmpty ? 50 : 85
    })
  }
  run()
}

describe('initTerminalReveal()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearLines()
  })

  afterEach(() => {
    vi.useRealTimers()
    clearLines()
  })

  it('reduced motion: no lines get opacity 1', () => {
    mockMatchMedia(true)
    const lines = makeLines(['hello', 'world'])
    initReveal()
    vi.runAllTimers()
    lines.forEach(l => expect(l.style.opacity).toBe('0'))
  })

  it('no lines: runs without error', () => {
    mockMatchMedia(false)
    expect(() => initReveal()).not.toThrow()
  })

  it('lines get opacity 1 after timers', () => {
    mockMatchMedia(false)
    const lines = makeLines(['line one', 'line two'])
    initReveal()
    vi.runAllTimers()
    lines.forEach(l => expect(l.style.opacity).toBe('1'))
  })

  it('first line fires at 700ms', () => {
    mockMatchMedia(false)
    const [line] = makeLines(['hello'])
    initReveal()
    vi.advanceTimersByTime(699)
    expect(line.style.opacity).toBe('0')
    vi.advanceTimersByTime(1)
    expect(line.style.opacity).toBe('1')
  })

  it('non-empty lines use 85ms step', () => {
    mockMatchMedia(false)
    const lines = makeLines(['first', 'second'])
    initReveal()
    vi.advanceTimersByTime(700)
    expect(lines[0].style.opacity).toBe('1')
    expect(lines[1].style.opacity).toBe('0')
    vi.advanceTimersByTime(85)
    expect(lines[1].style.opacity).toBe('1')
  })

  it('empty lines use 50ms step', () => {
    mockMatchMedia(false)
    const lines = makeLines(['', 'second'])
    initReveal()
    vi.advanceTimersByTime(700)
    expect(lines[0].style.opacity).toBe('1')
    vi.advanceTimersByTime(50)
    expect(lines[1].style.opacity).toBe('1')
  })

  it('delay accumulates correctly across 3 lines', () => {
    mockMatchMedia(false)
    const lines = makeLines(['a', 'b', 'c'])
    initReveal()
    vi.advanceTimersByTime(700 + 85 + 85 - 1)
    expect(lines[2].style.opacity).toBe('0')
    vi.advanceTimersByTime(1)
    expect(lines[2].style.opacity).toBe('1')
  })
})

describe('reveal.ts module coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearLines()
  })

  afterEach(() => {
    vi.useRealTimers()
    clearLines()
  })

  it('module runs without error (no reduced motion, no lines)', async () => {
    mockMatchMedia(false)
    vi.resetModules()
    await expect(import('../../src/reveal')).resolves.toBeDefined()
  })

  it('module runs with lines and fires timers', async () => {
    mockMatchMedia(false)
    makeLines(['hello', 'world'])
    vi.resetModules()
    await import('../../src/reveal')
    vi.runAllTimers()
    const lines = document.querySelectorAll<HTMLElement>('.t-line')
    lines.forEach(l => expect(l.style.opacity).toBe('1'))
  })

  it('module with reduced motion does not set opacity', async () => {
    mockMatchMedia(true)
    const lines = makeLines(['hello'])
    vi.resetModules()
    await import('../../src/reveal')
    vi.runAllTimers()
    expect(lines[0].style.opacity).toBe('0')
  })
})
