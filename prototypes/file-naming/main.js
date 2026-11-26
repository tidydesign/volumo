import { initSmoothScroll } from '/src/main.js'
import { prefersReducedMotion } from '/src/motion.js'
import './style.css'

const lenis = initSmoothScroll()

const ASSETS = '/prototypes/file-naming/assets'

/* ───────── Data ───────── */

// Sample tracks for the file name example (Randomize cycles through them)
const TRACKS = [
  { artists: 'Route 94', title: '4Get The Girl', mix: 'GUDFELLA & Jackie Hollander Extended Remix', bpm: '124', key: '8A', label: 'Toolroom', genre: 'Tech House', catalog: 'TOOL1394', release: '4Get The Girl (Remixes)', year: '2025' },
  { artists: 'Mira Lund', title: 'Night Signals', mix: 'Original Mix', bpm: '122', key: '5A', label: 'Flores', genre: 'Afro House', catalog: 'FLRS021', release: 'Night Signals', year: '2026' },
  { artists: 'Kassio & Delune', title: 'Low Tide', mix: 'Extended Mix', bpm: '120', key: '11A', label: 'Deepwater', genre: 'Melodic House', catalog: 'DPW044', release: 'Low Tide EP', year: '2024' },
]

// The release used in the folders example
const RELEASE = { artists: 'Budakid', label: 'Flores', catalog: 'FLRS018', release: 'Dreams Stretched Beyond Remixes', year: '2023', purchased: '2026-09', released: '2023-03' }
const RELEASE_TRACKS = [
  { title: 'Hearts', mix: 'Argia Remix', genre: 'Afro House', bpm: '120', key: '8A' },
  { title: 'Endless', mix: 'Gerd Janson Remix', genre: 'House', bpm: '124', key: '5A' },
  { title: "Lovin' Sun", mix: 'Guy J Remix', genre: 'House', bpm: '122', key: '11B' },
  { title: 'Tannenheim', mix: 'Map.ache Remix', genre: 'Deep House', bpm: '118', key: '2A' },
  { title: 'Is No Ova', mix: 'Fort Romeau Remix', genre: 'House', bpm: '123', key: '9A' },
].map((track) => ({ ...RELEASE, ...track }))

// File name parts: chip label in previews, label in the builder
const FILE_FIELDS = {
  artists: { chip: 'Artists', builder: 'Artists' },
  title: { chip: 'Track title', builder: 'Track title' },
  mix: { chip: 'Mix name', builder: '(Mix name)' },
  genre: { chip: 'Genre', builder: 'Genre' },
  key: { chip: 'Key', builder: 'Key' },
  bpm: { chip: 'BPM', builder: 'BPM' },
  label: { chip: 'Label', builder: '[Label]' },
  catalog: { chip: 'Catalog', builder: 'Catalog' },
  release: { chip: 'Release', builder: 'Release' },
  year: { chip: 'Release year', builder: 'Release year' },
}

const FOLDER_FIELDS = {
  label: { chip: 'Label', builder: 'Label' },
  release: { chip: 'Release title', builder: 'Release title' },
  catalog: { chip: 'Catalog', builder: 'Catalog' },
  artists: { chip: 'Release artists', builder: 'Release artists' },
  year: { chip: 'Release year', builder: 'Release year' },
}

const PRESETS = {
  standard: ['artists', 'title', 'mix'],
  bpm: ['bpm', 'artists', 'title', 'mix'],
  keybpm: ['key', 'bpm', 'artists', 'title', 'mix'],
  label: ['artists', 'title', 'mix', 'label'],
}

const FOLDER_PRESETS = {
  title: ['release'],
  catalog: ['catalog', 'release'],
  labelcat: ['label', 'catalog', 'release'],
}

const SEPARATORS = { dash: '-', long: '—', underscore: '_' }

// Parts glued to the previous one with a space instead of the separator, and their brackets
const WRAPPED = { mix: ['(', ')'], label: ['[', ']'] }

/* ───────── State ───────── */

