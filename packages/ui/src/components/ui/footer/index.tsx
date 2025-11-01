import Link from 'next/link'

import { AppConfigProps } from '@/types/app.config'
import { cn } from '../../../utils'

interface FooterProps {
  appConfig: AppConfigProps
  maxWidth?: number
  className?: string
}

export function Footer({
  appConfig,
  maxWidth,
  className
}: FooterProps): React.ReactElement {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric'
  })

  const currentYear = parseInt(formatter.format(new Date()), 10)

  return (
    <footer
      className={cn(
        `hidden md:flex items-center justify-center w-full 
        py-4 text-xs border-t border-border text-zinc-500 z-10
        bg-background select-none`,
        className
      )}
    >
      <div
        className="flex justify-between w-full px-4 md:px-8"
        style={{ maxWidth: maxWidth || '100%' }}
      >
        <div className={cn('flex justify-center items-center gap-12')}>
          <p className="">{appConfig?.FOOTER_TITLE}</p>
          <div className="flex gap-12">
            {appConfig?.FOOTER_ITEMS?.map((item: any) => {
              return (
                <Link
                  href={item?.href}
                  key={item?.tag}
                  target="_blank"
                  className="underline"
                >
                  {item?.label}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex gap-1 items-center justify-center">
          <p>© Grupo Terra Viva {currentYear}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
