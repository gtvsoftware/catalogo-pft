import { Input } from '@terraviva/ui/input'
import { useSearchBox } from 'react-instantsearch'

export function CustomSearch() {
  const { query, refine } = useSearchBox()

  return (
    <Input
      type="search"
      value={query}
      onChange={e => refine(e.target.value)}
      placeholder="Buscar produtos..."
      className="form-control"
    />
  )
}
