import './styles/tokens.css'
import './styles/base.css'
import './styles/hub.css'

// Lists every prototypes/<name>/index.html on the home page, so a new prototype
// shows up here without editing this file. Folders starting with "_" are skipped.
const pages = Object.keys(import.meta.glob('/prototypes/*/index.html'))
  .map((path) => path.split('/')[2])
  .filter((name) => !name.startsWith('_'))
  .sort()

const list = document.querySelector('[data-hub-list]')
const empty = document.querySelector('[data-hub-empty]')

for (const name of pages) {
  const item = document.createElement('li')
  item.className = 'hub__item'
  const link = document.createElement('a')
  link.className = 'hub__link'
  link.href = `/prototypes/${name}/`
  link.textContent = name.replace(/-/g, ' ')
  item.append(link)
  list.append(item)
}

empty.hidden = pages.length > 0