const state = {
  track: 0,
  preset: 'standard',
  custom: { parts: ['artists', 'title', 'genre'], mix: true }, // mix is glued to the track title
  separator: 'dash',
  customSeparator: '=',
  space: ' ',
  keepOriginal: true,
  folders: true,
  group: 'releases',
  releaseFolder: 'labelcat',
  folderCustom: { parts: ['label', 'release', 'catalog'] },
  dateFolder: 'purchase',
  cover: true,
  trackNumbers: true,
}

/* ───────── Naming rules ───────── */

const separatorSymbol = () =>
  state.separator === 'custom' ? state.customSeparator.trim() || '-' : SEPARATORS[state.separator]

const customFileParts = () => {
  const parts = []
  state.custom.parts.forEach((part) => {
    parts.push(part)
    if (part === 'title' && state.custom.mix) parts.push('mix')
  })
  return parts
}

const fileParts = (preset = state.preset) => (preset === 'custom' ? customFileParts() : PRESETS[preset])

const fieldValue = (part, track) => {
  const value = track[part]
  if (part === 'mix' && !state.keepOriginal && value === 'Original Mix') return ''
  const wrap = WRAPPED[part]
  return wrap ? `${wrap[0]}${value}${wrap[1]}` : value
}

// "Artists - Track title (Mix name) [Label]" with the chosen separator and space symbol
function buildName(parts, track, prefix = '') {
  const sep = separatorSymbol()
  let name = prefix
  parts.forEach((part) => {
    const value = fieldValue(part, track)
    if (!value) return
    if (name) name += WRAPPED[part] ? ' ' : ` ${sep} `
    name += value
  })
  return name.replace(/ /g, state.space)
}

const fileName = (track, prefix = '') => `${buildName(fileParts(), track, prefix)}.wav`

const folderParts = () =>
  state.releaseFolder === 'custom' ? state.folderCustom.parts : FOLDER_PRESETS[state.releaseFolder]

const folderName = (parts) => parts.map((part) => RELEASE[part]).join(' - ')

/* ───────── Rendering helpers ───────── */

const el = (tag, className, text) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

const img = (name, size) => {
  const node = document.createElement('img')
  node.src = `${ASSETS}/${name}.svg`
  node.alt = ''
  node.width = size
  node.height = size
  return node
}

// How a joint looks in the previews: "-" for the default space, "_=_" with underscores
const jointText = (text) => (state.space === ' ' ? text.trim() : text.replace(/ /g, state.space))
const chipText = (text) => (state.space === ' ' ? text : text.replace(/ /g, state.space))

// Chip preview of a structure: [Artists] - [Track title] ( [Mix name] ) .format
function renderChips(container, parts, fields, { withFormat = true, folder = false } = {}) {
  const sep = separatorSymbol()
  container.replaceChildren()
  parts.forEach((part, index) => {
    // Folder names: plain " - " joints, no brackets, no space symbol
    const wrap = folder ? null : WRAPPED[part]
    if (index > 0) {
      const joint = folder ? '-' : jointText(wrap ? ' ' : ` ${sep} `)
      if (joint) container.append(el('span', 'chips__joint', joint))
    }
    if (wrap) container.append(el('span', 'chips__joint', wrap[0]))
    container.append(el('span', 'tag', folder ? fields[part].chip : chipText(fields[part].chip)))
    if (wrap) container.append(el('span', 'chips__joint', wrap[1]))
  })
  if (withFormat) container.append(el('span', 'tag tag--muted', '.format'))
}

/* ───────── Builder (Custom): drag to reorder, click or drag to add ───────── */

