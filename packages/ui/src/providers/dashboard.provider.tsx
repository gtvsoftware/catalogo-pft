import { Header } from '../components/ui/header';
import { Footer } from '../components/ui/footer';
import type { AppConfigProps } from '../types';

interface DashboardProviderProps extends React.PropsWithChildren {
  appConfig: AppConfigProps
}


export async function DashboardProvider({ children, appConfig }: DashboardProviderProps) {
  return (
    <main className='flex flex-col h-[100svh]'> 
      <Header appConfig={appConfig} />
      <section className='flex flex-1 px-4 md:px-8'>
        {children}
      </section>
      <Footer appConfig={appConfig} />
    </main>
  )
}