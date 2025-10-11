import { useEffect } from 'react'

export const useKeyPress = (targetKey, callback, options = {}) => {
  const {
    event = 'keydown',
    preventDefault = false,
    stopPropagation = false
  } = options

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === targetKey) {
        if (preventDefault) {
          event.preventDefault()
        }
        if (stopPropagation) {
          event.stopPropagation()
        }
        callback(event)
      }
    }

    document.addEventListener(event, handleKeyPress)

    return () => {
      document.removeEventListener(event, handleKeyPress)
    }
  }, [targetKey, callback, event, preventDefault, stopPropagation])
}

// Hook for multiple key combinations
export const useKeyCombination = (keys, callback, options = {}) => {
  const {
    event = 'keydown',
    preventDefault = false,
    stopPropagation = false
  } = options

  useEffect(() => {
    const pressedKeys = new Set()

    const handleKeyDown = (event) => {
      pressedKeys.add(event.key)

      if (keys.every(key => pressedKeys.has(key))) {
        if (preventDefault) {
          event.preventDefault()
        }
        if (stopPropagation) {
          event.stopPropagation()
        }
        callback(event)
      }
    }

    const handleKeyUp = (event) => {
      pressedKeys.delete(event.key)
    }

    document.addEventListener(event, handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener(event, handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [keys, callback, event, preventDefault, stopPropagation])
}

// Hook for escape key
export const useEscapeKey = (callback) => {
  useKeyPress('Escape', callback)
}

// Hook for enter key
export const useEnterKey = (callback) => {
  useKeyPress('Enter', callback)
}

export default useKeyPress
