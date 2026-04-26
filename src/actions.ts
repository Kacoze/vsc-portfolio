export function init(): void {
  document.querySelectorAll<HTMLElement>('.ci-job').forEach(job => {
    job.addEventListener('click', () => {
      const steps = job.nextElementSibling as HTMLElement | null
      if (!steps?.classList.contains('ci-steps')) return
      const isOpen = !steps.hidden
      steps.hidden = isOpen
      job.classList.toggle('open', !isOpen)
    })
  })

  const btn = document.getElementById('ci-rerun') as HTMLButtonElement | null
  const badge = document.getElementById('ci-badge')
  const exit = document.getElementById('ci-exit')

  if (btn && badge) {
    btn.addEventListener('click', () => {
      btn.disabled = true
      badge.classList.add('running')
      badge.textContent = '⟳ Running…'
      if (exit) exit.textContent = ''

      const jobs = document.querySelectorAll<HTMLElement>('.ci-win .ci-check')
      jobs.forEach(j => {
        j.style.background = 'var(--fg-subtle)'
        j.style.color = 'transparent'
      })

      let delay = 0
      jobs.forEach(j => {
        delay += 600 + Math.random() * 400
        setTimeout(() => {
          j.style.background = 'var(--pass)'
          j.style.color = '#081512'
        }, delay)
      })

      setTimeout(() => {
        badge.classList.remove('running')
        badge.textContent = '✓ Passed'
        if (exit) exit.textContent = '→ process exited with code 0'
        btn.disabled = false
      }, delay + 400)
    })
  }

  let diffPop: HTMLElement | null = null

  document.querySelectorAll<HTMLElement>('.sc-hash[data-diff]').forEach(hash => {
    hash.addEventListener('mouseenter', () => {
      diffPop?.remove()
      diffPop = document.createElement('div')
      diffPop.className = 'diff-pop'
      hash.dataset.diff!.split('\n').forEach(line => {
        const d = document.createElement('div')
        d.className = line.startsWith('+') ? 'diff-add' : line.startsWith('-') ? 'diff-del' : ''
        d.textContent = line
        diffPop!.appendChild(d)
      })
      document.body.appendChild(diffPop)
    })

    hash.addEventListener('mousemove', e => {
      if (diffPop) {
        diffPop.style.left = e.clientX + 16 + 'px'
        diffPop.style.top = e.clientY - 20 + 'px'
      }
    })

    hash.addEventListener('mouseleave', () => {
      diffPop?.remove()
      diffPop = null
    })
  })
}
