import React, { useRef, useEffect } from 'react'

const BarChart = ({ 
  data = [],
  width = '100%',
  height = '300px',
  showGrid = true,
  showLegend = true,
  horizontal = false,
  colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
  className = ''
}) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    drawChart(ctx, rect.width, rect.height)
  }, [data, colors, showGrid, horizontal])

  const drawChart = (ctx, width, height) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    const padding = 40
    const chartWidth = width - (padding * 2)
    const chartHeight = height - (padding * 2)

    // Find min/max values
    const allValues = data.map(item => item.value)
    const minValue = Math.min(0, ...allValues)
    const maxValue = Math.max(...allValues)
    const valueRange = maxValue - minValue

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 1
      
      if (horizontal) {
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
          const x = padding + (chartWidth / 5) * i
          ctx.beginPath()
          ctx.moveTo(x, padding)
          ctx.lineTo(x, padding + chartHeight)
          ctx.stroke()
        }
      } else {
        // Vertical grid lines
        for (let i = 0; i <= 5; i++) {
          const y = padding + (chartHeight / 5) * i
          ctx.beginPath()
          ctx.moveTo(padding, y)
          ctx.lineTo(padding + chartWidth, y)
          ctx.stroke()
        }
      }
    }

    // Draw axes
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    
    if (horizontal) {
      // X-axis (horizontal)
      ctx.beginPath()
      ctx.moveTo(padding, padding + chartHeight)
      ctx.lineTo(padding + chartWidth, padding + chartHeight)
      ctx.stroke()
      
      // Y-axis (vertical)
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, padding + chartHeight)
      ctx.stroke()
    } else {
      // X-axis (horizontal)
      ctx.beginPath()
      ctx.moveTo(padding, padding + chartHeight)
      ctx.lineTo(padding + chartWidth, padding + chartHeight)
      ctx.stroke()
      
      // Y-axis (vertical)
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, padding + chartHeight)
      ctx.stroke()
    }

    // Draw bars
    const barCount = data.length
    const barSpacing = horizontal ? chartHeight / (barCount + 1) : chartWidth / (barCount + 1)
    const barWidth = horizontal ? barSpacing * 0.6 : barSpacing * 0.6

    data.forEach((item, index) => {
      const color = colors[index % colors.length]
      ctx.fillStyle = color

      if (horizontal) {
        const barHeight = barWidth
        const barX = padding + ((item.value - minValue) / valueRange) * chartWidth
        const barY = padding + barSpacing * (index + 1) - barHeight / 2
        
        ctx.fillRect(padding, barY, barX - padding, barHeight)
      } else {
        const barHeight = ((item.value - minValue) / valueRange) * chartHeight
        const barX = padding + barSpacing * (index + 1) - barWidth / 2
        const barY = padding + chartHeight - barHeight
        
        ctx.fillRect(barX, barY, barWidth, barHeight)
      }
    })

    // Draw labels
    ctx.fillStyle = '#6B7280'
    ctx.font = '12px Inter, sans-serif'
    
    if (horizontal) {
      // Y-axis labels (category names)
      ctx.textAlign = 'right'
      data.forEach((item, index) => {
        const y = padding + barSpacing * (index + 1)
        ctx.fillText(item.label, padding - 10, y + 4)
      })
      
      // X-axis labels (values)
      ctx.textAlign = 'center'
      for (let i = 0; i <= 5; i++) {
        const value = minValue + (valueRange / 5) * i
        const x = padding + (chartWidth / 5) * i
        ctx.fillText(Math.round(value).toString(), x, padding + chartHeight + 20)
      }
    } else {
      // X-axis labels (category names)
      ctx.textAlign = 'center'
      data.forEach((item, index) => {
        const x = padding + barSpacing * (index + 1)
        ctx.fillText(item.label, x, padding + chartHeight + 20)
      })
      
      // Y-axis labels (values)
      ctx.textAlign = 'right'
      for (let i = 0; i <= 5; i++) {
        const value = minValue + (valueRange / 5) * (5 - i)
        const y = padding + (chartHeight / 5) * i + 4
        ctx.fillText(Math.round(value).toString(), padding - 10, y)
      }
    }
  }

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="w-full h-full"
      />
      {showLegend && data.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BarChart
