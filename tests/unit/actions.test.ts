import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const HTML = `
<section class="win ci-win" data-win-id="actions">
  <div class="ci-job"><span class="ci-check">✓</span> lint</div>
  <div class="ci-steps" hidden>lint step details</div>
  <div class="ci-job"><span class="ci-check">✓</span> build</div>
  <div class="ci-steps" hidden>build step details</div>
  <div class="ci-badge" id="ci-badge">✓ Passed</div>
  <div id="ci-exit">→ process exited with code 0</div>
  <button id="ci-rerun" type="button">↻ Re-run all jobs</button>
  <span class="sc-hash" data-diff="+added line&#10;-removed line&#10; context line">abc1234</span>
</section>`

describe('actions.init()', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.resetModules()
    document.body.innerHTML = HTML
    const mod = await import('../../src/actions')
    mod.init()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('init does not throw', () => {
    expect(() => document.getElementById('ci-rerun')).not.toThrow()
  })

  describe('CI job toggle', () => {
    it('clicking job shows steps', () => {
      const job = document.querySelector<HTMLElement>('.ci-job')!
      const steps = job.nextElementSibling as HTMLElement
      expect(steps.hidden).toBe(true)
      job.click()
      expect(steps.hidden).toBe(false)
    })

    it('clicking job adds .open class', () => {
      const job = document.querySelector<HTMLElement>('.ci-job')!
      job.click()
      expect(job.classList.contains('open')).toBe(true)
    })

    it('clicking job twice collapses steps', () => {
      const job = document.querySelector<HTMLElement>('.ci-job')!
      const steps = job.nextElementSibling as HTMLElement
      job.click()
      job.click()
      expect(steps.hidden).toBe(true)
    })

    it('clicking job twice removes .open class', () => {
      const job = document.querySelector<HTMLElement>('.ci-job')!
      job.click()
      job.click()
      expect(job.classList.contains('open')).toBe(false)
    })

    it('only the clicked job expands — sibling stays collapsed', () => {
      const jobs = document.querySelectorAll<HTMLElement>('.ci-job')
      jobs[0].click()
      const sibling = jobs[1].nextElementSibling as HTMLElement
      expect(sibling.hidden).toBe(true)
    })
  })

  describe('CI rerun button', () => {
    it('click disables the button', () => {
      const btn = document.getElementById('ci-rerun') as HTMLButtonElement
      btn.click()
      expect(btn.disabled).toBe(true)
    })

    it('click adds running class to badge', () => {
      const badge = document.getElementById('ci-badge')!
      document.getElementById('ci-rerun')!.click()
      expect(badge.classList.contains('running')).toBe(true)
    })

    it('click changes badge text to Running', () => {
      const badge = document.getElementById('ci-badge')!
      document.getElementById('ci-rerun')!.click()
      expect(badge.textContent).toBe('⟳ Running…')
    })

    it('after animation badge shows Passed', () => {
      const badge = document.getElementById('ci-badge')!
      document.getElementById('ci-rerun')!.click()
      vi.runAllTimers()
      expect(badge.textContent).toContain('Passed')
    })

    it('after animation button is re-enabled', () => {
      const btn = document.getElementById('ci-rerun') as HTMLButtonElement
      btn.click()
      vi.runAllTimers()
      expect(btn.disabled).toBe(false)
    })

    it('after animation running class is removed', () => {
      const badge = document.getElementById('ci-badge')!
      document.getElementById('ci-rerun')!.click()
      vi.runAllTimers()
      expect(badge.classList.contains('running')).toBe(false)
    })
  })

  describe('diff popup (.sc-hash)', () => {
    it('mouseenter creates diff popup in body', () => {
      document.querySelector<HTMLElement>('.sc-hash')!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      expect(document.querySelector('.diff-pop')).not.toBeNull()
    })

    it('popup contains added line with diff-add class', () => {
      document.querySelector<HTMLElement>('.sc-hash')!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      expect(document.querySelector('.diff-add')?.textContent).toBe('+added line')
    })

    it('popup contains removed line with diff-del class', () => {
      document.querySelector<HTMLElement>('.sc-hash')!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      expect(document.querySelector('.diff-del')?.textContent).toBe('-removed line')
    })

    it('context line has no class', () => {
      document.querySelector<HTMLElement>('.sc-hash')!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      const divs = document.querySelectorAll('.diff-pop > div')
      expect(divs[2].className).toBe('')
    })

    it('mousemove positions popup', () => {
      const hash = document.querySelector<HTMLElement>('.sc-hash')!
      hash.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      hash.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 100, clientY: 200 }))
      const pop = document.querySelector<HTMLElement>('.diff-pop')!
      expect(pop.style.left).toBe('116px')
      expect(pop.style.top).toBe('180px')
    })

    it('mouseleave removes popup', () => {
      const hash = document.querySelector<HTMLElement>('.sc-hash')!
      hash.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      hash.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      expect(document.querySelector('.diff-pop')).toBeNull()
    })

    it('second mouseenter replaces previous popup', () => {
      const hash = document.querySelector<HTMLElement>('.sc-hash')!
      hash.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      hash.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      expect(document.querySelectorAll('.diff-pop').length).toBe(1)
    })
  })
})
