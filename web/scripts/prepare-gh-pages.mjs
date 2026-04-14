import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join(process.cwd(), 'dist')
const indexHtmlPath = join(distDir, 'index.html')
const notFoundHtmlPath = join(distDir, '404.html')
const noJekyllPath = join(distDir, '.nojekyll')

if (!existsSync(indexHtmlPath)) {
  console.warn('Skipped GitHub Pages postbuild: dist/index.html was not found.')
  process.exit(0)
}

copyFileSync(indexHtmlPath, notFoundHtmlPath)
writeFileSync(noJekyllPath, '')
