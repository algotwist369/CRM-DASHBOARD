import React, { useRef, useEffect } from 'react'

const AreaChart = ({ 
  data = [],
  width = '100%',
  height = '300px',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  stacked = false,
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
  }, [data, colors, showGrid, stacked])

  const drawChart = (ctx, width, height) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    const padding = 40
    const chartWidth = width - (padding * 2)
    const chartHeight = height - (padding * 2)

    // Find min/max values
    const allValues = data.flatMap(dataset => dataset.data)
    const minValue = Math.min(0, ...allValues)
    const maxValue = Math.max(...allValues)
    const valueRange = maxValue - minValue

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 1
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(padding + chartWidth, y)
        ctx.stroke()
      }
      
      // Vertical grid lines
      for (let i = 0; i <= 5; i++) {
        const x = padding + (chartWidth / 5) * i
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, padding + chartHeight)
        ctx.stroke()
      }
    }

    // Draw axes
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    
    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding + chartHeight)
    ctx.lineTo(padding + chartWidth, padding + chartHeight)
    ctx.stroke()
    
    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, padding + chartHeight)
    ctx.stroke()

    if (stacked) {
      // Draw stacked areas
      let cumulativeValues = new Array(data[0]?.data.length || 0).fill(0)
      
      data.forEach((dataset, datasetIndex) => {
        if (!dataset.data || dataset.data.length === 0) return

        const color = colors[datasetIndex % colors.length]
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight)
        gradient.addColorStop(0, color + '80') // 50% opacity
        gradient.addColorStop(1, color + '20') // 12% opacity
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        
        dataset.data.forEach((value, index) => {
          const x = padding + (chartWidth / (dataset.data.length - 1)) * index
          const y = padding + chartHeight - ((cumulativeValues[index] + value - minValue) / valueRange) * chartHeight
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        // Complete the area by going back along the bottom
        for (let i = dataset.data.length - 1; i >= 0; i--) {
          const x = padding + (chartWidth / (dataset.data.length - 1)) * i
          const y = padding + chartHeight - ((cumulativeValues[i] - minValue) / valueRange) * chartHeight
          ctx.lineTo(x, y)
        }
        
        ctx.closePath()
        ctx.fill()
        
        // Draw line on top
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        
        dataset.data.forEach((value, index) => {
          const x = padding + (chartWidth / (dataset.data.length - 1)) * index
          const y = padding + chartHeight - ((cumulativeValues[index] + value - minValue) / valueRange) * chartHeight
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        ctx.stroke()
        
        // Update cumulative values
        cumulativeValues = cumulativeValues.map((cum, index) => cum + dataset.data[index])
      })
    } else {
      // Draw individual areas
      data.forEach((dataset, datasetIndex) => {
        if (!dataset.data || dataset.data.length === 0) return

        const color = colors[datasetIndex % colors.length]
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight)
        gradient.addColorStop(0, color + '80') // 50% opacity
        gradient.addColorStop(1, color + '20') // 12% opacity
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        
        dataset.data.forEach((value, index) => {
          const x = padding + (chartWidth / (dataset.data.length - 1)) * index
          const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        // Complete the area by going to bottom
        ctx.lineTo(padding + chartWidth, padding + chartHeight)
        ctx.lineTo(padding, padding + chartHeight)
        ctx.closePath()
        ctx.fill()
        
        // Draw line on top
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        
        dataset.data.forEach((value, index) => {
          const x = padding + (chartWidth / (dataset.data.length - 1)) * index
          const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        ctx.stroke()
      })
    }

    // Draw labels
    ctx.fillStyle = '#6B7280'
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'center'
    
    // X-axis labels
    if (data[0] && data[0].labels) {
      data[0].labels.forEach((label, index) => {
        const x = padding + (chartWidth / (data[0].labels.length - 1)) * index
        ctx.fillText(label, x, padding + chartHeight + 20)
      })
    }

    // Y-axis labels
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i)
      const y = padding + (chartHeight / 5) * i + 4
      ctx.fillText(Math.round(value).toString(), padding - 10, y)
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
          {data.map((dataset, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AreaChart
