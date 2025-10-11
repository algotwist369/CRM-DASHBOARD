/**
 * URL utility functions
 */

/**
 * Check if value is a valid URL
 * @param {string} url - URL to check
 * @returns {boolean} Is valid URL
 */
export const isValidURL = (url) => {
  if (!url || typeof url !== 'string') return false
  
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Parse URL
 * @param {string} url - URL to parse
 * @returns {object|null} Parsed URL object
 */
export const parseURL = (url) => {
  if (!url || typeof url !== 'string') return null
  
  try {
    const urlObj = new URL(url)
    return {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      origin: urlObj.origin,
      href: urlObj.href
    }
  } catch {
    return null
  }
}

/**
 * Get URL protocol
 * @param {string} url - URL to get protocol from
 * @returns {string} Protocol
 */
export const getURLProtocol = (url) => {
  const parsed = parseURL(url)
  return parsed ? parsed.protocol : ''
}

/**
 * Get URL hostname
 * @param {string} url - URL to get hostname from
 * @returns {string} Hostname
 */
export const getURLHostname = (url) => {
  const parsed = parseURL(url)
  return parsed ? parsed.hostname : ''
}

/**
 * Get URL port
 * @param {string} url - URL to get port from
 * @returns {string} Port
 */
export const getURLPort = (url) => {
  const parsed = parseURL(url)
  return parsed ? parsed.port : ''
}

/**
 * Get URL pathname
 * @param {string} url - URL to get pathname from
 * @returns {string} Pathname
 */
export const getURLPathname = (url) => {
  const parsed = parseURL(url)
  return parsed ? parsed.pathname : ''
}

/**
 * Get URL search parameters
 * @param {string} url - URL to get search parameters from
 * @returns {URLSearchParams} Search parameters
 */
export const getURLSearchParams = (url) => {
  if (!url || typeof url !== 'string') return new URLSearchParams()
  
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams
  } catch {
    return new URLSearchParams()
  }
}

/**
 * Get URL hash
 * @param {string} url - URL to get hash from
 * @returns {string} Hash
 */
export const getURLHash = (url) => {
  const parsed = parseURL(url)
  return parsed ? parsed.hash : ''
}

/**
 * Get URL origin
 * @param {string} url - URL to get origin from
 * @returns {string} Origin
 */
export const getURLOrigin = (url) => {
  const parsed = parseURL(url)
  return parsed ? parsed.origin : ''
}

/**
 * Build URL from parts
 * @param {object} parts - URL parts
 * @returns {string} Built URL
 */
export const buildURL = (parts) => {
  if (!parts || typeof parts !== 'object') return ''
  
  const { protocol, hostname, port, pathname, search, hash } = parts
  
  let url = ''
  
  if (protocol) {
    url += protocol
    if (!protocol.endsWith(':')) {
      url += ':'
    }
    url += '//'
  }
  
  if (hostname) {
    url += hostname
  }
  
  if (port) {
    url += ':' + port
  }
  
  if (pathname) {
    if (!pathname.startsWith('/')) {
      url += '/'
    }
    url += pathname
  }
  
  if (search) {
    if (!search.startsWith('?')) {
      url += '?'
    }
    url += search
  }
  
  if (hash) {
    if (!hash.startsWith('#')) {
      url += '#'
    }
    url += hash
  }
  
  return url
}

/**
 * Add query parameter to URL
 * @param {string} url - URL to add parameter to
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 * @returns {string} URL with added parameter
 */
export const addQueryParam = (url, key, value) => {
  if (!url || !key) return url
  
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set(key, value)
    return urlObj.href
  } catch {
    return url
  }
}

/**
 * Remove query parameter from URL
 * @param {string} url - URL to remove parameter from
 * @param {string} key - Parameter key
 * @returns {string} URL without parameter
 */
export const removeQueryParam = (url, key) => {
  if (!url || !key) return url
  
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.delete(key)
    return urlObj.href
  } catch {
    return url
  }
}

/**
 * Get query parameter from URL
 * @param {string} url - URL to get parameter from
 * @param {string} key - Parameter key
 * @returns {string|null} Parameter value
 */
export const getQueryParam = (url, key) => {
  if (!url || !key) return null
  
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get(key)
  } catch {
    return null
  }
}

/**
 * Get all query parameters from URL
 * @param {string} url - URL to get parameters from
 * @returns {object} Query parameters object
 */
export const getAllQueryParams = (url) => {
  if (!url || typeof url !== 'string') return {}
  
  try {
    const urlObj = new URL(url)
    const params = {}
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value
    })
    
    return params
  } catch {
    return {}
  }
}

/**
 * Set query parameters in URL
 * @param {string} url - URL to set parameters in
 * @param {object} params - Parameters to set
 * @returns {string} URL with set parameters
 */
export const setQueryParams = (url, params) => {
  if (!url || !params || typeof params !== 'object') return url
  
  try {
    const urlObj = new URL(url)
    
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value)
    })
    
    return urlObj.href
  } catch {
    return url
  }
}

/**
 * Clear all query parameters from URL
 * @param {string} url - URL to clear parameters from
 * @returns {string} URL without parameters
 */
export const clearQueryParams = (url) => {
  if (!url || typeof url !== 'string') return url
  
  try {
    const urlObj = new URL(url)
    urlObj.search = ''
    return urlObj.href
  } catch {
    return url
  }
}

/**
 * Encode URL
 * @param {string} url - URL to encode
 * @returns {string} Encoded URL
 */
export const encodeURL = (url) => {
  if (!url || typeof url !== 'string') return ''
  return encodeURI(url)
}

