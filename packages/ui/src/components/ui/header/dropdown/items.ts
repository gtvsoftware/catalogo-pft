import academia from './assets/logo-academia.png'
import apontamentos from './assets/logo-apontamentos.png'
import cincoS from './assets/logo-cincoesse.png'
import eventos from './assets/logo-eventos.png'
import megtv from './assets/logo-megtv.png'
import milldesk from './assets/logo-milldesk.png'
import portal from './assets/logo-portal.png'
import outlook from './assets/logo-webmail.png'

export const getAppsList = async (environment: string) => {
  return environment === 'production'
    ? [
        {
          label: 'Portal Viva',
          icon: portal,
          tag: 'portal',
          url: 'https://portal.terraviva.agr.br/'
        },
        {
          label: 'MEGTV',
          icon: megtv,
          tag: 'megtv',
          url: 'https://megtv.terraviva.agr.br/'
        },
        {
          label: '5S',
          icon: cincoS,
          tag: '5s',
          url: 'https://apps.terraviva.agr.br/5s'
        },
        {
          label: 'Apontamentos',
          icon: apontamentos,
          tag: 'apontamentos',
          url: 'https://apps.terraviva.agr.br/apontamentos'
        },
        {
          label: 'Eventos',
          icon: eventos,
          tag: 'eventos',
          url: 'https://apps.terraviva.agr.br/eventos'
        },
        {
          label: 'Outlook',
          icon: outlook,
          tag: 'outlook',
          url: 'https://outlook.office.com/mail/'
        },
        {
          label: 'Milldesk',
          icon: milldesk,
          tag: 'milldesk',
          url: 'https://www.milldesk.com/flex/milldesk/csc/terraviva/'
        },
        {
          label: 'Academia TV',
          icon: academia,
          tag: 'academia',
          url: 'https://academia.terraviva.agr.br/'
        }
      ]
    : [
        {
          label: 'Portal Viva',
          icon: portal,
          tag: 'portal',
          url: 'https://portal.hml.terraviva.agr.br/'
        },
        {
          label: 'MEGTV',
          icon: megtv,
          tag: 'megtv',
          url: 'https://megtv.hml.terraviva.agr.br/'
        },
        {
          label: '5S',
          icon: cincoS,
          tag: '5s',
          url: 'https://apps.hml.terraviva.agr.br/5s'
        },
        {
          label: 'Apontamentos',
          icon: apontamentos,
          tag: 'apontamentos',
          url: 'https://apps.hml.terraviva.agr.br/apontamentos'
        },
        {
          label: 'Eventos',
          icon: eventos,
          tag: 'eventos',
          url: 'https://apps.hml.terraviva.agr.br/eventos'
        },
        {
          label: 'Outlook',
          icon: outlook,
          tag: 'outlook',
          url: 'https://outlook.office.com/mail/'
        },
        {
          label: 'Milldesk',
          icon: milldesk,
          tag: 'milldesk',
          url: 'https://www.milldesk.com/flex/milldesk/csc/terraviva/'
        },
        {
          label: 'Academia TV',
          icon: academia,
          tag: 'academia',
          url: 'https://academia.terraviva.agr.br/'
        }
      ]
}
