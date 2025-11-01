declare namespace NodeJS {
  interface ProcessEnv {
    readonly ENVIRONMENT: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_APP_URL: string;
    readonly AUTH_SECRET: string;
    readonly AUTH_CLIENT_ID: string;
    readonly AUTH_ALLOWED_CALLBACK_URLS: string;
    readonly AUTH_CLIENT_SECRET: string;
    readonly AUTH_ISSUER_URL: string;
  }
}