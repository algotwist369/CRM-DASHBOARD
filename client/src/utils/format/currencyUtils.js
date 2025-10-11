/**
 * Currency utility functions
 */

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale (default: 'en-US')
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US', options = {}) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00'
  
  const defaultOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
  
  const formatOptions = { ...defaultOptions, ...options }
  
  return new Intl.NumberFormat(locale, formatOptions).format(amount)
}

/**
 * Format currency amount with symbol
 * @param {number} amount - Amount to format
 * @param {string} symbol - Currency symbol
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency with symbol
 */
export const formatCurrencyWithSymbol = (amount, symbol = '$', decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) return `${symbol}0.00`
  
  const formattedAmount = amount.toFixed(decimals)
  return `${symbol}${formattedAmount}`
}

/**
 * Format currency amount without symbol
 * @param {number} amount - Amount to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted amount without symbol
 */
export const formatCurrencyAmount = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0.00'
  
  return amount.toFixed(decimals)
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed amount
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString || typeof currencyString !== 'string') return 0
  
  // Remove currency symbols and spaces
  const cleaned = currencyString.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    RUB: '₽',
    BRL: 'R$',
    INR: '₹',
    KRW: '₩',
    SGD: 'S$',
    HKD: 'HK$',
    NZD: 'NZ$',
    MXN: '$',
    ZAR: 'R',
    TRY: '₺',
    ILS: '₪',
    AED: 'د.إ',
    SAR: '﷼',
    QAR: '﷼',
    KWD: 'د.ك',
    BHD: 'د.ب',
    OMR: '﷼',
    JOD: 'د.ا',
    LBP: 'ل.ل',
    EGP: '£',
    MAD: 'د.م.',
    TND: 'د.ت',
    DZD: 'د.ج',
    LYD: 'ل.د',
    SDG: 'ج.س.',
    ETB: 'Br',
    KES: 'KSh',
    UGX: 'USh',
    TZS: 'TSh',
    ZMW: 'ZK',
    BWP: 'P',
    SZL: 'L',
    LSL: 'L',
    NAD: 'N$',
    MUR: '₨',
    SCR: '₨',
    KMF: 'CF',
    DJF: 'Fdj',
    ERN: 'Nfk',
    SOS: 'S',
    TTD: 'TT$',
    BBD: 'Bds$',
    BZD: 'BZ$',
    JMD: 'J$',
    XCD: 'EC$',
    AWG: 'ƒ',
    BMD: 'BD$',
    KYD: 'CI$',
    FKP: '£',
    GIP: '£',
    SHP: '£',
    GGP: '£',
    JEP: '£',
    IMP: '£',
    VEF: 'Bs',
    VES: 'Bs.S',
    COP: '$',
    CLP: '$',
    ARS: '$',
    UYU: '$U',
    PYG: '₲',
    BOB: 'Bs',
    PEN: 'S/',
    GYD: 'G$',
    SRD: '$',
    BGN: 'лв',
    RON: 'lei',
    HRK: 'kn',
    RSD: 'дин',
    MKD: 'ден',
    ALL: 'L',
    BAM: 'КМ',
    MDL: 'L',
    UAH: '₴',
    BYN: 'Br',
    GEL: '₾',
    AMD: '֏',
    AZN: '₼',
    KZT: '₸',
    KGS: 'сом',
    TJS: 'SM',
    TMT: 'T',
    UZS: 'сўм',
    AFN: '؋',
    PKR: '₨',
    LKR: '₨',
    NPR: '₨',
    BDT: '৳',
    BTN: 'Nu.',
    MVR: 'ރ',
    MMK: 'K',
    THB: '฿',
    LAK: '₭',
    KHR: '៛',
    VND: '₫',
    IDR: 'Rp',
    MYR: 'RM',
    PHP: '₱',
    TWD: 'NT$',
    MOP: 'MOP$',
    BND: 'B$',
    FJD: 'FJ$',
    PGK: 'K',
    SBD: 'SI$',
    VUV: 'Vt',
    WST: 'WS$',
    TOP: 'T$',
    XPF: '₣',
    CFP: '₣',
    NIO: 'C$',
    GTQ: 'Q',
    HNL: 'L',
    SVC: '₡',
    PAB: 'B/.',
    CRC: '₡',
    DOP: 'RD$',
    HTG: 'G',
    CUP: '$',
    CUC: '$',
    BIF: 'FBu',
    RWF: 'RF',
    TND: 'د.ت',
    DZD: 'د.ج',
    LYD: 'ل.د',
    SDG: 'ج.س.',
    ETB: 'Br',
    KES: 'KSh',
    UGX: 'USh',
    TZS: 'TSh',
    ZMW: 'ZK',
    BWP: 'P',
    SZL: 'L',
    LSL: 'L',
    NAD: 'N$',
    MUR: '₨',
    SCR: '₨',
    KMF: 'CF',
    DJF: 'Fdj',
    ERN: 'Nfk',
    SOS: 'S',
    TTD: 'TT$',
    BBD: 'Bds$',
    BZD: 'BZ$',
    JMD: 'J$',
    XCD: 'EC$',
    AWG: 'ƒ',
    BMD: 'BD$',
    KYD: 'CI$',
    FKP: '£',
    GIP: '£',
    SHP: '£',
    GGP: '£',
    JEP: '£',
    IMP: '£',
    VEF: 'Bs',
    VES: 'Bs.S',
    COP: '$',
    CLP: '$',
    ARS: '$',
    UYU: '$U',
    PYG: '₲',
    BOB: 'Bs',
    PEN: 'S/',
    GYD: 'G$',
    SRD: '$',
    BGN: 'лв',
    RON: 'lei',
    HRK: 'kn',
    RSD: 'дин',
    MKD: 'ден',
    ALL: 'L',
    BAM: 'КМ',
    MDL: 'L',
    UAH: '₴',
    BYN: 'Br',
    GEL: '₾',
    AMD: '֏',
    AZN: '₼',
    KZT: '₸',
    KGS: 'сом',
    TJS: 'SM',
    TMT: 'T',
    UZS: 'сўм',
    AFN: '؋',
    PKR: '₨',
    LKR: '₨',
    NPR: '₨',
    BDT: '৳',
    BTN: 'Nu.',
    MVR: 'ރ',
    MMK: 'K',
    THB: '฿',
    LAK: '₭',
    KHR: '៛',
    VND: '₫',
    IDR: 'Rp',
    MYR: 'RM',
    PHP: '₱',
    TWD: 'NT$',
    MOP: 'MOP$',
    BND: 'B$',
    FJD: 'FJ$',
    PGK: 'K',
    SBD: 'SI$',
    VUV: 'Vt',
    WST: 'WS$',
    TOP: 'T$',
    XPF: '₣',
    CFP: '₣',
    NIO: 'C$',
    GTQ: 'Q',
    HNL: 'L',
    SVC: '₡',
    PAB: 'B/.',
    CRC: '₡',
    DOP: 'RD$',
    HTG: 'G',
    CUP: '$',
    CUC: '$',
    BIF: 'FBu',
    RWF: 'RF'
  }
  
  return symbols[currency] || currency
}

