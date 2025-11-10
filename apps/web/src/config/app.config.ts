import type { AppConfigProps } from '@terraviva/ui/types'

import Logo from '@/assets/logo-terraviva.png'




export const APP_CONFIG: AppConfigProps = {
  
  APP_TITLE: 'Catalogo de Vendedores',
  APP_DESCRIPTION: 'Plataforma do Modelo de Excelência em Gestão Terra Viva',
  FOOTER_TITLE: 'Catalogo de Vendedores',
  APP_LOGO: Logo,
  TV_LOGO: Logo,

  
  
  

  
  AVATARS_URL: `${process.env.NEXT_PUBLIC_ASSETS_URL}/public/avatars/`,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  APP_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
  APP_FULL_URL: `${process.env.NEXT_PUBLIC_APP_URL}${process.env.NEXT_PUBLIC_BASE_PATH}`,
  APP_HOME_URL: process.env.NEXT_PUBLIC_BASE_PATH || '/',
  APP_SESSION_COOKIE_NAME: `next-auth.session-token`,
  PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL,
  ACCOUNT_APP_URL: process.env.NEXT_PUBLIC_ACCOUNT_APP_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL ?? 'http://local.dev.terraviva:3000',
  AUTH_CLIENT_ID: process.env.AUTH_CLIENT_ID,
  AUTH_ALLOWED_CALLBACK_URLS: process.env.AUTH_ALLOWED_CALLBACK_URLS,
  AUTH_CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET,
  AUTH_ISSUER_URL: process.env.AUTH_ISSUER_URL,
  SERVICE_URL: process.env.NEXT_PUBLIC_SERVICE_URL,
  environment: process.env.ENVIRONMENT
}
