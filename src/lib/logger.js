const isDev = import.meta.env.DEV
export const log = (...args) => isDev && console.log(...args)
export const logError = (...args) => isDev && console.error(...args)
