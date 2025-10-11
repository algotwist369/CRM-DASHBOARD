import { useState, useCallback } from 'react'

export const usePrint = () => {
  const [printing, setPrinting] = useState(false)
  const [error, setError] = useState(null)

  const printElement = useCallback((element, options = {}) => {
    try {
      setPrinting(true)
      setError(null)

      const {
        title = 'Print',
        styles = '',
        removeAfterPrint = true
      } = options

      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker.')
      }

      // Get the element content
      const elementContent = element.innerHTML || element.outerHTML

      // Write the content to the print window
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #000;
                background: #fff;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
              ${styles}
            </style>
          </head>
          <body>
            ${elementContent}
          </body>
        </html>
      `)

      printWindow.document.close()

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
        
        if (removeAfterPrint) {
          printWindow.onafterprint = () => {
            printWindow.close()
          }
        }
      }

      setPrinting(false)
    } catch (err) {
      setError(err.message)
      setPrinting(false)
    }
  }, [])

  const printPage = useCallback(() => {
    try {
      setPrinting(true)
      setError(null)
      
      window.print()
      setPrinting(false)
    } catch (err) {
      setError(err.message)
      setPrinting(false)
    }
  }, [])

  const printText = useCallback((text, options = {}) => {
    try {
      setPrinting(true)
      setError(null)

      const {
        title = 'Print',
        styles = ''
      } = options

      const printWindow = window.open('', '_blank')
      
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker.')
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #000;
                background: #fff;
                white-space: pre-wrap;
              }
              @media print {
                body { margin: 0; }
              }
              ${styles}
            </style>
          </head>
          <body>
            ${text}
          </body>
        </html>
      `)

      printWindow.document.close()

      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }

      setPrinting(false)
    } catch (err) {
      setError(err.message)
      setPrinting(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    printing,
    error,
    printElement,
    printPage,
    printText,
    clearError
  }
}

export default usePrint
