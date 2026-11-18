import { initSmoothScroll } from '/src/main.js'
import { PLAYER } from '/src/motion.js'
import './style.css'

import cover1 from './assets/cover-1.jpg'
import cover2 from './assets/cover-2.jpg'
import cover3 from './assets/cover-3.jpg'
import shareIcon from './assets/share.svg'
import curatedIcon from './assets/curated.svg'
import playIcon from './assets/play.svg'
import plusIcon from './assets/plus.svg'
import chevronIcon from './assets/chevron-down.svg'
import cartIcon from './assets/cart.svg'
import flashIcon from './assets/flash.svg'
import dotsIcon from './assets/dots.svg'
import waveStart from './assets/wave-start.svg'
import wavePathHigh from './assets/wave-path-high.svg'
import wavePathLow from './assets/wave-path-low.svg'
import waveActiveHigh from './assets/wave-active-high.svg'
import waveActiveLow from './assets/wave-active-low.svg'
import wavePlayed from './assets/wave-played.svg'
import waveEndHigh from './assets/wave-end-high.svg'
import waveEndLow from './assets/wave-end-low.svg'

// Content from the Figma frames. It is repeated so there is enough page to scroll.
const RELEASES = [
  {
    cover: cover1,
    title: 'Higher',
    extra: 'Extended Mix',
    by: 'One House',
    date: '17 May 2024',
    catalog: 'OHX029C1',
    artists: ['Pretty Girl'],
    genres: ['House', 'Dance / Pop'],
    length: '35:25',
    price: '€7.46',
    featured: true,
    tracks: [
      { title: 'Higher', extra: 'Extended Mix', genre: 'House' },
      { title: 'Higher', genre: 'House' },
      { title: 'Inside', genre: 'Dance / Pop' },
    ],
  },
  {
    cover: cover2,
    title: 'Remember How',
    by: 'Amaeo',
    date: '17 May 2024',
    catalog: 'AMAEO010',
    artists: ['Martín Dubiansky'],
    genres: ['Melodic House / Techno'],
    length: '35:25',
    price: '€7.46',
    tracks: [
      { title: 'Track Title', genre: 'Genre' },
      { title: 'Track Title', genre: 'Genre' },
    ],
  },
  {
    cover: cover3,
    title: 'Alliance, Vol. 3',
    by: 'Ft.loh Records',
    date: '24 May 2024',
    catalog: 'FTLOH027',
    artists: ['Lacarte', 'Maxime Alfocea', 'Jerom', 'RODAYA'],
    genres: ['Organic House', 'Progressive House'],
    length: '35:25',
    price: '€7.46',
    tracks: [
      { title: 'Track Title', genre: 'Genre' },
      { title: 'Track Title', genre: 'Genre' },
      { title: 'Track Title', genre: 'Genre' },
    ],
  },
]

const REPEAT = 4

const icon = (src, size = 20) => `<img src="${src}" alt="" width="${size}" height="${size}" />`
const links = (items) =>
  items.map((item) => `<a class="release__link" href="#">${item}</a>`).join('<i class="dot"></i>')
const title = (main, extra) => (extra ? `${main} <span>(${extra})</span>` : main)

// Desktop and laptop: "+ Add ⌄" and "🛒 price ⚡". Tablet and mobile: compact "+ | 🛒".
const actions = (price) => `
  <div class="buy">
    <span class="buy__group">
      <button class="buy__btn" type="button">${icon(plusIcon)}Add</button>
      <button class="buy__btn buy__btn--icon" type="button" aria-label="Add to…">${icon(chevronIcon)}</button>
    </span>
    <span class="buy__group">
      <button class="buy__btn buy__btn--price" type="button">${icon(cartIcon)}${price}</button>
      <button class="buy__btn buy__btn--icon" type="button" aria-label="Buy now">${icon(flashIcon)}</button>
    </span>
  </div>
  <div class="buy-compact">
    <button class="buy-compact__btn" type="button" aria-label="Add">${icon(plusIcon)}</button>
    <button class="buy-compact__btn" type="button" aria-label="Add to cart">${icon(cartIcon)}</button>
  </div>`

// Waveform of the current track (static picture from Figma: played up to 2:16 of 3:48)
const wavePart = (n, high, low, w) => `
  <div class="waveform__part waveform__part--${n}">
    <img class="waveform__path-high" src="${high}" alt="" width="${w}" height="30" />
    <img class="waveform__path-low" src="${low}" alt="" width="${w}" height="12" />
  </div>`

