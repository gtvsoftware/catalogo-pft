import { Badge } from '@terraviva/ui/badge'
import { cn } from '@terraviva/ui/cn'
import { Icon } from '@terraviva/ui/icon'
import type { Hit } from 'instantsearch.js'
import Image from 'next/image'
import { useState } from 'react'
import { Highlight } from 'react-instantsearch'

import { getColorBadgeClass } from '@/utils/getColorBadgeClass'

interface ProductCardProps {
  item: Hit<any>
  onClick: () => void
}

export function ProductItemList({ item, onClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      key={item.id}
      className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
      onClick={onClick}
    >
      <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
        {item.imagem && !imageError ? (
          <Image
            fill
            src={item.imagem}
            alt={item.descricaoCompleta || 'Produto'}
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <Icon icon="image-slash" variant="light" className="w-6 h-6" />
          </div>
        )}

        {item.tingida && (
          <Badge className="absolute top-1 right-1 px-1.5 py-0 text-[9px] bg-purple-500 border-0">
            Tingida
          </Badge>
        )}
        {!item.ativo && (
          <Badge className="absolute top-1 left-1 px-1.5 py-0 text-[9px] bg-gray-500 border-0">
            Inativo
          </Badge>
        )}
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <Highlight
          className="text-sm text-gray-900 line-clamp-2 flex-1"
          hit={item}
          attribute="descricaoCompleta"
          highlightedTagName="mark"
        />

        {item.cor && (
          <Badge
            variant="outline"
            className={cn(
              getColorBadgeClass(item.cor),
              'text-[10px] px-2 py-0.5 rounded-md font-medium flex-shrink-0'
            )}
          >
            {item.cor}
          </Badge>
        )}
      </div>

      <Icon
        icon="chevron-right"
        className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0"
      />
    </div>
  )
}
