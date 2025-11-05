import type { ConfigurationOptions } from "typesense/lib/Typesense/Configuration"

export function assembleTypesenseServerConfig() {
  const TYPESENSE_SERVER_CONFIG: ConfigurationOptions = {
    apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY!,
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
        port: Number(process.env.NEXT_PUBLIC_TYPESENSE_PORT),
        protocol: 'https',
        path: '/typesense'
      }
    ],
    numRetries: 8,
    connectionTimeoutSeconds: 1
  }

  return TYPESENSE_SERVER_CONFIG
}
