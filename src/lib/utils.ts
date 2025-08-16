import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
}

export function formatDate(
  date: string | Date,
  locale = 'fr-FR',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

export function formatRelativeTime(
  date: string | Date,
  locale = 'fr-FR'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  
  const diffInSeconds = (dateObj.getTime() - Date.now()) / 1000
  const diffInMinutes = diffInSeconds / 60
  const diffInHours = diffInMinutes / 60
  const diffInDays = diffInHours / 24
  const diffInWeeks = diffInDays / 7
  const diffInMonths = diffInDays / 30
  const diffInYears = diffInDays / 365

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(Math.round(diffInSeconds), 'second')
  } else if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(Math.round(diffInMinutes), 'minute')
  } else if (Math.abs(diffInHours) < 24) {
    return rtf.format(Math.round(diffInHours), 'hour')
  } else if (Math.abs(diffInDays) < 7) {
    return rtf.format(Math.round(diffInDays), 'day')
  } else if (Math.abs(diffInWeeks) < 4) {
    return rtf.format(Math.round(diffInWeeks), 'week')
  } else if (Math.abs(diffInMonths) < 12) {
    return rtf.format(Math.round(diffInMonths), 'month')
  } else {
    return rtf.format(Math.round(diffInYears), 'year')
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function generateSearchParams(
  params: Record<string, string | number | boolean | null | undefined>
): URLSearchParams {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.set(key, value.toString())
    }
  })
  
  return searchParams
}

export function parseSearchParams(
  searchParams: URLSearchParams | string
): Record<string, string> {
  const params = typeof searchParams === 'string' 
    ? new URLSearchParams(searchParams)
    : searchParams
  
  const result: Record<string, string> = {}
  
  params.forEach((value, key) => {
    result[key] = value
  })
  
  return result
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function removeEmptyValues<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      result[key as keyof T] = value as T[keyof T]
    }
  }
  
  return result
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

export function arrayToMap<T, K extends keyof T>(
  array: T[],
  key: K
): Map<T[K], T> {
  return new Map(array.map(item => [item[key], item]))
}

export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => array2.includes(item))
}

export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item))
}

export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be positive')
  
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}

export function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Array cannot be empty')
  }
  return array[Math.floor(Math.random() * array.length)]!
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

export interface CourseGradientData {
  gradient_from_light?: string;
  gradient_to_light?: string;
  gradient_from_dark?: string;
  gradient_to_dark?: string;
  on_light?: string;
  on_dark?: string;
}

export function getCourseGradientStyles(courseData: CourseGradientData) {
  const hasLightGradient = courseData.gradient_from_light && courseData.gradient_to_light;
  const hasDarkGradient = courseData.gradient_from_dark && courseData.gradient_to_dark;
  
  if (!hasLightGradient && !hasDarkGradient) {
    return {
      backgroundStyle: {},
      textColorClasses: '',
      hasGradient: false
    };
  }

  const lightGradient = hasLightGradient 
    ? `linear-gradient(135deg, ${courseData.gradient_from_light} 0%, ${courseData.gradient_to_light} 100%)`
    : '';
    
  const darkGradient = hasDarkGradient
    ? `linear-gradient(135deg, ${courseData.gradient_from_dark} 0%, ${courseData.gradient_to_dark} 100%)`
    : '';

  const backgroundStyle: React.CSSProperties = {
    ...(hasLightGradient && {
      '--gradient-light': lightGradient,
    }),
    ...(hasDarkGradient && {
      '--gradient-dark': darkGradient,
    }),
  };

  const lightTextColor = courseData.on_light || '';
  const darkTextColor = courseData.on_dark || '';
  
  const textColorClasses = [
    lightTextColor ? `[color:${lightTextColor}]` : '',
    darkTextColor ? `dark:[color:${darkTextColor}]` : ''
  ].filter(Boolean).join(' ');

  return {
    backgroundStyle,
    textColorClasses,
    hasGradient: true,
    lightGradient: hasLightGradient,
    darkGradient: hasDarkGradient
  };
}

export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}