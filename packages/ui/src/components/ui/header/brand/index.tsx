import Image from 'next/image'
import Link from 'next/link'

import { AppConfigProps } from '../../../../types/app.config'

interface HeaderBrandProps {
  appConfig: AppConfigProps
}

export function HeaderBrand({ appConfig }: HeaderBrandProps) {
  return (
    <Link href="/" className="min-w-[125px]">
      <div className="flex items-center justify-start gap-3">
        <Image
          src={appConfig.APP_LOGO}
          alt="Logo"
          style={{ objectFit: 'contain' }}
          width={22}
        />
        <p className="font-medium text-sm text-inherit">
          {appConfig?.APP_TITLE}
        </p>
      </div>
    </Link>
  )
}