const waveform = () => `
  <div class="waveform" aria-hidden="true">
    <div class="waveform__start"><img src="${waveStart}" alt="" width="96" height="32" /></div>
    ${wavePart(1, wavePathHigh, wavePathLow, 704)}
    ${wavePart(2, wavePathHigh, wavePathLow, 704)}
    <div class="waveform__part waveform__part--3">
      <div class="waveform__clip">
        <img class="waveform__path-high" src="${waveActiveHigh}" alt="" width="633" height="30" />
        <img class="waveform__path-low" src="${waveActiveLow}" alt="" width="633" height="12" />
      </div>
      <div class="waveform__played">
        <img src="${wavePlayed}" alt="" width="64" height="32" />
        <span class="waveform__playhead"></span>
        <span class="waveform__time">2:16</span>
      </div>
    </div>
    ${wavePart(4, wavePathHigh, wavePathLow, 704)}
    <div class="waveform__end">
      <img class="waveform__end-high" src="${waveEndHigh}" alt="" width="96" height="28" />
      <img class="waveform__end-low" src="${waveEndLow}" alt="" width="96" height="12" />
      <span class="waveform__time">3:48</span>
    </div>
  </div>`

const PAUSE_ICON = `
  <svg class="track__play-icon track__play-icon--pause" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <rect x="4" y="3.333" width="2.667" height="9.333" /><rect x="9.333" y="3.333" width="2.667" height="9.333" />
  </svg>`

// Every rendered track, so the mini player can show it and scroll back to it
const TRACKS = []

const track = (item, data) => {
  const id = TRACKS.push({ ...item, release: data }) - 1
  return `
  <li class="track" data-track="${id}">
    <div class="track__row">
      <div class="track__main">
        <button class="track__play" type="button" aria-label="Play" data-play>
          <img class="track__play-icon track__play-icon--play" src="${playIcon}" alt="" width="16" height="16" />${PAUSE_ICON}
        </button>
        <span class="track__info">
          <span class="track__title">${title(item.title, item.extra)}</span>
          <span class="track__artist">Artist</span>
        </span>
      </div>
      <div class="track__genre">
        <span class="track__genre-name">${item.genre}</span>
        <span class="track__details">Tempo<i class="dot"></i>Key<i class="dot"></i>3:22</span>
      </div>
      <div class="track__actions">
        ${actions('€1.49')}
        <button class="track__more" type="button" aria-label="More">${icon(dotsIcon)}</button>
      </div>
    </div>
    ${waveform()}
  </li>`
}

const release = (data) => `
  <article class="release">
    <div class="release__cover"><img src="${data.cover}" alt="" width="240" height="240" loading="lazy" /></div>
    <div class="release__body">
      <div class="release__head">
        <h2 class="release__title">${title(data.title, data.extra)}</h2>
        <div class="release__marks">
          ${data.featured ? `<span class="release__award" title="Featured">${icon(curatedIcon, 16)}</span>` : '<span></span>'}
          <button class="icon-btn" type="button" aria-label="Share">${icon(shareIcon)}</button>
        </div>
      </div>
      <p class="release__meta">
        <span>By <a class="release__link" href="#">${data.by}</a></span><i class="dot"></i>${data.date}<i class="dot"></i>${data.catalog}
      </p>
      <div class="release__credits">
        <div class="release__credit"><span class="release__label">Artists:</span><span class="release__links">${links(data.artists)}</span></div>
        <div class="release__credit"><span class="release__label">Genres:</span><span class="release__links">${links(data.genres)}</span></div>
      </div>
      <div class="release__tracklist">
        <div class="release__options">
          <span class="release__count">${data.tracks.length} Tracks (${data.length})</span>
          <a class="release__save" href="#">Save €0.50</a>
          <div class="release__actions">${actions(data.price)}</div>
        </div>
        <ul class="release__tracks">${data.tracks.map((item) => track(item, data)).join('')}</ul>
      </div>
    </div>
  </article>`

document.querySelector('[data-releases]').innerHTML = Array.from({ length: REPEAT }, () =>
  RELEASES.map(release).join(''),
).join('')

// "More" in the tab bar: opens the whole sidebar menu over a dimmed page
const more = document.querySelector('[data-more]')
const moreToggle = more.querySelector('[data-more-toggle]')
const moreOverlay = document.createElement('div')
moreOverlay.className = 'more-overlay'
moreOverlay.setAttribute('aria-hidden', 'true')
document.body.append(moreOverlay)

// More menu items start stacked 8px below the top of the closed box (tab-bar-sized)
// and spread to their places while it grows. Closed, the visible part of the box is
// its bottom --rn-tabbar-height px, so that top edge sits at (box height − tab bar height).
const moreBox = more.querySelector('.more')
const moreItems = [...moreBox.querySelectorAll('.more__item, .more__feedback')]
const MORE_ITEM_START_GAP = 8

