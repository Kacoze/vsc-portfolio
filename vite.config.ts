import { defineConfig, type Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

function asyncCSS(): Plugin {
  return {
    name: 'async-css-modulepreload',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const assetsDir = path.join(dist, 'assets')
      const htmlPath = path.join(dist, 'index.html')
      let html = fs.readFileSync(htmlPath, 'utf8')

      // Async CSS: inline critical styles, load full CSS non-blocking
      html = html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        (_m, href) => {
          const cssPath = path.join(dist, href)
          let css = ''
          try { css = fs.readFileSync(cssPath, 'utf8') } catch { return _m }

          const critical = extractCritical(css)

          return [
            `<style>${critical}</style>`,
            `<link rel="preload" href="${href}" as="style">`,
            `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all';this.onload=null">`,
            `<noscript><link rel="stylesheet" href="${href}"></noscript>`,
          ].join('\n')
        }
      )

      // Modulepreload for deferred chunks — browser fetches them in parallel with
      // the main bundle so dynamic imports don't create a waterfall
      const deferredChunks = fs.readdirSync(assetsDir)
        .filter(f => /^(lazy|reveal)-/.test(f) && f.endsWith('.js'))
      const preloadHints = deferredChunks
        .map(f => `<link rel="modulepreload" href="/assets/${f}">`)
        .join('\n')
      html = html.replace('</head>', `${preloadHints}\n</head>`)

      fs.writeFileSync(htmlPath, html)
    },
  }
}

function extractCritical(css: string): string {
  const keep = [
    /:root\s*\{[^}]+\}/,
    /\*,\*::before,\*::after\{[^}]+\}/,
    /html\{[^}]+\}/,
    /body\{[^}]+\}/,
    /body::before\{[^}]+\}/,
    /\.wm-canvas\{[^}]+\}/,
    /\.dock\{[^}]+\}/,
  ]
  const desktop = '.desktop{position:relative;height:100vh;overflow:hidden;background:var(--bg-page)}'
  return keep.map(re => css.match(re)?.[0] ?? '').join('') + desktop
}

export default defineConfig({
  plugins: [asyncCSS()],
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssCodeSplit: false,
  },
  base: '/',
})