/**
 * Get currency name
 * @param {string} currency - Currency code
 * @returns {string} Currency name
 */
export const getCurrencyName = (currency) => {
  const names = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    PLN: 'Polish Zloty',
    CZK: 'Czech Koruna',
    HUF: 'Hungarian Forint',
    RUB: 'Russian Ruble',
    BRL: 'Brazilian Real',
    INR: 'Indian Rupee',
    KRW: 'South Korean Won',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar',
    NZD: 'New Zealand Dollar',
    MXN: 'Mexican Peso',
    ZAR: 'South African Rand',
    TRY: 'Turkish Lira',
    ILS: 'Israeli Shekel',
    AED: 'UAE Dirham',
    SAR: 'Saudi Riyal',
    QAR: 'Qatari Riyal',
    KWD: 'Kuwaiti Dinar',
    BHD: 'Bahraini Dinar',
    OMR: 'Omani Rial',
    JOD: 'Jordanian Dinar',
    LBP: 'Lebanese Pound',
    EGP: 'Egyptian Pound',
    MAD: 'Moroccan Dirham',
    TND: 'Tunisian Dinar',
    DZD: 'Algerian Dinar',
    LYD: 'Libyan Dinar',
    SDG: 'Sudanese Pound',
    ETB: 'Ethiopian Birr',
    KES: 'Kenyan Shilling',
    UGX: 'Ugandan Shilling',
    TZS: 'Tanzanian Shilling',
    ZMW: 'Zambian Kwacha',
    BWP: 'Botswana Pula',
    SZL: 'Swazi Lilangeni',
    LSL: 'Lesotho Loti',
    NAD: 'Namibian Dollar',
    MUR: 'Mauritian Rupee',
    SCR: 'Seychellois Rupee',
    KMF: 'Comorian Franc',
    DJF: 'Djiboutian Franc',
    ERN: 'Eritrean Nakfa',
    SOS: 'Somali Shilling',
    TTD: 'Trinidad and Tobago Dollar',
    BBD: 'Barbadian Dollar',
    BZD: 'Belize Dollar',
    JMD: 'Jamaican Dollar',
    XCD: 'East Caribbean Dollar',
    AWG: 'Aruban Florin',
    BMD: 'Bermudian Dollar',
    KYD: 'Cayman Islands Dollar',
    FKP: 'Falkland Islands Pound',
    GIP: 'Gibraltar Pound',
    SHP: 'Saint Helena Pound',
    GGP: 'Guernsey Pound',
    JEP: 'Jersey Pound',
    IMP: 'Isle of Man Pound',
    VEF: 'Venezuelan Bolivar',
    VES: 'Venezuelan Bolivar Soberano',
    COP: 'Colombian Peso',
    CLP: 'Chilean Peso',
    ARS: 'Argentine Peso',
    UYU: 'Uruguayan Peso',
    PYG: 'Paraguayan Guarani',
    BOB: 'Bolivian Boliviano',
    PEN: 'Peruvian Sol',
    GYD: 'Guyanese Dollar',
    SRD: 'Surinamese Dollar',
    BGN: 'Bulgarian Lev',
    RON: 'Romanian Leu',
    HRK: 'Croatian Kuna',
    RSD: 'Serbian Dinar',
    MKD: 'Macedonian Denar',
    ALL: 'Albanian Lek',
    BAM: 'Bosnia and Herzegovina Convertible Mark',
    MDL: 'Moldovan Leu',
    UAH: 'Ukrainian Hryvnia',
    BYN: 'Belarusian Ruble',
    GEL: 'Georgian Lari',
    AMD: 'Armenian Dram',
    AZN: 'Azerbaijani Manat',
    KZT: 'Kazakhstani Tenge',
    KGS: 'Kyrgyzstani Som',
    TJS: 'Tajikistani Somoni',
    TMT: 'Turkmenistani Manat',
    UZS: 'Uzbekistani Som',
    AFN: 'Afghan Afghani',
    PKR: 'Pakistani Rupee',
    LKR: 'Sri Lankan Rupee',
    NPR: 'Nepalese Rupee',
    BDT: 'Bangladeshi Taka',
    BTN: 'Bhutanese Ngultrum',
    MVR: 'Maldivian Rufiyaa',
    MMK: 'Myanmar Kyat',
    THB: 'Thai Baht',
    LAK: 'Lao Kip',
    KHR: 'Cambodian Riel',
    VND: 'Vietnamese Dong',
    IDR: 'Indonesian Rupiah',
    MYR: 'Malaysian Ringgit',
    PHP: 'Philippine Peso',
    TWD: 'Taiwan New Dollar',
    MOP: 'Macanese Pataca',
    BND: 'Brunei Dollar',
    FJD: 'Fijian Dollar',
    PGK: 'Papua New Guinean Kina',
    SBD: 'Solomon Islands Dollar',
    VUV: 'Vanuatu Vatu',
    WST: 'Samoan Tala',
    TOP: 'Tongan Paʻanga',
    XPF: 'CFP Franc',
    CFP: 'CFP Franc',
    NIO: 'Nicaraguan Cordoba',
    GTQ: 'Guatemalan Quetzal',
    HNL: 'Honduran Lempira',
    SVC: 'Salvadoran Colon',
    PAB: 'Panamanian Balboa',
    CRC: 'Costa Rican Colon',
    DOP: 'Dominican Peso',
    HTG: 'Haitian Gourde',
    CUP: 'Cuban Peso',
    CUC: 'Cuban Convertible Peso',
    BIF: 'Burundian Franc',
    RWF: 'Rwandan Franc'
  }
  
  return names[currency] || currency
}

