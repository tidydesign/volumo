import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './motion.js'

import './styles/tokens.css'
import './styles/base.css'

gsap.registerPlugin(ScrollTrigger)

// Shared setup for prototypes: Lenis smooth scroll driven by the GSAP ticker.
// Import it from a prototype's own script: import { initSmoothScroll } from '/src/main.js'
export function initSmoothScroll() {
  if (prefersReducedMotion()) return null

  const lenis = new Lenis()
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export { gsap, ScrollTrigger }
