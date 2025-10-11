// Breakpoints for responsive design
export const BREAKPOINTS = {
  // Mobile breakpoints
  MOBILE_SM: '320px',
  MOBILE_MD: '375px',
  MOBILE_LG: '425px',
  
  // Tablet breakpoints
  TABLET_SM: '640px',
  TABLET_MD: '768px',
  TABLET_LG: '1024px',
  
  // Desktop breakpoints
  DESKTOP_SM: '1280px',
  DESKTOP_MD: '1440px',
  DESKTOP_LG: '1920px',
  DESKTOP_XL: '2560px',
}

// Breakpoint values in pixels (for JavaScript calculations)
export const BREAKPOINT_VALUES = {
  MOBILE_SM: 320,
  MOBILE_MD: 375,
  MOBILE_LG: 425,
  TABLET_SM: 640,
  TABLET_MD: 768,
  TABLET_LG: 1024,
  DESKTOP_SM: 1280,
  DESKTOP_MD: 1440,
  DESKTOP_LG: 1920,
  DESKTOP_XL: 2560,
}

// Media query breakpoints
export const MEDIA_QUERIES = {
  // Mobile
  MOBILE_ONLY: `(max-width: ${BREAKPOINT_VALUES.TABLET_SM - 1}px)`,
  MOBILE_SM_UP: `(min-width: ${BREAKPOINT_VALUES.MOBILE_SM}px)`,
  MOBILE_MD_UP: `(min-width: ${BREAKPOINT_VALUES.MOBILE_MD}px)`,
  MOBILE_LG_UP: `(min-width: ${BREAKPOINT_VALUES.MOBILE_LG}px)`,
  
  // Tablet
  TABLET_ONLY: `(min-width: ${BREAKPOINT_VALUES.TABLET_SM}px) and (max-width: ${BREAKPOINT_VALUES.DESKTOP_SM - 1}px)`,
  TABLET_SM_UP: `(min-width: ${BREAKPOINT_VALUES.TABLET_SM}px)`,
  TABLET_MD_UP: `(min-width: ${BREAKPOINT_VALUES.TABLET_MD}px)`,
  TABLET_LG_UP: `(min-width: ${BREAKPOINT_VALUES.TABLET_LG}px)`,
  
  // Desktop
  DESKTOP_ONLY: `(min-width: ${BREAKPOINT_VALUES.DESKTOP_SM}px)`,
  DESKTOP_SM_UP: `(min-width: ${BREAKPOINT_VALUES.DESKTOP_SM}px)`,
  DESKTOP_MD_UP: `(min-width: ${BREAKPOINT_VALUES.DESKTOP_MD}px)`,
  DESKTOP_LG_UP: `(min-width: ${BREAKPOINT_VALUES.DESKTOP_LG}px)`,
  DESKTOP_XL_UP: `(min-width: ${BREAKPOINT_VALUES.DESKTOP_XL}px)`,
  
  // Range queries
  MOBILE_TO_TABLET: `(min-width: ${BREAKPOINT_VALUES.MOBILE_SM}px) and (max-width: ${BREAKPOINT_VALUES.TABLET_LG - 1}px)`,
  TABLET_TO_DESKTOP: `(min-width: ${BREAKPOINT_VALUES.TABLET_SM}px) and (max-width: ${BREAKPOINT_VALUES.DESKTOP_SM - 1}px)`,
  DESKTOP_AND_UP: `(min-width: ${BREAKPOINT_VALUES.DESKTOP_SM}px)`,
}

// Device type breakpoints
export const DEVICE_BREAKPOINTS = {
  MOBILE: {
    MIN: BREAKPOINT_VALUES.MOBILE_SM,
    MAX: BREAKPOINT_VALUES.TABLET_SM - 1,
    QUERY: MEDIA_QUERIES.MOBILE_ONLY,
  },
  TABLET: {
    MIN: BREAKPOINT_VALUES.TABLET_SM,
    MAX: BREAKPOINT_VALUES.DESKTOP_SM - 1,
    QUERY: MEDIA_QUERIES.TABLET_ONLY,
  },
  DESKTOP: {
    MIN: BREAKPOINT_VALUES.DESKTOP_SM,
    MAX: Infinity,
    QUERY: MEDIA_QUERIES.DESKTOP_ONLY,
  },
}

// Container max widths
export const CONTAINER_MAX_WIDTHS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
  FULL: '100%',
}

// Grid breakpoints (for CSS Grid and Flexbox)
export const GRID_BREAKPOINTS = {
  COLUMNS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
    LARGE: 4,
  },
  GAP: {
    MOBILE: '16px',
    TABLET: '24px',
    DESKTOP: '32px',
  },
}

// Layout breakpoints
export const LAYOUT_BREAKPOINTS = {
  SIDEBAR: {
    COLLAPSED: BREAKPOINT_VALUES.TABLET_MD,
    HIDDEN: BREAKPOINT_VALUES.TABLET_SM,
  },
  HEADER: {
    COMPACT: BREAKPOINT_VALUES.TABLET_SM,
  },
  NAVIGATION: {
    MOBILE_MENU: BREAKPOINT_VALUES.TABLET_SM,
  },
}

// Typography breakpoints
export const TYPOGRAPHY_BREAKPOINTS = {
  HEADING: {
    MOBILE: '1.5rem',
    TABLET: '2rem',
    DESKTOP: '2.5rem',
  },
  BODY: {
    MOBILE: '0.875rem',
    TABLET: '1rem',
    DESKTOP: '1.125rem',
  },
}

// Utility functions
export const BREAKPOINT_UTILITIES = {
  // Check if current screen size matches breakpoint
  isMobile: () => window.innerWidth < BREAKPOINT_VALUES.TABLET_SM,
  isTablet: () => window.innerWidth >= BREAKPOINT_VALUES.TABLET_SM && window.innerWidth < BREAKPOINT_VALUES.DESKTOP_SM,
  isDesktop: () => window.innerWidth >= BREAKPOINT_VALUES.DESKTOP_SM,
  
  // Get current breakpoint
  getCurrentBreakpoint: () => {
    const width = window.innerWidth;
    if (width < BREAKPOINT_VALUES.TABLET_SM) return 'mobile';
    if (width < BREAKPOINT_VALUES.DESKTOP_SM) return 'tablet';
    return 'desktop';
  },
  
  // Get breakpoint value
  getBreakpointValue: (breakpoint) => BREAKPOINT_VALUES[breakpoint] || 0,
  
  // Get media query
  getMediaQuery: (breakpoint) => MEDIA_QUERIES[breakpoint] || '',
  
  // Check if breakpoint is active
  isBreakpointActive: (breakpoint) => {
    const query = MEDIA_QUERIES[breakpoint];
    return query ? window.matchMedia(query).matches : false;
  },
}

export default {
  BREAKPOINTS,
  BREAKPOINT_VALUES,
  MEDIA_QUERIES,
  DEVICE_BREAKPOINTS,
  CONTAINER_MAX_WIDTHS,
  GRID_BREAKPOINTS,
  LAYOUT_BREAKPOINTS,
  TYPOGRAPHY_BREAKPOINTS,
  BREAKPOINT_UTILITIES,
}