function createBuilder(root, { fields, required, getParts, setParts, available, glued }) {
  let dragKey = null
  let dragSource = null

  function chip(part, { handle = true, removable = true } = {}) {
    const node = el('span', 'part')
    node.dataset.part = part
    if (handle) {
      node.draggable = true
      node.append(img('drag', 16))
    } else {
      node.classList.add('part--glued')
    }
    node.append(el('span', 'part__label', fields[part].builder))
    if (removable) {
      const remove = el('button', 'part__remove')
      remove.type = 'button'
      remove.setAttribute('aria-label', `Remove ${fields[part].chip}`)
      remove.dataset.remove = part
      remove.append(img('close-16', 16))
      node.append(remove)
    }
    return node
  }

  function render() {
    const parts = getParts()
    const track = el('div', 'builder__track')
    track.dataset.track = ''
    parts.forEach((part, index) => {
      if (index > 0) track.append(el('span', 'builder__joint', separatorSymbol()))
      const gluedPart = glued?.after === part && glued.isOn()
      if (gluedPart) {
        const group = el('span', 'builder__group')
        group.dataset.part = part
        group.draggable = true
        const head = chip(part, { removable: part !== required })
        head.draggable = false
        group.append(head, chip(glued.part, { handle: false }))
        track.append(group)
      } else {
        track.append(chip(part, { removable: part !== required }))
      }
    })

    const adds = el('div', 'builder__adds')
    available().forEach((part) => {
      const add = el('button', 'add-chip')
      add.type = 'button'
      add.draggable = true
      add.dataset.add = part
      add.append(img('plus-16', 16), el('span', 'add-chip__label', fields[part].builder))
      adds.append(add)
    })

    const top = el('div', 'builder__block')
    top.append(track, el('p', 'builder__hint', 'Drag parts to reorder'))
    const bottom = el('div', 'builder__block')
    bottom.append(adds, el('p', 'builder__hint', 'Click or drag to add it into the name'))
    root.replaceChildren(top, bottom)
  }

  function insertAt(part, beforePart) {
    const parts = getParts().filter((p) => p !== part)
    const index = beforePart ? parts.indexOf(beforePart) : -1
    if (index === -1) parts.push(part)
    else parts.splice(index, 0, part)
    setParts(parts)
  }

  function add(part) {
    if (glued && part === glued.part) glued.set(true)
    else setParts([...getParts(), part])
  }

  root.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove]')
    if (remove) {
      const part = remove.dataset.remove
      if (glued && part === glued.part) glued.set(false)
      else setParts(getParts().filter((p) => p !== part))
      return
    }
    const addButton = event.target.closest('[data-add]')
    if (addButton) add(addButton.dataset.add)
  })

  root.addEventListener('dragstart', (event) => {
    const source = event.target.closest('[data-part][draggable="true"], [data-add]')
    if (!source) return
    dragKey = source.dataset.part || source.dataset.add
    dragSource = source.dataset.add ? 'add' : 'track'
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', dragKey)
    requestAnimationFrame(() => source.classList.add('is-dragging'))
  })

  root.addEventListener('dragend', () => {
    root.querySelectorAll('.is-dragging, .is-drop-target').forEach((node) => node.classList.remove('is-dragging', 'is-drop-target'))
    dragKey = null
  })

  // Drop before the part under the pointer (or at the end)
  const targetPart = (event) => {
    const items = [...root.querySelectorAll('[data-track] > [data-part]')]
    return items.find((item) => {
      const rect = item.getBoundingClientRect()
      const sameRow = event.clientY >= rect.top && event.clientY <= rect.bottom
      return (sameRow && event.clientX < rect.left + rect.width / 2) || event.clientY < rect.top
    })
  }

  root.addEventListener('dragover', (event) => {
    if (!dragKey || !event.target.closest('[data-track]')) return
    event.preventDefault()
    root.querySelector('[data-track]').classList.add('is-drop-target')
  })

  root.addEventListener('dragleave', (event) => {
    const track = event.target.closest('[data-track]')
    if (track && !track.contains(event.relatedTarget)) track.classList.remove('is-drop-target')
  })

  root.addEventListener('drop', (event) => {
    if (!dragKey || !event.target.closest('[data-track]')) return
    event.preventDefault()
    const before = targetPart(event)?.dataset.part
    if (dragSource === 'add' && glued && dragKey === glued.part) glued.set(true)
    else if (before !== dragKey) insertAt(dragKey, before)
  })

  return { render }
}

/* ───────── File naming ───────── */

const exampleName = document.querySelector('[data-example-name]')
const fileBuilderRoot = document.querySelector('[data-builder="file"]')
const folderBuilderRoot = document.querySelector('[data-builder="folder"]')

const fileBuilder = createBuilder(fileBuilderRoot, {
  fields: FILE_FIELDS,
  required: 'title',
  getParts: () => state.custom.parts,
  setParts: (parts) => {
    state.custom.parts = parts
    render()
  },
  available: () => {
    const used = new Set(customFileParts())
    return ['artists', 'mix', 'key', 'bpm', 'label', 'catalog', 'release', 'year', 'genre'].filter((part) => !used.has(part))
  },
  glued: {
    part: 'mix',
    after: 'title',
    isOn: () => state.custom.mix,
    set: (on) => {
      state.custom.mix = on
      render()
    },
  },
})

const folderBuilder = createBuilder(folderBuilderRoot, {
  fields: FOLDER_FIELDS,
  required: 'release',
  getParts: () => state.folderCustom.parts,
  setParts: (parts) => {
    state.folderCustom.parts = parts
    render()
  },
  available: () => ['label', 'catalog', 'artists', 'year'].filter((part) => !state.folderCustom.parts.includes(part)),
})

function renderFileNaming() {
  exampleName.textContent = fileName(TRACKS[state.track])

  document.querySelectorAll('[data-chips]').forEach((container) => {
    renderChips(container, fileParts(container.dataset.chips), FILE_FIELDS)
  })

  fileBuilder.render()
}

/* ───────── Folders ───────── */

const tree = document.querySelector('[data-tree]')
const zipName = document.querySelector('[data-zip-name]')

function fileItem(track, index, { flat = false } = {}) {
  const number = state.trackNumbers ? String(index + 1).padStart(2, '0') : ''
  const item = el('li', flat ? 'tree__file tree__file--flat' : 'tree__file')
  item.append(img('file-audio', 16), el('span', 'tree__name', fileName(track, number)))
  return item
}

function folderItem(name, files) {
  const item = el('li', 'tree__folder')
  const head = el('p', 'tree__folder-name')
  head.append(img('folder', 16), el('span', 'tree__name', name))
  const list = el('ul', 'tree__files')
  list.append(...files)
  item.append(head, list)
  return item
}

function renderFolders() {
  document.querySelectorAll('[data-folder-chips]').forEach((container) => {
    renderChips(container, FOLDER_PRESETS[container.dataset.folderChips], FOLDER_FIELDS, { withFormat: false, folder: true })
  })

  folderBuilder.render()

  const plainZip = folderName(['label', 'release'])
  let items = []
  let zip = plainZip

  if (!state.folders) {
    items = RELEASE_TRACKS.map((track, index) => fileItem(track, index, { flat: true }))
  } else if (state.group === 'releases') {
    const name = folderName(folderParts())
    const files = RELEASE_TRACKS.map((track, index) => fileItem(track, index))
    if (state.cover) {
      const cover = el('li', 'tree__file')
      cover.append(img('image', 16), el('span', 'tree__name', 'Cover.jpg'))
      files.push(cover)
    }
    items = [folderItem(name, files)]
    zip = name
  } else if (state.group === 'dates') {
    const name = state.dateFolder === 'purchase' ? RELEASE.purchased : RELEASE.released
    items = [folderItem(name, RELEASE_TRACKS.map((track, index) => fileItem(track, index)))]
  } else {
    const genres = [...new Set(RELEASE_TRACKS.map((track) => track.genre))].sort()
    items = genres.map((genre) =>
      folderItem(
        genre,
        RELEASE_TRACKS.map((track, index) => (track.genre === genre ? fileItem(track, index) : null)).filter(Boolean),
      ),
    )
  }

  tree.replaceChildren(...items)
  zipName.textContent = `${zip}.zip`

  // Show / hide what depends on the switches and the group tabs
  document.querySelectorAll('[data-when]').forEach((node) => (node.hidden = !state[node.dataset.when]))
  document.querySelectorAll('[data-when-off]').forEach((node) => (node.hidden = state[node.dataset.whenOff]))
  document.querySelectorAll('[data-group-panel]').forEach((node) => (node.hidden = node.dataset.groupPanel !== state.group))
  document.querySelectorAll('[data-group]').forEach((tab) => {
    const active = tab.dataset.group === state.group
    tab.classList.toggle('pill-tab--active', active)
    tab.setAttribute('aria-checked', String(active))
  })
}

