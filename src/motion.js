// All timings and easing live here. Animate only transform and opacity.

export const EASE = 'cubic-bezier(.16, 1, .3, 1)'
// GSAP has no cubic-bezier string parser without CustomEase; expo.out is the closest built-in
export const GSAP_EASE = 'expo.out'

export const DURATION = {
  fast: 0.4,
  base: 0.55,
  slow: 0.7,
}

// Hover reveals (toolbar labels): mirrors --ease-out / --duration-hover in tokens.css
export const HOVER = {
  ease: 'ease-out',
  duration: 0.3,
}

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches
