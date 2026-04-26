import { initWin } from './wm'
import { init as initPostman } from './postman'
import { init as initActions } from './actions'
import POSTMAN_HTML from './templates/postman.html?raw'
import ACTIONS_HTML from './templates/actions.html?raw'
import EDITOR_VIEWS_HTML from './templates/editor-views.html?raw'

function injectEditorViews(): void {
  const specView = document.querySelector('.editor-view[data-file="spec"]')
  if (!specView) return
  specView.insertAdjacentHTML('afterend', EDITOR_VIEWS_HTML)
}

function injectWindows(): void {
  const canvas = document.querySelector('.wm-canvas')
  if (!canvas) return

  canvas.insertAdjacentHTML('beforeend', POSTMAN_HTML)
  canvas.insertAdjacentHTML('beforeend', ACTIONS_HTML)

  const postmanEl = canvas.querySelector<HTMLElement>('.win[data-win-id="postman"]')
  const actionsEl = canvas.querySelector<HTMLElement>('.win[data-win-id="actions"]')
  if (postmanEl) initWin(postmanEl)
  if (actionsEl) initWin(actionsEl)

  initPostman()
  initActions()
}

// Editor views injected immediately — tests and user interactions expect them early
setTimeout(injectEditorViews, 0)

// Postman + Actions windows: heavier, can wait for true idle
if ('requestIdleCallback' in window) {
  requestIdleCallback(injectWindows, { timeout: 2000 })
} else {
  setTimeout(injectWindows, 0)
}
