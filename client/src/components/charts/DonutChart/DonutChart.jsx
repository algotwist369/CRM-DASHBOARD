import React, { useRef, useEffect } from 'react'

const DonutChart = ({ 
  data = [],
  width = '300px',
  height = '300px',
  showLegend = true,
  showLabels = true,
  showPercentages = true,
  centerText = '',
  centerValue = '',
  innerRadius = 0.6,
  colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
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
  }, [data, colors, showLabels, showPercentages, centerText, centerValue, innerRadius])

  const drawChart = (ctx, width, height) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const outerRadius = Math.min(width, height) / 2 - 20
    const innerRadiusValue = outerRadius * innerRadius

    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) return

    let currentAngle = -Math.PI / 2 // Start from top

    // Draw donut slices
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI
      const color = colors[index % colors.length]

      // Draw outer arc
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle)
      ctx.arc(centerX, centerY, innerRadiusValue, currentAngle + sliceAngle, currentAngle, true)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()

      // Draw slice border
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw label if enabled
      if (showLabels || showPercentages) {
        const labelAngle = currentAngle + sliceAngle / 2
        const labelRadius = (outerRadius + innerRadiusValue) / 2
        const labelX = centerX + Math.cos(labelAngle) * labelRadius
        const labelY = centerY + Math.sin(labelAngle) * labelRadius

        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (showLabels && showPercentages) {
          const percentage = ((item.value / total) * 100).toFixed(1)
          ctx.fillText(`${item.label} (${percentage}%)`, labelX, labelY)
        } else if (showLabels) {
          ctx.fillText(item.label, labelX, labelY)
        } else if (showPercentages) {
          const percentage = ((item.value / total) * 100).toFixed(1)
          ctx.fillText(`${percentage}%`, labelX, labelY)
        }
      }

      currentAngle += sliceAngle
    })

    // Draw center text
    if (centerText || centerValue) {
      ctx.fillStyle = '#374151'
      ctx.font = 'bold 16px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      if (centerValue) {
        ctx.font = 'bold 24px Inter, sans-serif'
        ctx.fillText(centerValue, centerX, centerY - 8)
      }
      
      if (centerText) {
        ctx.font = '14px Inter, sans-serif'
        ctx.fillStyle = '#6B7280'
        ctx.fillText(centerText, centerX, centerY + 12)
      }
    }
  }

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
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
          {data.map((item, index) => {
            const percentage = ((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)
            return (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-600">
                  {item.label} ({percentage}%)
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DonutChart