/**
 * Decode URL
 * @param {string} url - URL to decode
 * @returns {string} Decoded URL
 */
export const decodeURL = (url) => {
  if (!url || typeof url !== 'string') return ''
  return decodeURI(url)
}

/**
 * Encode URL component
 * @param {string} component - Component to encode
 * @returns {string} Encoded component
 */
export const encodeURLComponent = (component) => {
  if (!component || typeof component !== 'string') return ''
  return encodeURIComponent(component)
}

/**
 * Decode URL component
 * @param {string} component - Component to decode
 * @returns {string} Decoded component
 */
export const decodeURLComponent = (component) => {
  if (!component || typeof component !== 'string') return ''
  return decodeURIComponent(component)
}

/**
 * Check if URL is absolute
 * @param {string} url - URL to check
 * @returns {boolean} Is absolute URL
 */
export const isAbsoluteURL = (url) => {
  if (!url || typeof url !== 'string') return false
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')
}

/**
 * Check if URL is relative
 * @param {string} url - URL to check
 * @returns {boolean} Is relative URL
 */
export const isRelativeURL = (url) => {
  if (!url || typeof url !== 'string') return false
  return !isAbsoluteURL(url)
}

/**
 * Convert relative URL to absolute
 * @param {string} relativeURL - Relative URL
 * @param {string} baseURL - Base URL
 * @returns {string} Absolute URL
 */
export const toAbsoluteURL = (relativeURL, baseURL) => {
  if (!relativeURL || !baseURL) return relativeURL
  
  try {
    return new URL(relativeURL, baseURL).href
  } catch {
    return relativeURL
  }
}

/**
 * Convert absolute URL to relative
 * @param {string} absoluteURL - Absolute URL
 * @param {string} baseURL - Base URL
 * @returns {string} Relative URL
 */
export const toRelativeURL = (absoluteURL, baseURL) => {
  if (!absoluteURL || !baseURL) return absoluteURL
  
  try {
    const url = new URL(absoluteURL)
    const base = new URL(baseURL)
    
    if (url.origin === base.origin) {
      return url.pathname + url.search + url.hash
    }
    
    return absoluteURL
  } catch {
    return absoluteURL
  }
}

/**
 * Check if URL is same origin
 * @param {string} url1 - First URL
 * @param {string} url2 - Second URL
 * @returns {boolean} Is same origin
 */
export const isSameOrigin = (url1, url2) => {
  if (!url1 || !url2) return false
  
  try {
    const origin1 = new URL(url1).origin
    const origin2 = new URL(url2).origin
    return origin1 === origin2
  } catch {
    return false
  }
}

/**
 * Get domain from URL
 * @param {string} url - URL to get domain from
 * @returns {string} Domain
 */
export const getDomain = (url) => {
  const hostname = getURLHostname(url)
  if (!hostname) return ''
  
  const parts = hostname.split('.')
  if (parts.length >= 2) {
    return parts.slice(-2).join('.')
  }
  
  return hostname
}

/**
 * Get subdomain from URL
 * @param {string} url - URL to get subdomain from
 * @returns {string} Subdomain
 */
export const getSubdomain = (url) => {
  const hostname = getURLHostname(url)
  if (!hostname) return ''
  
  const parts = hostname.split('.')
  if (parts.length > 2) {
    return parts.slice(0, -2).join('.')
  }
  
  return ''
}

/**
 * Check if URL is HTTPS
 * @param {string} url - URL to check
 * @returns {boolean} Is HTTPS
 */
export const isHTTPS = (url) => {
  const protocol = getURLProtocol(url)
  return protocol === 'https:'
}

/**
 * Check if URL is HTTP
 * @param {string} url - URL to check
 * @returns {boolean} Is HTTP
 */
export const isHTTP = (url) => {
  const protocol = getURLProtocol(url)
  return protocol === 'http:'
}

/**
 * Force HTTPS
 * @param {string} url - URL to force HTTPS
 * @returns {string} HTTPS URL
 */
export const forceHTTPS = (url) => {
  if (!url || typeof url !== 'string') return url
  
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  
  if (url.startsWith('//')) {
    return 'https:' + url
  }
  
  return url
}

/**
 * URL constants
 */
export const URL_CONSTANTS = {
  PROTOCOLS: {
    HTTP: 'http:',
    HTTPS: 'https:',
    FTP: 'ftp:',
    FILE: 'file:',
    WS: 'ws:',
    WSS: 'wss:'
  },
  DEFAULT_PORTS: {
    HTTP: '80',
    HTTPS: '443',
    FTP: '21',
    SSH: '22',
    TELNET: '23',
    SMTP: '25',
    DNS: '53',
    POP3: '110',
    IMAP: '143',
    HTTPS_ALT: '8080'
  }
}

export default {
  isValidURL,
  parseURL,
  getURLProtocol,
  getURLHostname,
  getURLPort,
  getURLPathname,
  getURLSearchParams,
  getURLHash,
  getURLOrigin,
  buildURL,
  addQueryParam,
  removeQueryParam,
  getQueryParam,
  getAllQueryParams,
  setQueryParams,
  clearQueryParams,
  encodeURL,
  decodeURL,
  encodeURLComponent,
  decodeURLComponent,
  isAbsoluteURL,
  isRelativeURL,
  toAbsoluteURL,
  toRelativeURL,
  isSameOrigin,
  getDomain,
  getSubdomain,
  isHTTPS,
  isHTTP,
  forceHTTPS,
  URL_CONSTANTS
}