const setMoreItemOffsets = () => {
  const tabbarHeight = parseFloat(getComputedStyle(moreBox).getPropertyValue('--rn-tabbar-height'))
  const closedTop = moreBox.offsetHeight - tabbarHeight
  moreItems.forEach((item) => {
    const from = closedTop + MORE_ITEM_START_GAP - item.offsetTop
    item.style.setProperty('--rn-item-from', `${from}px`)
  })
}

// Closing plays the opening in reverse: .is-closing for the length of it
// (menu duration + the last item's stagger delay), then cleared.
const playClosing = (menu) => {
  const root = getComputedStyle(document.documentElement)
  const duration = parseFloat(root.getPropertyValue('--duration-menu'))
  const step = parseFloat(root.getPropertyValue('--stagger-step'))
  const count = menu.querySelectorAll('.stagger').length
  menu.classList.add('is-closing')
  clearTimeout(menu.closingTimer)
  menu.closingTimer = setTimeout(() => menu.classList.remove('is-closing'), duration + count * step)
}
const stopClosing = (menu) => {
  clearTimeout(menu.closingTimer)
  menu.classList.remove('is-closing')
}

const setMore = (open) => {
  const wasOpen = more.classList.contains('is-open')
  if (open) {
    stopClosing(more)
    setMoreItemOffsets()
  } else if (wasOpen) {
    playClosing(more)
  }
  more.classList.toggle('is-open', open)
  moreOverlay.classList.toggle('is-visible', open)
  document.querySelector('.dock').classList.toggle('is-more-open', open)
  moreToggle.setAttribute('aria-expanded', String(open))
  moreToggle.setAttribute('aria-label', open ? 'Close menu' : 'More')
}

moreToggle.addEventListener('click', () => setMore(!more.classList.contains('is-open')))

// Mobile/tablet sheets under the header: main navigation (burger) and profile (avatar).
// One at a time; the page stops scrolling while a sheet is open.
const sheets = document.querySelectorAll('[data-sheet]')
const sheetToggles = document.querySelectorAll('[data-sheet-toggle]')
let openSheet = null

// Tablet+: dimmed page under the sheet; a click on it closes the sheet
const sheetOverlay = document.createElement('div')
sheetOverlay.className = 'sheet-overlay'
sheetOverlay.setAttribute('aria-hidden', 'true')
document.body.append(sheetOverlay)
sheetOverlay.addEventListener('click', () => setSheet(null))

const setSheet = (name) => {
  openSheet = name
  // Tablet: the navigation panel hangs under the burger cell
  const navCell = document.querySelector('.header__main')
  document.documentElement.style.setProperty('--rn-nav-sheet-left', `${navCell.getBoundingClientRect().left}px`)
  sheets.forEach((sheet) => {
    const opening = sheet.dataset.sheet === name
    if (opening) stopClosing(sheet)
    else if (sheet.classList.contains('is-open')) playClosing(sheet)
    sheet.classList.toggle('is-open', opening)
  })
  sheetToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', String(toggle.dataset.sheetToggle === name)))
  sheetOverlay.classList.toggle('is-visible', Boolean(name))
  document.documentElement.classList.toggle('is-sheet-open', Boolean(name))
  if (name) {
    setMore(false)
    lenis?.stop()
  } else {
    lenis?.start()
  }
}

sheetToggles.forEach((toggle) =>
  toggle.addEventListener('click', () => setSheet(openSheet === toggle.dataset.sheetToggle ? null : toggle.dataset.sheetToggle)),
)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && openSheet) setSheet(null)
})
// The navigation sheet exists only below 835px: close it if the window grows past it
window.matchMedia('(min-width: 835px)').addEventListener('change', (event) => {
  if (event.matches && openSheet === 'nav') setSheet(null)
})
document.addEventListener('click', (event) => {
  if (!more.contains(event.target)) setMore(false)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMore(false)
})

// Menu items fade in one by one, top to bottom: tag them and store their order in --i
const STAGGER_TARGETS = {
  '.more': '.more__item, .more__feedback',
  '#nav-sheet': '.sheet__item',
  '#profile-sheet': '.profile > *, .sheet__item',
}
Object.entries(STAGGER_TARGETS).forEach(([menu, items]) => {
  const list = document.querySelectorAll(`${menu} :is(${items})`)
  list.forEach((item, index) => {
    item.classList.add('stagger')
    item.style.setProperty('--i', index)
    item.style.setProperty('--n', list.length) // closing runs bottom to top
  })
})

// Mini player: hidden until a track is played; play/pause synced with the track row
const player = document.querySelector('[data-player]')
const playerToggle = player.querySelector('[data-player-toggle]')
const playerCover = player.querySelector('.player__cover')
const marquee = player.querySelector('[data-marquee]')
let current = null // { el, data }
let playing = false
let lenis = null

