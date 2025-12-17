import React, { useState, useEffect, useRef, memo } from 'react'

const PLACEHOLDERS = [
    'Search by business',
    'Search by location',
    'Search by area',
    'Search by city',
    'Search by state',
    'Search by service type',
]

const SearchPlaceholder = memo(() => {
    const [animatedPlaceholder, setAnimatedPlaceholder] = useState(PLACEHOLDERS[0])
    const timeoutRef = useRef(null)
    const currentIndexRef = useRef(0)
    const charIndexRef = useRef(0)
    const isDeletingRef = useRef(false)

    useEffect(() => {
        const typePlaceholder = () => {
            const currentPlaceholder = PLACEHOLDERS[currentIndexRef.current]
            let typingSpeed = 100

            if (isDeletingRef.current) {
                const newText = currentPlaceholder.substring(0, charIndexRef.current - 1)
                setAnimatedPlaceholder(newText)
                charIndexRef.current--
                typingSpeed = 50
                if (charIndexRef.current === 0) {
                    isDeletingRef.current = false
                    currentIndexRef.current = (currentIndexRef.current + 1) % PLACEHOLDERS.length
                    typingSpeed = 500
                }
            } else {
                const newText = currentPlaceholder.substring(0, charIndexRef.current + 1)
                setAnimatedPlaceholder(newText)
                charIndexRef.current++
                typingSpeed = 100
                if (charIndexRef.current === currentPlaceholder.length) {
                    typingSpeed = 2000
                    isDeletingRef.current = true
                }
            }

            timeoutRef.current = setTimeout(typePlaceholder, typingSpeed)
        }

        // Delay initial animation to reduce initial load
        timeoutRef.current = setTimeout(typePlaceholder, 1000)
        
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return (
        <span className="truncate">
            {animatedPlaceholder}
        </span>
    )
})

SearchPlaceholder.displayName = 'SearchPlaceholder'

export default SearchPlaceholder
