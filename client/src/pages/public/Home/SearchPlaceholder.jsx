import React, { useState, useEffect } from 'react'

const PLACEHOLDERS = [
    'Search by business',
    'Search by location',
    'Search by area',
    'Search by city',
    'Search by state',
    'Search by service type',
]

const SearchPlaceholder = () => {
    const [animatedPlaceholder, setAnimatedPlaceholder] = useState('')

    useEffect(() => {
        let currentIndex = 0
        let charIndex = 0
        let isDeleting = false
        let timeoutId = null

        const typePlaceholder = () => {
            const currentPlaceholder = PLACEHOLDERS[currentIndex]
            let typingSpeed = 100

            if (isDeleting) {
                setAnimatedPlaceholder(currentPlaceholder.substring(0, charIndex - 1))
                charIndex--
                typingSpeed = 50
                if (charIndex === 0) {
                    isDeleting = false
                    currentIndex = (currentIndex + 1) % PLACEHOLDERS.length
                    typingSpeed = 500
                }
            } else {
                setAnimatedPlaceholder(currentPlaceholder.substring(0, charIndex + 1))
                charIndex++
                typingSpeed = 100
                if (charIndex === currentPlaceholder.length) {
                    typingSpeed = 2000
                    isDeleting = true
                }
            }

            timeoutId = setTimeout(typePlaceholder, typingSpeed)
        }

        timeoutId = setTimeout(typePlaceholder, 1000)
        return () => timeoutId && clearTimeout(timeoutId)
    }, [])

    return (
        <span className="truncate">
            {animatedPlaceholder || PLACEHOLDERS[0]}
        </span>
    )
}

export default SearchPlaceholder
