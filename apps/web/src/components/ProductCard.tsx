import { Badge } from '@terraviva/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@terraviva/ui/card'
import { Icon } from '@terraviva/ui/icon'
import type { Hit } from 'instantsearch.js'
import { Highlight } from 'react-instantsearch'

interface ProductCardProps {
  item: Hit<any>
}

export function ProductCard({ item }: ProductCardProps) {
  const getColorBadgeClass = (cor: string | null): string => {
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

  return (
    <Card
      key={item.id}
      className="overflow-hidden hover:shadow-lg transition-shadow pt-0"
    >
      {/* Placeholder Image */}
      <div className="aspect-square bg-gradient-to-br from-green-100 to-pink-100 flex items-center justify-center relative">
        <Icon icon="flower" className="w-20 h-20 text-green-300" />
        {item.tingida && (
          <Badge className="absolute top-2 right-2 bg-purple-500">
            Tingida
          </Badge>
        )}
        {!item.ativo && (
          <Badge className="absolute top-2 left-2 bg-gray-500">Inativo</Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-base line-clamp-2">
          <Highlight
            hit={item}
            attribute="descricaoCompleta"
            highlightedTagName="mark"
          />
        </CardTitle>
        {item.codigoVeiling && (
          <CardDescription className="text-xs font-mono">
            {item.codigoVeiling}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Color Badge */}
        {item.cor && (
          <Badge variant="outline" className={getColorBadgeClass(item.cor)}>
            {item.cor}
          </Badge>
        )}

        {/* Details */}
        <div className="space-y-1 text-xs text-gray-600">
          {item.numeroPote && (
            <div className="flex justify-between">
              <span className="font-medium">Pote:</span>
              <span>{item.numeroPote}</span>
            </div>
          )}
          {item.alturaCm && (
            <div className="flex justify-between">
              <span className="font-medium">Altura:</span>
              <span>{item.alturaCm} cm</span>
            </div>
          )}
          {item.diametroFlorCm && (
            <div className="flex justify-between">
              <span className="font-medium">Diâmetro:</span>
              <span>{item.diametroFlorCm} cm</span>
            </div>
          )}
          {item.numeroHashtes && (
            <div className="flex justify-between">
              <span className="font-medium">Hastes:</span>
              <span>{item.numeroHashtes}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {item.precoVendaSugerido > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-semibold text-green-600">
              R$ {(item.precoVendaSugerido / 100).toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