/**
 * Get currency locale
 * @param {string} currency - Currency code
 * @returns {string} Locale for currency
 */
export const getCurrencyLocale = (currency) => {
  const locales = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    CAD: 'en-CA',
    AUD: 'en-AU',
    CHF: 'de-CH',
    CNY: 'zh-CN',
    SEK: 'sv-SE',
    NOK: 'nb-NO',
    DKK: 'da-DK',
    PLN: 'pl-PL',
    CZK: 'cs-CZ',
    HUF: 'hu-HU',
    RUB: 'ru-RU',
    BRL: 'pt-BR',
    INR: 'en-IN',
    KRW: 'ko-KR',
    SGD: 'en-SG',
    HKD: 'en-HK',
    NZD: 'en-NZ',
    MXN: 'es-MX',
    ZAR: 'en-ZA',
    TRY: 'tr-TR',
    ILS: 'he-IL',
    AED: 'ar-AE',
    SAR: 'ar-SA',
    QAR: 'ar-QA',
    KWD: 'ar-KW',
    BHD: 'ar-BH',
    OMR: 'ar-OM',
    JOD: 'ar-JO',
    LBP: 'ar-LB',
    EGP: 'ar-EG',
    MAD: 'ar-MA',
    TND: 'ar-TN',
    DZD: 'ar-DZ',
    LYD: 'ar-LY',
    SDG: 'ar-SD',
    ETB: 'am-ET',
    KES: 'en-KE',
    UGX: 'en-UG',
    TZS: 'en-TZ',
    ZMW: 'en-ZM',
    BWP: 'en-BW',
    SZL: 'en-SZ',
    LSL: 'en-LS',
    NAD: 'en-NA',
    MUR: 'en-MU',
    SCR: 'en-SC',
    KMF: 'ar-KM',
    DJF: 'ar-DJ',
    ERN: 'ar-ER',
    SOS: 'so-SO',
    TTD: 'en-TT',
    BBD: 'en-BB',
    BZD: 'en-BZ',
    JMD: 'en-JM',
    XCD: 'en-AG',
    AWG: 'nl-AW',
    BMD: 'en-BM',
    KYD: 'en-KY',
    FKP: 'en-FK',
    GIP: 'en-GI',
    SHP: 'en-SH',
    GGP: 'en-GG',
    JEP: 'en-JE',
    IMP: 'en-IM',
    VEF: 'es-VE',
    VES: 'es-VE',
    COP: 'es-CO',
    CLP: 'es-CL',
    ARS: 'es-AR',
    UYU: 'es-UY',
    PYG: 'es-PY',
    BOB: 'es-BO',
    PEN: 'es-PE',
    GYD: 'en-GY',
    SRD: 'nl-SR',
    BGN: 'bg-BG',
    RON: 'ro-RO',
    HRK: 'hr-HR',
    RSD: 'sr-RS',
    MKD: 'mk-MK',
    ALL: 'sq-AL',
    BAM: 'bs-BA',
    MDL: 'ro-MD',
    UAH: 'uk-UA',
    BYN: 'be-BY',
    GEL: 'ka-GE',
    AMD: 'hy-AM',
    AZN: 'az-AZ',
    KZT: 'kk-KZ',
    KGS: 'ky-KG',
    TJS: 'tg-TJ',
    TMT: 'tk-TM',
    UZS: 'uz-UZ',
    AFN: 'fa-AF',
    PKR: 'ur-PK',
    LKR: 'si-LK',
    NPR: 'ne-NP',
    BDT: 'bn-BD',
    BTN: 'dz-BT',
    MVR: 'dv-MV',
    MMK: 'my-MM',
    THB: 'th-TH',
    LAK: 'lo-LA',
    KHR: 'km-KH',
    VND: 'vi-VN',
    IDR: 'id-ID',
    MYR: 'ms-MY',
    PHP: 'en-PH',
    TWD: 'zh-TW',
    MOP: 'zh-MO',
    BND: 'ms-BN',
    FJD: 'en-FJ',
    PGK: 'en-PG',
    SBD: 'en-SB',
    VUV: 'en-VU',
    WST: 'en-WS',
    TOP: 'to-TO',
    XPF: 'fr-PF',
    CFP: 'fr-PF',
    NIO: 'es-NI',
    GTQ: 'es-GT',
    HNL: 'es-HN',
    SVC: 'es-SV',
    PAB: 'es-PA',
    CRC: 'es-CR',
    DOP: 'es-DO',
    HTG: 'ht-HT',
    CUP: 'es-CU',
    CUC: 'es-CU',
    BIF: 'rn-BI',
    RWF: 'rw-RW'
  }
  
  return locales[currency] || 'en-US'
}

