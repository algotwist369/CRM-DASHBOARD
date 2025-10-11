// Animation durations
export const ANIMATION_DURATION = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms',
  VERY_SLOW: '1000ms',
}

// Animation timing functions
export const ANIMATION_TIMING = {
  LINEAR: 'linear',
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  CUBIC_BEZIER: 'cubic-bezier(0.4, 0, 0.2, 1)',
  CUBIC_BEZIER_FAST: 'cubic-bezier(0.4, 0, 1, 1)',
  CUBIC_BEZIER_SLOW: 'cubic-bezier(0, 0, 0.2, 1)',
}

// Animation delays
export const ANIMATION_DELAY = {
  NONE: '0ms',
  FAST: '100ms',
  NORMAL: '200ms',
  SLOW: '300ms',
  VERY_SLOW: '500ms',
}

// Animation iterations
export const ANIMATION_ITERATION = {
  ONCE: '1',
  TWICE: '2',
  INFINITE: 'infinite',
}

// Animation directions
export const ANIMATION_DIRECTION = {
  NORMAL: 'normal',
  REVERSE: 'reverse',
  ALTERNATE: 'alternate',
  ALTERNATE_REVERSE: 'alternate-reverse',
}

// Animation fill modes
export const ANIMATION_FILL_MODE = {
  NONE: 'none',
  FORWARDS: 'forwards',
  BACKWARDS: 'backwards',
  BOTH: 'both',
}