function render() {
  renderFileNaming()
  renderFolders()
}

/* ───────── Inputs ───────── */

const RADIO_STATE = {
  preset: 'preset',
  separator: 'separator',
  space: 'space',
  'release-folder': 'releaseFolder',
  'date-folder': 'dateFolder',
}

document.addEventListener('change', (event) => {
  const key = RADIO_STATE[event.target.name]
  if (!key) return
  state[key] = event.target.value
  render()
})

const customSeparator = document.querySelector('[data-custom-separator]')
customSeparator.addEventListener('focus', () => {
  const radio = customSeparator.closest('label').querySelector('input[type="radio"]')
  if (!radio.checked) {
    radio.checked = true
    radio.dispatchEvent(new Event('change', { bubbles: true }))
  }
})
customSeparator.addEventListener('input', () => {
  state.customSeparator = customSeparator.value
  render()
})

document.querySelectorAll('[data-switch]').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const key = toggle.dataset.switch
    state[key] = !state[key]
    toggle.setAttribute('aria-checked', String(state[key]))
    render()
  })
})

document.querySelectorAll('[data-group]').forEach((tab) => {
  tab.addEventListener('click', () => {
    state.group = tab.dataset.group
    render()
  })
})

document.querySelector('[data-randomize]').addEventListener('click', (event) => {
  state.track = (state.track + 1) % TRACKS.length
  const icon = event.currentTarget.querySelector('img')
  if (!prefersReducedMotion()) {
    icon.classList.remove('is-spinning')
    void icon.offsetWidth // restart the animation
    icon.classList.add('is-spinning')
  }
  render()
})

/* ───────── Page tabs: jump to a section ───────── */

const squareTabs = document.querySelectorAll('[data-jump]')

const setActiveTab = (id) => {
  squareTabs.forEach((tab) => {
    const active = tab.dataset.jump === id
    tab.classList.toggle('square-tab--active', active)
    tab.setAttribute('aria-selected', String(active))
  })
}

squareTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const id = tab.dataset.jump
    setActiveTab(id)
    const target = id === 'file-naming' ? 0 : document.getElementById(id)
    const offset = -document.querySelector('.head').offsetHeight
    if (lenis) lenis.scrollTo(target, { offset })
    else window.scrollTo({ top: target ? target.getBoundingClientRect().top + window.scrollY + offset : 0 })
  })
})

// Highlight the tab of the section in view
const sections = [...document.querySelectorAll('.settings__section')]
const observer = new IntersectionObserver(
  () => {
    const line = window.innerHeight * 0.4
    const current = sections.filter((section) => section.getBoundingClientRect().top < line).pop() || sections[0]
    setActiveTab(current.id)
  },
  { threshold: [0, 0.25, 0.5, 0.75, 1] },
)
sections.forEach((section) => observer.observe(section))

// Selected preset: the icon turns into a check on a green circle
document.querySelectorAll('.preset__icon').forEach((holder) => {
  const check = img('check-dark', 20)
  check.className = 'preset__check'
  holder.append(check)
})

/* ───────── Mobile account menu ───────── */

const accountToggle = document.querySelector('[data-account-toggle]')
accountToggle.addEventListener('click', () => {
  const open = accountToggle.getAttribute('aria-expanded') !== 'true'
  accountToggle.setAttribute('aria-expanded', String(open))
  document.querySelector('.account').classList.toggle('account--open', open)
})

render()