/**
 * Convert currency amount
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @param {number} exchangeRate - Exchange rate
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRate) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 0
  if (fromCurrency === toCurrency) return amount
  if (!exchangeRate || isNaN(exchangeRate)) return 0
  
  return amount * exchangeRate
}

/**
 * Get currency precision
 * @param {string} currency - Currency code
 * @returns {number} Number of decimal places
 */
export const getCurrencyPrecision = (currency) => {
  const precision = {
    USD: 2,
    EUR: 2,
    GBP: 2,
    JPY: 0,
    CAD: 2,
    AUD: 2,
    CHF: 2,
    CNY: 2,
    SEK: 2,
    NOK: 2,
    DKK: 2,
    PLN: 2,
    CZK: 2,
    HUF: 2,
    RUB: 2,
    BRL: 2,
    INR: 2,
    KRW: 0,
    SGD: 2,
    HKD: 2,
    NZD: 2,
    MXN: 2,
    ZAR: 2,
    TRY: 2,
    ILS: 2,
    AED: 2,
    SAR: 2,
    QAR: 2,
    KWD: 3,
    BHD: 3,
    OMR: 3,
    JOD: 3,
    LBP: 2,
    EGP: 2,
    MAD: 2,
    TND: 3,
    DZD: 2,
    LYD: 3,
    SDG: 2,
    ETB: 2,
    KES: 2,
    UGX: 0,
    TZS: 2,
    ZMW: 2,
    BWP: 2,
    SZL: 2,
    LSL: 2,
    NAD: 2,
    MUR: 2,
    SCR: 2,
    KMF: 0,
    DJF: 0,
    ERN: 2,
    SOS: 2,
    TTD: 2,
    BBD: 2,
    BZD: 2,
    JMD: 2,
    XCD: 2,
    AWG: 2,
    BMD: 2,
    KYD: 2,
    FKP: 2,
    GIP: 2,
    SHP: 2,
    GGP: 2,
    JEP: 2,
    IMP: 2,
    VEF: 2,
    VES: 2,
    COP: 2,
    CLP: 0,
    ARS: 2,
    UYU: 2,
    PYG: 0,
    BOB: 2,
    PEN: 2,
    GYD: 2,
    SRD: 2,
    BGN: 2,
    RON: 2,
    HRK: 2,
    RSD: 2,
    MKD: 2,
    ALL: 2,
    BAM: 2,
    MDL: 2,
    UAH: 2,
    BYN: 2,
    GEL: 2,
    AMD: 2,
    AZN: 2,
    KZT: 2,
    KGS: 2,
    TJS: 2,
    TMT: 2,
    UZS: 2,
    AFN: 2,
    PKR: 2,
    LKR: 2,
    NPR: 2,
    BDT: 2,
    BTN: 2,
    MVR: 2,
    MMK: 2,
    THB: 2,
    LAK: 2,
    KHR: 2,
    VND: 0,
    IDR: 2,
    MYR: 2,
    PHP: 2,
    TWD: 2,
    MOP: 2,
    BND: 2,
    FJD: 2,
    PGK: 2,
    SBD: 2,
    VUV: 0,
    WST: 2,
    TOP: 2,
    XPF: 0,
    CFP: 0,
    NIO: 2,
    GTQ: 2,
    HNL: 2,
    SVC: 2,
    PAB: 2,
    CRC: 2,
    DOP: 2,
    HTG: 2,
    CUP: 2,
    CUC: 2,
    BIF: 0,
    RWF: 0
  }
  
  return precision[currency] || 2
}

