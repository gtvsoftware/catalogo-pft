import { IconName } from '@/components/ui/icon/iconTypes'
import { StaticImageData } from 'next/image'

export type HeaderSection = {
  title: string
  iconClassName?: string
  icon?: IconName
  items: HeaderSubitem[]
}

export type HeaderItem = {
  value: string
  label: string
  path: string
  icon: IconName
  security: string
  items?: HeaderSubitem[]
  sections?: HeaderSection[]
}

export type HeaderSubitem = {
  value: string
  label: string
  icon: IconName
  path: string
  description: string
  iconClassName?: string
}

export interface AppConfigProps {
  basePath?: string
  environment: 'homolog' | string

  // APP GENERAL
  APP_LOGO: StaticImageData
  APP_TITLE: string
  APP_DESCRIPTION?: string
  APP_ENV?: string
  APP_URL: string
  APP_BASE_PATH?: string
  APP_FULL_URL: string
  APP_SESSION_COOKIE_NAME: string
  APP_HOME_URL: string

  // PORTAL
  PORTAL_URL?: string

  // APP OPTIONS
  IS_MOBILE_COMPATIBLE?: boolean
  BOTTOM_BAR_ENABLED?: boolean
  DRAWER_ENABLED?: boolean
  NOTIFICATIONS_ENABLED?: boolean
  SEARCHBAR_ENABLED?: boolean
  THEME_TOGGLE_ENABLED?: boolean

  // SHARED
  ACCOUNT_APP_URL?: string

  // ASSETS
  AVATARS_URL: string

  // AUTHJS
  AUTH_SECRET: string
  AUTH_URL: string
  AUTH_CLIENT_ID: string
  AUTH_ALLOWED_CALLBACK_URLS: string
  AUTH_CLIENT_SECRET: string
  AUTH_ISSUER_URL: string

  TV_LOGO: StaticImageData
  FOOTER_ITEMS?: any
  FOOTER_TITLE: string
  // SERVICES
  SERVICE_URL?: string
  NAVBAR_ITEMS?: () => Promise<HeaderItem[]>
  APP_LIST_ITEMS?: (environment: string) => Promise<any[]>
  APP_USER_MENU_ITEMS?: () => Promise<any[]>
  BOTTOM_BAR_ITEMS?: () => Promise<any[]>
}
