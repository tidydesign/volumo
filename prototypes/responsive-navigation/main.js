import { initSmoothScroll } from '/src/main.js'
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

const track = (item) => `
  <li class="track">
    <div class="track__main">
      <button class="track__play" type="button" aria-label="Play">${icon(playIcon, 16)}</button>
      <span class="track__info">
        <span class="track__title">${title(item.title, item.extra)}</span>
        <span class="track__artist">Artist</span>
      </span>
    </div>
    <div class="track__genre">
      <span class="track__genre-name">${item.genre}</span>
      <span class="track__details">Tempo<i class="dot"></i>Key<i class="dot"></i>3:22</span>
    </div>
    <div class="track__actions">${actions('€1.49')}</div>
  </li>`

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
        <ul class="release__tracks">${data.tracks.map(track).join('')}</ul>
      </div>
    </div>
  </article>`

document.querySelector('[data-releases]').innerHTML = Array.from({ length: REPEAT }, () =>
  RELEASES.map(release).join(''),
).join('')

// "More" in the tab bar: opens the rest of the sidebar items
const more = document.querySelector('[data-more]')
const moreToggle = more.querySelector('[data-more-toggle]')

const setMore = (open) => {
  more.classList.toggle('is-open', open)
  moreToggle.setAttribute('aria-expanded', String(open))
}

moreToggle.addEventListener('click', () => setMore(!more.classList.contains('is-open')))
document.addEventListener('click', (event) => {
  if (!more.contains(event.target)) setMore(false)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMore(false)
})

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

initSmoothScroll()