/**
 * Format currency with precision
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency with correct precision
 */
export const formatCurrencyWithPrecision = (amount, currency) => {
  const precision = getCurrencyPrecision(currency)
  const symbol = getCurrencySymbol(currency)
  const locale = getCurrencyLocale(currency)
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(amount)
}

/**
 * Get currency info
 * @param {string} currency - Currency code
 * @returns {object} Currency information
 */
export const getCurrencyInfo = (currency) => {
  return {
    code: currency,
    symbol: getCurrencySymbol(currency),
    name: getCurrencyName(currency),
    locale: getCurrencyLocale(currency),
    precision: getCurrencyPrecision(currency)
  }
}

/**
 * Get all supported currencies
 * @returns {Array} Array of supported currencies
 */
export const getSupportedCurrencies = () => {
  return Object.keys(getCurrencySymbol('USD')).map(currency => ({
    code: currency,
    symbol: getCurrencySymbol(currency),
    name: getCurrencyName(currency),
    locale: getCurrencyLocale(currency),
    precision: getCurrencyPrecision(currency)
  }))
}

/**
 * Check if currency is supported
 * @param {string} currency - Currency code
 * @returns {boolean} True if currency is supported
 */
export const isCurrencySupported = (currency) => {
  return getCurrencySymbol(currency) !== currency
}

