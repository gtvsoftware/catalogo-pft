import type { Table } from '@tanstack/react-table'

import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Icon } from '../icon'

export interface DataTableInputFilterProps<DataT = any> {
  table: Table<DataT>
  globalFilterValue: string
}

export const DataTableInputFilter = <DataT,>({
  table,
  globalFilterValue
}: DataTableInputFilterProps<DataT>) => {
  return (
    <div className="flex items-center gap-4 pl-2 border rounded-md min-w-96">
      <div className="flex items-center w-full">
        <Icon icon="magnifying-glass" className="w-4 h-4 text-gray-800" />
        <Input
          placeholder="Buscar"
          value={globalFilterValue}
          onChange={event => table.setGlobalFilter(event.target.value)}
          className="border-none ring-0 ring-inset ring-transparent outline-hidden focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {globalFilterValue && (
        <Button
          variant="ghost"
          onClick={() => table.setGlobalFilter('')}
          className="p-2 px-3 rounded-l-none"
        >
          <Icon icon="x" className="w-4 h-4 text-red-500" />
        </Button>
      )}
    </div>
  )
}
