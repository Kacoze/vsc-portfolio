import './style.css'
import './wm'
import './editor'

function loadDeferred(): void {
  import('./reveal')
  import('./lazy')
}

if (document.readyState === 'complete') {
  loadDeferred()
} else {
  window.addEventListener('load', loadDeferred, { once: true })
}