/**
 * Get currency constants
 */
export const CURRENCY_CONSTANTS = {
  MAJOR_CURRENCIES: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
  CRYPTO_CURRENCIES: ['BTC', 'ETH', 'LTC', 'XRP', 'BCH', 'ADA', 'DOT', 'LINK'],
  PRECISION: {
    ZERO: 0,
    TWO: 2,
    THREE: 3
  },
  SYMBOLS: {
    DOLLAR: '$',
    EURO: '€',
    POUND: '£',
    YEN: '¥',
    WON: '₩',
    RUPEE: '₹',
    RUBLE: '₽',
    LIRA: '₺',
    SHEKEL: '₪',
    DIRHAM: 'د.إ',
    RIYAL: '﷼',
    DINAR: 'د.ك',
    POUND_SYMBOL: '£',
    FRANC: 'CHF',
    KRONA: 'kr',
    ZLOTY: 'zł',
    KORUNA: 'Kč',
    FORINT: 'Ft',
    REAL: 'R$',
    RAND: 'R',
    PESO: '$',
    SOL: 'S/',
    BOLIVIANO: 'Bs',
    GUARANI: '₲',
    LEV: 'лв',
    LEU: 'lei',
    KUNA: 'kn',
    DINAR_SYMBOL: 'дин',
    DENAR: 'ден',
    LEK: 'L',
    MARK: 'КМ',
    HRYVNIA: '₴',
    LARI: '₾',
    DRAM: '֏',
    MANAT: '₼',
    TENGE: '₸',
    SOM: 'сом',
    SOMONI: 'SM',
    AFGHANI: '؋',
    TAKA: '৳',
    NGULTRUM: 'Nu.',
    RUFIYAA: 'ރ',
    KYAT: 'K',
    BAHT: '฿',
    KIP: '₭',
    RIEL: '៛',
    DONG: '₫',
    RUPIAH: 'Rp',
    RINGGIT: 'RM',
    PESO_PH: '₱',
    PATACA: 'MOP$',
    DOLLAR_BR: 'B$',
    KINA: 'K',
    VATU: 'Vt',
    TALA: 'WS$',
    PAANGA: 'T$',
    CORDOVA: 'C$',
    QUETZAL: 'Q',
    LEMPIRA: 'L',
    COLON: '₡',
    BALBOA: 'B/.',
    GOURDE: 'G',
    FRANC_CF: 'CF',
    FRANC_DJ: 'Fdj',
    NAKFA: 'Nfk',
    SHILLING_SO: 'S',
    DOLLAR_TT: 'TT$',
    DOLLAR_BB: 'Bds$',
    DOLLAR_BZ: 'BZ$',
    DOLLAR_JM: 'J$',
    DOLLAR_EC: 'EC$',
    FLORIN: 'ƒ',
    DOLLAR_BD: 'BD$',
    DOLLAR_CI: 'CI$',
    POUND_FK: '£',
    POUND_GI: '£',
    POUND_SH: '£',
    POUND_GG: '£',
    POUND_JE: '£',
    POUND_IM: '£',
    BOLIVAR: 'Bs',
    BOLIVAR_S: 'Bs.S',
    PESO_CO: '$',
    PESO_CL: '$',
    PESO_AR: '$',
    PESO_UY: '$U',
    PESO_DO: 'RD$',
    PESO_CU: '$',
    PESO_CUC: '$',
    FRANC_BU: 'FBu',
    FRANC_RW: 'RF'
  }
}

export default {
  formatCurrency,
  formatCurrencyWithSymbol,
  formatCurrencyAmount,
  parseCurrency,
  getCurrencySymbol,
  getCurrencyName,
  getCurrencyLocale,
  convertCurrency,
  getCurrencyPrecision,
  formatCurrencyWithPrecision,
  getCurrencyInfo,
  getSupportedCurrencies,
  isCurrencySupported,
  CURRENCY_CONSTANTS
}
