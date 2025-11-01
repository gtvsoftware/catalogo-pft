/**
 * Extrai o domínio raiz de uma URL, removendo qualquer subdomínio
 * @param url - A URL da qual extrair o domínio
 * @returns O domínio raiz sem subdomínios, ou null se a URL for inválida
 *
 * @example
 * getDomainWithoutSubdomain('https://sub.exemplo.com/path') // 'exemplo.com'
 * getDomainWithoutSubdomain('https://sub.sub.exemplo.com/path') // 'exemplo.com'
 * getDomainWithoutSubdomain('https://exemplo.com') // 'exemplo.com'
 * getDomainWithoutSubdomain('https://sub.exemplo.com.br') // 'exemplo.com.br'
 */
export function getDomainWithoutSubdomain(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase()

    // Trata localhost e endereços IP
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return hostname
    }

    const parts = hostname.split('.')

    // Precisa de pelo menos 2 partes para um domínio válido
    if (parts.length < 2) {
      return hostname
    }

    // Trata domínios especiais que requerem 3 partes (como .co.uk, .com.au, etc.)
    const specialTLDs = ['co', 'com', 'org', 'net', 'edu', 'gov', 'mil']
    const secondLastPart = parts[parts.length - 2]

    // Se a penúltima parte for um prefixo de TLD especial, mantém 3 partes
    if (
      secondLastPart &&
      specialTLDs.includes(secondLastPart) &&
      parts.length >= 3
    ) {
      return parts.slice(-3).join('.')
    }

    // Caso contrário, mantém as últimas 2 partes (domínio + TLD)
    return parts.slice(-2).join('.')
  } catch (_error) {
    // Formato de URL inválido
    console.warn('URL inválida fornecida para getDomainWithoutSubdomain:', url)
    return null
  }
}