// Common animations
export const ANIMATIONS = {
  // Fade animations
  FADE_IN: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  FADE_OUT: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_IN,
  },
  FADE_IN_UP: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  FADE_IN_DOWN: {
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  FADE_IN_LEFT: {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  FADE_IN_RIGHT: {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },

  // Scale animations
  SCALE_IN: {
    from: { transform: 'scale(0.8)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  SCALE_OUT: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.8)', opacity: 0 },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_IN,
  },
  SCALE_UP: {
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.05)' },
    duration: ANIMATION_DURATION.FAST,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  SCALE_DOWN: {
    from: { transform: 'scale(1.05)' },
    to: { transform: 'scale(1)' },
    duration: ANIMATION_DURATION.FAST,
    timing: ANIMATION_TIMING.EASE_OUT,
  },

  // Slide animations
  SLIDE_IN_UP: {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  SLIDE_IN_DOWN: {
    from: { transform: 'translateY(-100%)' },
    to: { transform: 'translateY(0)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  SLIDE_IN_LEFT: {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  SLIDE_IN_RIGHT: {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  SLIDE_OUT_UP: {
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(-100%)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_IN,
  },
  SLIDE_OUT_DOWN: {
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(100%)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_IN,
  },
  SLIDE_OUT_LEFT: {
    from: { transform: 'translateX(0)' },
    to: { transform: 'translateX(-100%)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_IN,
  },
  SLIDE_OUT_RIGHT: {
    from: { transform: 'translateX(0)' },
    to: { transform: 'translateX(100%)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_IN,
  },

  // Rotate animations
  ROTATE_IN: {
    from: { transform: 'rotate(-180deg)', opacity: 0 },
    to: { transform: 'rotate(0deg)', opacity: 1 },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_OUT,
  },
  ROTATE_OUT: {
    from: { transform: 'rotate(0deg)', opacity: 1 },
    to: { transform: 'rotate(180deg)', opacity: 0 },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_IN,
  },
  SPIN: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
    duration: ANIMATION_DURATION.SLOW,
    timing: ANIMATION_TIMING.LINEAR,
    iteration: ANIMATION_ITERATION.INFINITE,
  },

  // Bounce animations
  BOUNCE_IN: {
    from: { transform: 'scale(0.3)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: ANIMATION_DURATION.SLOW,
    timing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  BOUNCE_OUT: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.3)', opacity: 0 },
    duration: ANIMATION_DURATION.SLOW,
    timing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Pulse animations
  PULSE: {
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.05)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_IN_OUT,
    iteration: ANIMATION_ITERATION.INFINITE,
    direction: ANIMATION_DIRECTION.ALTERNATE,
  },

  // Shake animations
  SHAKE: {
    from: { transform: 'translateX(0)' },
    to: { transform: 'translateX(0)' },
    duration: ANIMATION_DURATION.NORMAL,
    timing: ANIMATION_TIMING.EASE_IN_OUT,
    keyframes: [
      { offset: 0, transform: 'translateX(0)' },
      { offset: 0.1, transform: 'translateX(-10px)' },
      { offset: 0.2, transform: 'translateX(10px)' },
      { offset: 0.3, transform: 'translateX(-10px)' },
      { offset: 0.4, transform: 'translateX(10px)' },
      { offset: 0.5, transform: 'translateX(-10px)' },
      { offset: 0.6, transform: 'translateX(10px)' },
      { offset: 0.7, transform: 'translateX(-10px)' },
      { offset: 0.8, transform: 'translateX(10px)' },
      { offset: 0.9, transform: 'translateX(-10px)' },
      { offset: 1, transform: 'translateX(0)' },
    ],
  },

  // Wobble animations
  WOBBLE: {
    from: { transform: 'translateX(0%)' },
    to: { transform: 'translateX(0%)' },
    duration: ANIMATION_DURATION.SLOW,
    timing: ANIMATION_TIMING.EASE_IN_OUT,
    keyframes: [
      { offset: 0, transform: 'translateX(0%)' },
      { offset: 0.15, transform: 'translateX(-25%) rotate(-5deg)' },
      { offset: 0.3, transform: 'translateX(20%) rotate(3deg)' },
      { offset: 0.45, transform: 'translateX(-15%) rotate(-3deg)' },
      { offset: 0.6, transform: 'translateX(10%) rotate(2deg)' },
      { offset: 0.75, transform: 'translateX(-5%) rotate(-1deg)' },
      { offset: 1, transform: 'translateX(0%)' },
    ],
  },
}

// Animation presets
export const ANIMATION_PRESETS = {
  // Page transitions
  PAGE_ENTER: ANIMATIONS.FADE_IN_UP,
  PAGE_EXIT: ANIMATIONS.FADE_OUT,
  
  // Modal animations
  MODAL_ENTER: ANIMATIONS.SCALE_IN,
  MODAL_EXIT: ANIMATIONS.SCALE_OUT,
  
  // Dropdown animations
  DROPDOWN_ENTER: ANIMATIONS.FADE_IN_DOWN,
  DROPDOWN_EXIT: ANIMATIONS.FADE_OUT,
  
  // Tooltip animations
  TOOLTIP_ENTER: ANIMATIONS.FADE_IN_UP,
  TOOLTIP_EXIT: ANIMATIONS.FADE_OUT,
  
  // Button animations
  BUTTON_HOVER: ANIMATIONS.SCALE_UP,
  BUTTON_ACTIVE: ANIMATIONS.SCALE_DOWN,
  
  // Loading animations
  LOADING_SPINNER: ANIMATIONS.SPIN,
  LOADING_PULSE: ANIMATIONS.PULSE,
  
  // Error animations
  ERROR_SHAKE: ANIMATIONS.SHAKE,
  
  // Success animations
  SUCCESS_BOUNCE: ANIMATIONS.BOUNCE_IN,
}

// Animation utilities
export const ANIMATION_UTILITIES = {
  // Get animation
  getAnimation: (name) => ANIMATIONS[name] || ANIMATIONS.FADE_IN,
  
  // Get animation preset
  getPreset: (name) => ANIMATION_PRESETS[name] || ANIMATIONS.FADE_IN,
  
  // Create custom animation
  createAnimation: (from, to, options = {}) => ({
    from,
    to,
    duration: options.duration || ANIMATION_DURATION.NORMAL,
    timing: options.timing || ANIMATION_TIMING.EASE_OUT,
    delay: options.delay || ANIMATION_DELAY.NONE,
    iteration: options.iteration || ANIMATION_ITERATION.ONCE,
    direction: options.direction || ANIMATION_DIRECTION.NORMAL,
    fillMode: options.fillMode || ANIMATION_FILL_MODE.NONE,
  }),
  
  // Convert animation to CSS
  toCSS: (animation) => {
    const css = {
      animationDuration: animation.duration,
      animationTimingFunction: animation.timing,
      animationDelay: animation.delay,
      animationIterationCount: animation.iteration,
      animationDirection: animation.direction,
      animationFillMode: animation.fillMode,
    };
    
    if (animation.keyframes) {
      css.animationName = 'custom-keyframes';
    }
    
    return css;
  },
  
  // Get animation duration in milliseconds
  getDurationMs: (duration) => {
    return parseInt(duration.replace('ms', '')) || 300;
  },
  
  // Check if animation is running
  isAnimationRunning: (element) => {
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.animationPlayState === 'running';
  },
  
  // Pause animation
  pauseAnimation: (element) => {
    element.style.animationPlayState = 'paused';
  },
  
  // Resume animation
  resumeAnimation: (element) => {
    element.style.animationPlayState = 'running';
  },
}

export default {
  ANIMATION_DURATION,
  ANIMATION_TIMING,
  ANIMATION_DELAY,
  ANIMATION_ITERATION,
  ANIMATION_DIRECTION,
  ANIMATION_FILL_MODE,
  ANIMATIONS,
  ANIMATION_PRESETS,
  ANIMATION_UTILITIES,
}
