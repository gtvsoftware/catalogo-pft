declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_APP_URL: string
      NEXT_PUBLIC_BASE_PATH: string
      AUTH_SECRET: string
      AUTH_CLIENT_ID: string
      AUTH_CLIENT_SECRET: string
      AUTH_ISSUER_URL: string
    }
  }
}
// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
