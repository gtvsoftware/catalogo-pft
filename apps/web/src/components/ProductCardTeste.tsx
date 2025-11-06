import { getColorBadgeClass } from '@/utils/getColorBadgeClass'
import { Badge } from '@terraviva/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@terraviva/ui/card'
import { cn } from '@terraviva/ui/cn'
import { Icon } from '@terraviva/ui/icon'
import type { Hit } from 'instantsearch.js'
import { Highlight } from 'react-instantsearch'

interface ProductCardProps {
  item: Hit<any>
  onClick: () => void
}

export function ProductCardTeste({ item, onClick }: ProductCardProps) {
  return (
    <Card
      key={item.id}
      className="overflow-hidden p-0 h-full cursor-pointer gap-2"
      onClick={onClick}
    >
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

      <CardHeader className="px-2">
        <CardTitle>
          <Highlight
            className="text-xs text-wrap"
            hit={item}
            attribute="descricaoCompleta"
            highlightedTagName="mark"
          />
        </CardTitle>
        {item.codigoVeiling && (
          <CardDescription className="text-[10px] font-mono">
            {item.codigoVeiling}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-2 space-y-2 pb-2">
        {item.cor && (
          <Badge
            variant="outline"
            className={cn(
              getColorBadgeClass(item.cor),
              'text-[10px] rounded-[6px]'
            )}
          >
            {item.cor}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
