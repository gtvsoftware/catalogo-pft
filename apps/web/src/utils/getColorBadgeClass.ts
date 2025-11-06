export const getColorBadgeClass = (cor: string | null): string => {
  if (!cor) return 'bg-gray-100 text-gray-800 border-gray-300'

  const colorMap: Record<string, string> = {
    Amarelo: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Laranja: 'bg-orange-100 text-orange-800 border-orange-300',
    Vermelho: 'bg-red-100 text-red-800 border-red-300',
    Rosa: 'bg-pink-100 text-pink-800 border-pink-300',
    Roxo: 'bg-purple-100 text-purple-800 border-purple-300',
    Azul: 'bg-blue-100 text-blue-800 border-blue-300',
    Branco: 'bg-gray-100 text-gray-800 border-gray-300',
    Verde: 'bg-green-100 text-green-800 border-green-300'
  }

  return colorMap[cor] || 'bg-gray-100 text-gray-800 border-gray-300'
}
