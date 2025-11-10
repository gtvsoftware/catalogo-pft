import Image from 'next/image'

import LogoTerraVivaWebP from '@/assets/logo_terraviva.webp'

export function LogoTerraViva() {
  return (
    <div className="py-4 px-4 flex items-center flex-col">
      <Image
        alt="Logo Terra Viva"
        src={LogoTerraVivaWebP}
        width={160}
        className="mb-2"
      />
    </div>
  )
}
