'use client'

import {
  AvatarFallback,
  AvatarImage,
  Avatar as AvatarUI
} from '@terraviva/ui/avatar'
import Image from 'next/image'
import { useState } from 'react'

import NoAvatar from '@/assets/no-avatar.jpg'

interface AvatarProps {
  image?: string | null
  alt?: string | null
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ image, alt, className }) => {
  const [imageError, setImageError] = useState(false)
  const avatarUrl = getAvatarUrl(image)
  const shouldUseFallback = !image || imageError

  return (
    <AvatarUI className={className}>
      {!shouldUseFallback && (
        <AvatarImage
          className="object-cover"
          src={avatarUrl}
          alt={alt || 'Avatar'}
          onError={() => setImageError(true)}
        />
      )}
      <AvatarFallback>
        <Image
          fill
          src={NoAvatar}
          alt={alt || 'Avatar'}
          className="object-cover"
          priority={shouldUseFallback}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </AvatarFallback>
    </AvatarUI>
  )
}

export function getAvatarUrl(avatarPath?: string | null): string {
  if (!avatarPath) {
    return NoAvatar as unknown as string
  }

  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }

  const assetsUrl =
    process.env.NEXT_PUBLIC_ASSETS_URL || 'https://megtv2.blob.core.windows.net'

  const cleanAvatarPath = avatarPath.startsWith('/')
    ? avatarPath.slice(1)
    : avatarPath

  const cleanAssetsUrl = assetsUrl.endsWith('/')
    ? assetsUrl.slice(0, -1)
    : assetsUrl

  return `${cleanAssetsUrl}/public/avatars/${cleanAvatarPath}`
}

export default Avatar
