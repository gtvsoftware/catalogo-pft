const appUrlFromEnv = process.env.NEXT_PUBLIC_APP_URL
const basePathFromEnv = process.env.NEXT_PUBLIC_BASE_PATH
const authUrlFromEnv = process.env.AUTH_URL as string

const fullUrlFromEnv =
  basePathFromEnv !== undefined
    ? `${appUrlFromEnv}${basePathFromEnv}`
    : appUrlFromEnv

export { appUrlFromEnv, basePathFromEnv, authUrlFromEnv, fullUrlFromEnv }