const setMarqueeSpeed = () => {
  const distance = marquee.scrollWidth / 2 // one copy + gap
  if (distance) marquee.style.setProperty('--rn-marquee-duration', `${distance / PLAYER.marqueeSpeed}s`)
}

const trackLabel = ({ title: name, extra, release: r }) =>
  `${r.artists[0]} - ${name}${extra ? ` (${extra})` : ''}`

const render = () => {
  document.querySelectorAll('.track.is-current').forEach((el) => {
    if (el !== current?.el) el.classList.remove('is-current', 'is-playing')
  })
  if (!current) return

  current.el.classList.add('is-current')
  current.el.classList.toggle('is-playing', playing)
  current.el.querySelector('[data-play]').setAttribute('aria-label', playing ? 'Pause' : 'Play')

  player.classList.add('is-visible')
  player.classList.toggle('is-paused', !playing)
  playerToggle.setAttribute('aria-label', playing ? 'Pause' : 'Play')
}

const showTrack = (el) => {
  const data = TRACKS[Number(el.dataset.track)]
  const label = trackLabel(data)
  player.querySelectorAll('.player__copy').forEach((copy) => (copy.textContent = label))
  player.querySelector('.player__title').title = label
  playerCover.src = data.release.cover
  player.setAttribute('aria-label', `Now playing: ${label}. Go to track`)
  current = { el, data }
  setMarqueeSpeed()
}

document.querySelector('[data-releases]').addEventListener('click', (event) => {
  const button = event.target.closest('[data-play]')
  if (!button) return
  const el = button.closest('.track')
  if (current?.el === el) {
    playing = !playing
  } else {
    showTrack(el)
    playing = true
  }
  render()
})

playerToggle.addEventListener('click', (event) => {
  event.stopPropagation() // don't scroll to the track
  playing = !playing
  render()
})

// Click on the mini player itself: scroll to the playing track (centred)
const goToTrack = () => {
  if (!current) return
  const offset = -(window.innerHeight - current.el.offsetHeight) / 2
  if (lenis) lenis.scrollTo(current.el, { offset })
  else current.el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

player.addEventListener('click', goToTrack)
player.addEventListener('keydown', (event) => {
  if (event.target === player && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    goToTrack()
  }
})

document.fonts.ready.then(setMarqueeSpeed)

// Volume sliders (laptop panel + mobile/tablet button) share one value
const volumes = document.querySelectorAll('[data-volume]')
const setVolume = (value) => {
  volumes.forEach((range) => {
    range.value = value
    range.closest('.volume__panel').style.setProperty('--rn-volume-n', value)
  })
}
volumes.forEach((range) => range.addEventListener('input', () => setVolume(range.value)))
setVolume(volumes[0].value)

// iOS Chrome: when the bottom toolbar collapses, `position: fixed; bottom: 0` can stay
// where the old, shorter viewport ended. Measure where fixed-bottom actually lands vs the
// bottom of the visible area and shift the dock by the difference (0 everywhere else).
const viewport = window.visualViewport
const dockEl = document.querySelector('.dock')
const probe = document.createElement('div')
probe.className = 'viewport-probe'
probe.setAttribute('aria-hidden', 'true')
document.body.append(probe)
let viewportFrame = 0

const syncViewportGap = () => {
  viewportFrame = 0
  const visibleBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight
  const gap = Math.max(0, Math.round(visibleBottom - probe.getBoundingClientRect().bottom))
  dockEl.style.setProperty('--rn-viewport-gap', `${gap}px`)
}
const queueViewportGap = () => {
  if (!viewportFrame) viewportFrame = requestAnimationFrame(syncViewportGap)
}

viewport?.addEventListener('resize', queueViewportGap)
viewport?.addEventListener('scroll', queueViewportGap)
window.addEventListener('resize', queueViewportGap)
window.addEventListener('scroll', queueViewportGap, { passive: true })
syncViewportGap()

// Hide the navigation panel on scroll down, bring it back on scroll up.
// CSS (.dock.is-nav-hidden) moves the panel off-screen and drops Filters into the player row.
const dock = document.querySelector('.dock')
const SCROLL_TOP_ZONE = 80 // always show near the top of the page
const SCROLL_THRESHOLD = 6 // ignore tiny jitters
let lastScrollY = window.scrollY
let scrollFrame = 0

const updateDock = () => {
  scrollFrame = 0
  const y = window.scrollY
  const delta = y - lastScrollY
  if (y > SCROLL_TOP_ZONE && Math.abs(delta) < SCROLL_THRESHOLD) return

  const hide = y > SCROLL_TOP_ZONE && delta > 0
  if (hide) setMore(false)
  dock.classList.toggle('is-nav-hidden', hide)
  lastScrollY = y
}

window.addEventListener(
  'scroll',
  () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateDock)
  },
  { passive: true },
)

lenis = initSmoothScroll()
