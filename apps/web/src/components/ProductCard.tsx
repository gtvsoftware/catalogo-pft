import { Badge } from '@terraviva/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@terraviva/ui/card'
import { Icon } from '@terraviva/ui/icon'
import type { Hit } from 'instantsearch.js'
import Image from 'next/image'
import { useState } from 'react'
import { Highlight } from 'react-instantsearch'

interface ProductCardProps {
  item: Hit<any>
}

export function ProductCard({ item }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  const getActualColor = (cor: string | null): string => {
    if (!cor) return '#9CA3AF'

    const colorMap: Record<string, string> = {
      Amarelo: '#FCD34D',
      Laranja: '#FB923C',
      Vermelho: '#EF4444',
      Rosa: '#EC4899',
      Roxo: '#A855F7',
      Azul: '#3B82F6',
      Branco: '#FFFFFF',
      Verde: '#10B981',
      Preto: '#000000',
      Salmao: '#FFA07A',
      Champanhe: '#FAD6A5'
    }
    return colorMap[cor] || '#9CA3AF'
  }

  const isVariada = (cor: string | null): boolean => {
    return cor?.toLowerCase() === 'variada'
  }

  console.log(item)

  return (
    <Card
      key={item.id}
      className="overflow-hidden hover:shadow-lg transition-shadow pt-0"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gradient-to-br bg-gray-50 flex items-center justify-center relative overflow-hidden">
        {item.imagem && !imageError ? (
          <Image
            preload
            fill
            src={item.imagem}
            alt={item.descricaoCompleta || 'Produto'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
            <Icon icon="image-slash" className="w-16 h-16" />
            <span className="text-sm font-medium">
              {imageError ? 'Imagem não encontrada' : 'Sem imagem'}
            </span>
          </div>
        )}
        {!item.ativo && (
          <Badge className="absolute top-2 left-2 bg-gray-500">Inativo</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-base line-clamp-2">
          <Highlight
            hit={item}
            attribute="descricaoCompleta"
            highlightedTagName="mark"
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Color Circle with Label */}
        {item.cor && (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-border flex items-center justify-center"
              style={
                isVariada(item.cor)
                  ? {
                      background:
                        'linear-gradient(135deg, #EF4444 0%, #FB923C 20%, #FCD34D 40%, #10B981 60%, #3B82F6 80%, #A855F7 100%)'
                    }
                  : { backgroundColor: getActualColor(item.cor) }
              }
            >
              {item.tingida && (
                <Icon
                  icon="eye-dropper"
                  className="w-4 h-4 text-white drop-shadow text-[8px]"
                />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {item.tingida ? 'Tingida' : ''} {item.cor}
            </span>
          </div>
        )}

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
