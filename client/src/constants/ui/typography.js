// Typography scale
export const TYPOGRAPHY = {
  // Font families
  FONT_FAMILY: {
    SANS: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    SERIF: [
      'Georgia',
      'Cambria',
      'Times New Roman',
      'Times',
      'serif',
    ],
    MONO: [
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
    DISPLAY: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
  },

  // Font sizes
  FONT_SIZE: {
    XS: '0.75rem',    // 12px
    SM: '0.875rem',   // 14px
    BASE: '1rem',     // 16px
    LG: '1.125rem',   // 18px
    XL: '1.25rem',    // 20px
    '2XL': '1.5rem',  // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem', // 36px
    '5XL': '3rem',    // 48px
    '6XL': '3.75rem', // 60px
    '7XL': '4.5rem',  // 72px
    '8XL': '6rem',    // 96px
    '9XL': '8rem',    // 128px
  },

  // Font weights
  FONT_WEIGHT: {
    THIN: '100',
    EXTRALIGHT: '200',
    LIGHT: '300',
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
    EXTRABOLD: '800',
    BLACK: '900',
  },

  // Line heights
  LINE_HEIGHT: {
    NONE: '1',
    TIGHT: '1.25',
    SNUG: '1.375',
    NORMAL: '1.5',
    RELAXED: '1.625',
    LOOSE: '2',
  },

  // Letter spacing
  LETTER_SPACING: {
    TIGHTER: '-0.05em',
    TIGHT: '-0.025em',
    NORMAL: '0em',
    WIDE: '0.025em',
    WIDER: '0.05em',
    WIDEST: '0.1em',
  },
}

// Typography scale
export const TYPOGRAPHY_SCALE = {
  // Headings
  H1: {
    fontSize: TYPOGRAPHY.FONT_SIZE['4XL'],
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.TIGHT,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.TIGHT,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.DISPLAY,
  },
  H2: {
    fontSize: TYPOGRAPHY.FONT_SIZE['3XL'],
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.TIGHT,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.TIGHT,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.DISPLAY,
  },
  H3: {
    fontSize: TYPOGRAPHY.FONT_SIZE['2XL'],
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.SNUG,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.DISPLAY,
  },
  H4: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.SNUG,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.DISPLAY,
  },
  H5: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.DISPLAY,
  },
  H6: {
    fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.DISPLAY,
  },

  // Body text
  BODY: {
    fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.NORMAL,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.SANS,
  },
  BODY_LARGE: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.NORMAL,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.RELAXED,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.SANS,
  },
  BODY_SMALL: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.NORMAL,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.SANS,
  },

  // Caption text
  CAPTION: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.NORMAL,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.WIDE,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.SANS,
  },

  // Code text
  CODE: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.NORMAL,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.MONO,
  },
  CODE_LARGE: {
    fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.NORMAL,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.MONO,
  },

  // Button text
  BUTTON: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NONE,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.WIDE,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.SANS,
  },
  BUTTON_LARGE: {
    fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NONE,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.WIDE,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.SANS,
  },

  // Label text
  LABEL: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.WIDE,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.SANS,
  },

  // Link text
  LINK: {
    fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.NORMAL,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.SANS,
  },
}

// Responsive typography
export const RESPONSIVE_TYPOGRAPHY = {
  // Mobile typography
  MOBILE: {
    H1: {
      fontSize: TYPOGRAPHY.FONT_SIZE['3XL'],
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.TIGHT,
    },
    H2: {
      fontSize: TYPOGRAPHY.FONT_SIZE['2XL'],
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.TIGHT,
    },
    H3: {
      fontSize: TYPOGRAPHY.FONT_SIZE.XL,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.SNUG,
    },
    BODY: {
      fontSize: TYPOGRAPHY.FONT_SIZE.SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.NORMAL,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    },
  },

  // Tablet typography
  TABLET: {
    H1: {
      fontSize: TYPOGRAPHY.FONT_SIZE['4XL'],
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.TIGHT,
    },
    H2: {
      fontSize: TYPOGRAPHY.FONT_SIZE['3XL'],
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.TIGHT,
    },
    H3: {
      fontSize: TYPOGRAPHY.FONT_SIZE['2XL'],
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.SNUG,
    },
    BODY: {
      fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.NORMAL,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
    },
  },

  // Desktop typography
  DESKTOP: {
    H1: {
      fontSize: TYPOGRAPHY.FONT_SIZE['5XL'],
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.TIGHT,
    },
    H2: {
      fontSize: TYPOGRAPHY.FONT_SIZE['4XL'],
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.TIGHT,
    },
    H3: {
      fontSize: TYPOGRAPHY.FONT_SIZE['3XL'],
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.SNUG,
    },
    BODY: {
      fontSize: TYPOGRAPHY.FONT_SIZE.LG,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.NORMAL,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.RELAXED,
    },
  },
}

// Typography utilities
export const TYPOGRAPHY_UTILITIES = {
  // Get typography style
  getTypographyStyle: (variant) => TYPOGRAPHY_SCALE[variant] || TYPOGRAPHY_SCALE.BODY,
  
  // Get responsive typography style
  getResponsiveTypographyStyle: (variant, breakpoint) => {
    return RESPONSIVE_TYPOGRAPHY[breakpoint]?.[variant] || TYPOGRAPHY_SCALE[variant] || TYPOGRAPHY_SCALE.BODY;
  },
  
  // Get font family
  getFontFamily: (family) => TYPOGRAPHY.FONT_FAMILY[family] || TYPOGRAPHY.FONT_FAMILY.SANS,
  
  // Get font size
  getFontSize: (size) => TYPOGRAPHY.FONT_SIZE[size] || TYPOGRAPHY.FONT_SIZE.BASE,
  
  // Get font weight
  getFontWeight: (weight) => TYPOGRAPHY.FONT_WEIGHT[weight] || TYPOGRAPHY.FONT_WEIGHT.NORMAL,
  
  // Get line height
  getLineHeight: (height) => TYPOGRAPHY.LINE_HEIGHT[height] || TYPOGRAPHY.LINE_HEIGHT.NORMAL,
  
  // Get letter spacing
  getLetterSpacing: (spacing) => TYPOGRAPHY.LETTER_SPACING[spacing] || TYPOGRAPHY.LETTER_SPACING.NORMAL,
  
  // Convert typography to CSS
  toCSS: (typography) => {
    return {
      fontFamily: typography.fontFamily?.join(', ') || typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
    };
  },
}

export default {
  TYPOGRAPHY,
  TYPOGRAPHY_SCALE,
  RESPONSIVE_TYPOGRAPHY,
  TYPOGRAPHY_UTILITIES,
}
