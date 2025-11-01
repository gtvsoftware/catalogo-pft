'use server'

import { type Account } from 'next-auth'

/**
 * Interface para os parâmetros da função getTokenFromIssuer
 */
export interface GetTokenFromIssuerProps {
  /** Token de refresh usado para obter um novo access token */
  refresh_token: string
}

/**
 * Renova um token de acesso usando o refresh token através do endpoint OAuth2 do provedor
 * @param params - Objeto contendo o refresh token
 * @returns Promise<Account> - Dados da conta com os novos tokens
 * @throws Error quando as variáveis de ambiente estão faltando
 * @throws Error quando a requisição de refresh falha
 * @throws Error quando a requisição expira
 *
 * @example
 * try {
 *   const newTokens = await getTokenFromIssuer({
 *     refresh_token: 'refresh_token_aqui'
 *   })
 *   console.log('Tokens renovados:', newTokens)
 * } catch (error) {
 *   console.error('Falha ao renovar tokens:', error.message)
 * }
 */
export async function getTokenFromIssuer({
  refresh_token
}: GetTokenFromIssuerProps): Promise<Account> {
  const issuerUrlFromEnv = process.env.AUTH_ISSUER_URL
  const clientIdFromEnv = process.env.AUTH_CLIENT_ID
  const clientSecretFromEnv = process.env.AUTH_CLIENT_SECRET

  if (!issuerUrlFromEnv || !clientIdFromEnv || !clientSecretFromEnv) {
    throw new Error(
      'Variáveis de ambiente obrigatórias faltando para renovação de token'
    )
  }

  const tokenUrl = `${issuerUrlFromEnv}/protocol/openid-connect/token`

  // Cria dados do formulário para o corpo da requisição
  const formData = new URLSearchParams({
    client_id: clientIdFromEnv,
    client_secret: clientSecretFromEnv,
    grant_type: 'refresh_token',
    refresh_token
  })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos de timeout para renovação de token

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.warn('Renovação de token falhou:', response.status, errorText)

      // Parse error response if it's JSON to get more details
      let errorDetails = errorText
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error_description) {
          errorDetails = errorJson.error_description
        }
      } catch {
        // Keep original error text if not JSON
      }

      throw new Error(
        `Token refresh failed: ${errorDetails} (HTTP ${response.status})`
      )
    }

    const data = await response.json()
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('Renovação de token bem-sucedida')

    return data as Account
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('Requisição de renovação de token expirou')
      throw new Error('Token refresh request timeout')
    }

    // Re-throw the original error instead of wrapping it in a generic message
    // This preserves the specific error details for better handling upstream
    throw error
  }
}
