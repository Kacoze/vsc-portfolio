const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function initTerminalReveal(): void {
  if (reducedMotion) return
  const lines = document.querySelectorAll<HTMLElement>('.t-line')
  if (!lines.length) return
  let delay = 700
  lines.forEach(line => {
    const isEmpty = line.textContent?.trim() === ''
    setTimeout(() => { line.style.opacity = '1' }, delay)
    delay += isEmpty ? 50 : 85
  })
}

if (document.readyState === 'complete') {
  initTerminalReveal()
} else {
  window.addEventListener('load', initTerminalReveal)
}

export {}
