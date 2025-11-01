import { Badge } from '@terraviva/ui/badge'
import { Icon } from '@terraviva/ui/icon'
import Link from 'next/link'

interface GenericScreenProps {
  icon: string
  color?: 'danger' | 'success' | 'warning'
  title?: string
  message?: string
  hrefTitle?: string
  href?: string
  code?: string
}

export const GenericScreen = ({
  icon,
  message,
  title,
  color,
  hrefTitle,
  href,
  code
}: GenericScreenProps) => {
  const isExternalHref = href?.includes('http') || href?.includes('https')

  return (
    <div className="absolute top-0 left-0 w-full h-screen flex flex-1 flex-col items-center justify-center gap-6">
      <Icon
        icon={icon}
        className={`text-8xl 
          ${color === 'success' ? 'text-primary-600' : ''}
          ${color === 'danger' ? 'text-red-700' : ''}
          ${color === 'warning' ? 'text-yellow-600' : ''}
        `}
        family="duotone"
      />
      <span
        className={`font-medium text-xl
          ${color === 'success' ? 'text-primary-900' : ''}
          ${color === 'danger' ? 'text-red-900' : ''}
          ${color === 'warning' ? 'text-yellow-900' : ''}
        `}
      >
        {title}
      </span>
      <span className="text-center text-gray-600">{message}</span>
      {href && (
        <Link href={href} target={isExternalHref ? '_blank' : '_self'}>
          <Badge
            variant="outline"
            className="border-0 cursor-pointer text-primary-500"
          >
            {hrefTitle}
            <Icon
              icon={'link'}
              className="text-xs text-primary-500 ml-2"
              family="duotone"
            />
          </Badge>
        </Link>
      )}
      {code && (
        <div className="flex flex-col items-center gap-2 mt-8">
          <span className="text-sm text-gray-600">Código do erro</span>
          <div className="bg-neutral-200 uppercase border-neutral-300 text-neutral-500 text-xs py-1 px-2 border-1 rounded-sm">
            jwt_decrypt
          </div>
        </div>
      )}
    </div>
  )
}

GenericScreen.displayName = 'GenericScreen'
