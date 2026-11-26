import { initSmoothScroll } from '/src/main.js'
import { prefersReducedMotion, EASE, DURATION } from '/src/motion.js'
import './style.css'

const lenis = initSmoothScroll()

// Icons created from JS must be imported, otherwise Vite leaves them out of the build
const ICONS = Object.fromEntries(
  Object.entries(import.meta.glob('./assets/*.svg', { eager: true, query: '?url', import: 'default' })).map(([path, url]) => [
    path.replace('./assets/', '').replace('.svg', ''),
    url,
  ]),
)

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
  node.src = ICONS[name]
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
  function chip(part, { handle = true, removable = true } = {}) {
    const node = el('span', 'part')
    node.dataset.part = part
    if (handle) {
      node.dataset.drag = ''
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
        group.dataset.drag = ''
        const head = chip(part, { removable: part !== required })
        delete head.dataset.drag
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
      add.dataset.drag = ''
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

  /* Pointer-based drag (mouse, touch and pen alike; native drag & drop doesn't work on touch).
     While dragging, a dashed placeholder stands where the part will land and the other parts
     and separators slide out of its way (FLIP: only transform and opacity are animated).
     On release the part flies into the placeholder; released outside the field it flies back.
     Parts in the field are dragged right away; add chips are dragged with a mouse
     (on touch they are tapped, so swiping over them still scrolls the page). */
  const DRAG_THRESHOLD = 6 // px before a press turns into a drag
  const DROP_SLACK = 24 // px of forgiving drop zone around the field
  const GHOST_SCALE = 1.04
  let drag = null
  let suppressClick = false

  const motion = (duration = DURATION.fast) => ({ duration: prefersReducedMotion() ? 0 : duration * 1000, easing: EASE })
  const trackEl = () => root.querySelector('[data-track]')
  const trackItems = () => [...trackEl().children].filter((node) => node.dataset.part)

  // Re-lay the field in a new order and animate everything from where it was (FLIP)
  function layout(order) {
    const track = trackEl()
    const before = new Map([...track.children].map((node) => [node, node.getBoundingClientRect()]))
    track.getAnimations({ subtree: true }).forEach((animation) => animation.cancel())

    const joints = [...track.querySelectorAll(':scope > .builder__joint')]
    joints.forEach((joint) => joint.remove())
    order.forEach((item, index) => {
      if (index > 0) {
        const joint = joints.shift() || el('span', 'builder__joint is-new', separatorSymbol())
        track.append(joint)
      }
      track.append(item)
    })

    ;[...track.children].forEach((node) => {
      if (node.classList.contains('is-new')) {
        node.classList.remove('is-new')
        node.animate([{ opacity: 0 }, { opacity: 1 }], motion())
        return
      }
      const from = before.get(node)
      if (!from) return
      const to = node.getBoundingClientRect()
      const dx = from.left - to.left
      const dy = from.top - to.top
      if (dx || dy) node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], motion())
    })
  }

  // Index among the other parts where the dragged one goes; uses layout boxes, not animated ones
  function targetIndex(x, y) {
    const track = trackEl()
    const box = track.getBoundingClientRect()
    const px = x - box.left - track.clientLeft
    const others = trackItems().filter((node) => node !== drag.placeholder)
    // Slightly above or below the field still counts as the first / last row
    const rowsTop = Math.min(...others.map((node) => node.offsetTop))
    const rowsBottom = Math.max(...others.map((node) => node.offsetTop + node.offsetHeight))
    const py = Math.min(Math.max(y - box.top - track.clientTop, rowsTop + 1), rowsBottom - 1)
    const index = others.findIndex((node) => {
      const top = node.offsetTop
      const bottom = top + node.offsetHeight
      return py < top || (py <= bottom && px < node.offsetLeft + node.offsetWidth / 2)
    })
    return { others, index: index === -1 ? others.length : index }
  }

  const overTrack = (x, y) => {
    const rect = trackEl().getBoundingClientRect()
    return x > rect.left - DROP_SLACK && x < rect.right + DROP_SLACK && y > rect.top - DROP_SLACK && y < rect.bottom + DROP_SLACK
  }

  const sameOrder = (a, b) => a.length === b.length && a.every((node, i) => node === b[i])

  function placeAt(x, y) {
    const track = trackEl()
    if (overTrack(x, y)) {
      track.classList.add('is-drop-target')
      if (!drag.placeholder) {
        // From an add chip: a placeholder appears in the field
        drag.placeholder = chip(drag.key, { removable: false })
        drag.placeholder.classList.add('is-placeholder')
      }
      const { others, index } = targetIndex(x, y)
      const order = [...others]
      order.splice(index, 0, drag.placeholder)
      if (!sameOrder(order, trackItems())) layout(order)
    } else {
      track.classList.remove('is-drop-target')
      if (drag.from === 'track') {
        // Outside the field the part goes back to where it was
        if (!sameOrder(drag.origin, trackItems())) layout(drag.origin)
      } else if (drag.placeholder) {
        const order = trackItems().filter((node) => node !== drag.placeholder)
        drag.placeholder = null
        layout(order)
      }
    }
  }

  function startDrag() {
    const rect = drag.source.getBoundingClientRect()
    const ghost = drag.source.cloneNode(true)
    ghost.classList.add('builder__ghost')
    ghost.style.left = `${rect.left}px`
    ghost.style.top = `${rect.top}px`
    ghost.style.width = `${rect.width}px`
    document.body.append(ghost)
    drag.ghost = ghost
    drag.rect = rect
    drag.origin = trackItems()
    if (drag.from === 'track') {
      drag.placeholder = drag.source
      drag.source.classList.add('is-placeholder')
    } else {
      drag.source.classList.add('is-dragging')
    }
    document.documentElement.classList.add('is-builder-dragging')
  }

  function moveGhost(x, y) {
    drag.ghost.style.transform = `translate(${x - drag.startX}px, ${y - drag.startY}px) scale(${GHOST_SCALE})`
  }

  function endDrag(x, y, cancelled) {
    const current = drag
    drag = null
    const track = trackEl()
    track.classList.remove('is-drop-target')
    document.documentElement.classList.remove('is-builder-dragging')

    const dropped = !cancelled && overTrack(x, y)
    // Released outside: everything returns to where it was
    if (!dropped && current.from === 'track' && !sameOrder(current.origin, trackItems())) layout(current.origin)
    if (!dropped && current.from === 'add' && current.placeholder) {
      layout(trackItems().filter((node) => node !== current.placeholder))
      current.placeholder = null
    }

    // The ghost flies into the placeholder (or back to where it came from)
    const target = (dropped && current.placeholder) || current.source
    const to = target.getBoundingClientRect()
    const flight = current.ghost.animate(
      [
        { transform: current.ghost.style.transform },
        { transform: `translate(${to.left - current.rect.left}px, ${to.top - current.rect.top}px) scale(1)` },
      ],
      { ...motion(), fill: 'forwards' },
    )

    flight.finished.then(() => {
      current.ghost.remove()
      current.source.classList.remove('is-dragging', 'is-placeholder')
      if (!dropped) return
      if (current.from === 'add' && glued && current.key === glued.part) glued.set(true)
      else if (current.from === 'add' && !current.placeholder) add(current.key)
      else setParts(trackItems().map((node) => node.dataset.part))
    })
  }

  root.addEventListener('pointerdown', (event) => {
    if (drag || event.button !== 0 || event.target.closest('[data-remove]')) return
    const source = event.target.closest('[data-drag]')
    if (!source) return
    const from = source.dataset.add ? 'add' : 'track'
    if (from === 'add' && event.pointerType !== 'mouse') return
    drag = { key: source.dataset.part || source.dataset.add, from, source, startX: event.clientX, startY: event.clientY, active: false, id: event.pointerId, placeholder: null }
    try {
      source.setPointerCapture(event.pointerId) // keep getting moves outside the part
    } catch {
      // no active pointer (e.g. a synthetic event): moves still bubble to the builder
    }
    if (event.pointerType === 'mouse') event.preventDefault() // no text selection
  })

  root.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return
    if (!drag.active) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < DRAG_THRESHOLD) return
      drag.active = true
      startDrag()
    }
    moveGhost(event.clientX, event.clientY)
    // The mix part is always glued to the track title, so it has no place to choose
    if (!(drag.from === 'add' && glued && drag.key === glued.part)) placeAt(event.clientX, event.clientY)
    else trackEl().classList.toggle('is-drop-target', overTrack(event.clientX, event.clientY))
  })

  const finish = (event) => {
    if (!drag || event.pointerId !== drag.id) return
    if (!drag.active) {
      drag = null
      return
    }
    // The press was a drag, not a tap on an add chip: swallow a click that follows right away.
    // Browsers don't always send one, so drop the flag on the next tick.
    suppressClick = true
    setTimeout(() => (suppressClick = false))
    endDrag(event.clientX, event.clientY, event.type === 'pointercancel')
  }
  root.addEventListener('pointerup', finish)
  root.addEventListener('pointercancel', finish)

  // Swallow the click that follows a drag
  root.addEventListener(
    'click',
    (event) => {
      if (!suppressClick) return
      suppressClick = false
      event.stopImmediatePropagation()
      event.preventDefault()
    },
    true,
  )

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
