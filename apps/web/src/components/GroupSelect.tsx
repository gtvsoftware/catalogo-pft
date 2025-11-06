import { typesenseClient } from '@terraviva/typesense-catalogo-pft'
import { ComboboxFormField } from '@terraviva/ui/form-fields'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function GrupoSelect() {
  const [grupos, setGrupos] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  const { control, setValue, watch } = useFormContext()

  async function fetchGrupos() {
    const res = await typesenseClient.collections('grupos').documents().search({
      q: '*',
      query_by: 'nome',
      per_page: 250,
      sort_by: 'nome:asc'
    })

    return res.hits?.map((h: any) => ({
      value: h.document.id,
      label: h.document.nome
    }))
  }

  useEffect(() => {
    fetchGrupos().then(data => {
      setGrupos(data || [])
      setLoading(false)
    })
  }, [])

  const grupo = watch('grupo')

  useEffect(() => {
    setValue('serie', null)
  }, [grupo])

  return (
    <div className="w-full">
      <ComboboxFormField
        name="grupo"
        control={control}
        comboboxProps={{
          className: 'w-full flex items-center justify-between pr-0',
          options: grupos,
          placeholder: loading ? 'Carregando...' : 'Selecione um grupo'
        }}
      />
    </div>
  )
}
