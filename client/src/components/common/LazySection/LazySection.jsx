import React, { useState, useEffect, useRef } from 'react'

const LazySection = ({ children, fallback, threshold = 0.1 }) => {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        if (isVisible) return // Already visible, no need to observe anymore

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [isVisible, threshold])

    return (
        <div ref={ref} className="min-h-[200px]">
            {isVisible ? children : fallback}
        </div>
    )
}

export default LazySection
