// Spacing scale (based on 4px base unit)
export const SPACING = {
  // Base spacing units
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
}

// Semantic spacing
export const SEMANTIC_SPACING = {
  // Component spacing
  COMPONENT: {
    PADDING: {
      SM: SPACING[2], // 8px
      MD: SPACING[4], // 16px
      LG: SPACING[6], // 24px
      XL: SPACING[8], // 32px
    },
    MARGIN: {
      SM: SPACING[2], // 8px
      MD: SPACING[4], // 16px
      LG: SPACING[6], // 24px
      XL: SPACING[8], // 32px
    },
    GAP: {
      SM: SPACING[2], // 8px
      MD: SPACING[4], // 16px
      LG: SPACING[6], // 24px
      XL: SPACING[8], // 32px
    },
  },

  // Layout spacing
  LAYOUT: {
    CONTAINER: {
      PADDING: {
        MOBILE: SPACING[4], // 16px
        TABLET: SPACING[6], // 24px
        DESKTOP: SPACING[8], // 32px
      },
      MARGIN: {
        MOBILE: SPACING[4], // 16px
        TABLET: SPACING[6], // 24px
        DESKTOP: SPACING[8], // 32px
      },
    },
    SECTION: {
      PADDING: {
        MOBILE: SPACING[8], // 32px
        TABLET: SPACING[12], // 48px
        DESKTOP: SPACING[16], // 64px
      },
      MARGIN: {
        MOBILE: SPACING[8], // 32px
        TABLET: SPACING[12], // 48px
        DESKTOP: SPACING[16], // 64px
      },
    },
  },

  // Form spacing
  FORM: {
    FIELD: {
      MARGIN_BOTTOM: SPACING[4], // 16px
      PADDING: SPACING[3], // 12px
    },
    GROUP: {
      MARGIN_BOTTOM: SPACING[6], // 24px
    },
    LABEL: {
      MARGIN_BOTTOM: SPACING[1], // 4px
    },
  },

  // Navigation spacing
  NAVIGATION: {
    ITEM: {
      PADDING: SPACING[3], // 12px
      MARGIN: SPACING[1], // 4px
    },
    GROUP: {
      MARGIN_BOTTOM: SPACING[4], // 16px
    },
  },

  // Card spacing
  CARD: {
    PADDING: {
      SM: SPACING[4], // 16px
      MD: SPACING[6], // 24px
      LG: SPACING[8], // 32px
    },
    MARGIN: {
      SM: SPACING[2], // 8px
      MD: SPACING[4], // 16px
      LG: SPACING[6], // 24px
    },
  },

  // Button spacing
  BUTTON: {
    PADDING: {
      SM: `${SPACING[2]} ${SPACING[3]}`, // 8px 12px
      MD: `${SPACING[3]} ${SPACING[4]}`, // 12px 16px
      LG: `${SPACING[4]} ${SPACING[6]}`, // 16px 24px
    },
    MARGIN: {
      SM: SPACING[1], // 4px
      MD: SPACING[2], // 8px
      LG: SPACING[3], // 12px
    },
  },

  // List spacing
  LIST: {
    ITEM: {
      PADDING: SPACING[3], // 12px
      MARGIN_BOTTOM: SPACING[2], // 8px
    },
    GROUP: {
      MARGIN_BOTTOM: SPACING[4], // 16px
    },
  },

  // Modal spacing
  MODAL: {
    PADDING: SPACING[6], // 24px
    MARGIN: SPACING[4], // 16px
    HEADER: {
      PADDING_BOTTOM: SPACING[4], // 16px
      MARGIN_BOTTOM: SPACING[4], // 16px
    },
    FOOTER: {
      PADDING_TOP: SPACING[4], // 16px
      MARGIN_TOP: SPACING[4], // 16px
    },
  },

  // Table spacing
  TABLE: {
    CELL: {
      PADDING: SPACING[3], // 12px
    },
    HEADER: {
      PADDING: SPACING[3], // 12px
    },
    ROW: {
      MARGIN_BOTTOM: SPACING[1], // 4px
    },
  },
}

// Responsive spacing
export const RESPONSIVE_SPACING = {
  // Mobile-first spacing
  MOBILE: {
    SM: SPACING[2], // 8px
    MD: SPACING[4], // 16px
    LG: SPACING[6], // 24px
    XL: SPACING[8], // 32px
  },
  TABLET: {
    SM: SPACING[3], // 12px
    MD: SPACING[6], // 24px
    LG: SPACING[8], // 32px
    XL: SPACING[12], // 48px
  },
  DESKTOP: {
    SM: SPACING[4], // 16px
    MD: SPACING[8], // 32px
    LG: SPACING[12], // 48px
    XL: SPACING[16], // 64px
  },
}

// Spacing utilities
export const SPACING_UTILITIES = {
  // Get spacing value
  getSpacing: (size) => SPACING[size] || size,
  
  // Get semantic spacing
  getSemanticSpacing: (category, variant, size) => {
    return SEMANTIC_SPACING[category]?.[variant]?.[size] || SPACING[4];
  },
  
  // Get responsive spacing
  getResponsiveSpacing: (breakpoint, size) => {
    return RESPONSIVE_SPACING[breakpoint]?.[size] || SPACING[4];
  },
  
  // Convert spacing to number
  spacingToNumber: (spacing) => {
    return parseInt(spacing.replace('px', '')) || 0;
  },
  
  // Convert number to spacing
  numberToSpacing: (number) => {
    return `${number}px`;
  },
  
  // Get spacing scale
  getSpacingScale: () => Object.keys(SPACING).map(key => ({
    key,
    value: SPACING[key],
    number: parseInt(SPACING[key].replace('px', ''))
  })),
}

// Common spacing patterns
export const SPACING_PATTERNS = {
  // Stack spacing (vertical)
  STACK: {
    SM: SPACING[2], // 8px
    MD: SPACING[4], // 16px
    LG: SPACING[6], // 24px
    XL: SPACING[8], // 32px
  },
  
  // Inline spacing (horizontal)
  INLINE: {
    SM: SPACING[2], // 8px
    MD: SPACING[4], // 16px
    LG: SPACING[6], // 24px
    XL: SPACING[8], // 32px
  },
  
  // Grid spacing
  GRID: {
    SM: SPACING[2], // 8px
    MD: SPACING[4], // 16px
    LG: SPACING[6], // 24px
    XL: SPACING[8], // 32px
  },
  
  // Flexbox spacing
  FLEX: {
    SM: SPACING[2], // 8px
    MD: SPACING[4], // 16px
    LG: SPACING[6], // 24px
    XL: SPACING[8], // 32px
  },
}

export default {
  SPACING,
  SEMANTIC_SPACING,
  RESPONSIVE_SPACING,
  SPACING_UTILITIES,
  SPACING_PATTERNS,
}
