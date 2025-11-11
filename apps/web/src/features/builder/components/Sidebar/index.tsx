import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@terraviva/ui/accordion'
import { Button } from '@terraviva/ui/button'
import { Icon } from '@terraviva/ui/icon'

import { useCatalogBuilder } from '../../providers/CatalogBuilderContext'
import { Availability } from './Availability'
import { BasicInfo } from './BasicInfo'
import { ContactCallback } from './ContactCallback'
import { InternalSharing } from './InternalSharing'
import { SharingLinks } from './SharingLinks'

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, viewMode } = useCatalogBuilder()

  return (
    <div
      className={`
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:static inset-y-0 right-0 z-40
          w-full sm:w-96 bg-white border-l flex flex-col
          ${viewMode === 'preview' ? 'hidden lg:hidden' : ''}
        `}
    >
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Editor</h2>
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
          <Icon icon="x" className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col pb-24 px-0">
        <Accordion
          type="single"
          collapsible
          defaultValue="basic-info"
          className="w-full"
        >
          <AccordionItem value="basic-info" className="border-b">
            <AccordionTrigger className="hover:no-underline py-4 px-4">
              <div className="flex items-center gap-2">
                <Icon icon="file" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Informações Básicas
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <BasicInfo />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="sharing-links" className="border-b">
            <AccordionTrigger className="hover:no-underline py-4 px-4">
              <div className="flex items-center gap-2">
                <Icon icon="link" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Links de Compartilhamento
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <SharingLinks />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="contact-info" className="border-b">
            <AccordionTrigger className="hover:no-underline py-4 px-4">
              <div className="flex items-center gap-2">
                <Icon icon="phone" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Informações de Contato
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ContactCallback />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="availability" className="border-b">
            <AccordionTrigger className="hover:no-underline py-4 px-4">
              <div className="flex items-center gap-2">
                <Icon icon="calendar" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Período de Disponibilidade
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Availability />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="internal-sharing" className="border-b">
            <AccordionTrigger className="hover:no-underline py-4 px-4">
              <div className="flex items-center gap-2">
                <Icon icon="lock" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Compartilhamento interno
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <InternalSharing />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
