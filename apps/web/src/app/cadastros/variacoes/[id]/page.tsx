'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@terraviva/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@terraviva/ui/card'
import { Checkbox } from '@terraviva/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@terraviva/ui/form'
import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { Skeleton } from '@terraviva/ui/skeleton'
import { toast } from '@terraviva/ui/sonner'
import { Textarea } from '@terraviva/ui/textarea'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'


import { SerieSelectSimple } from '@/components/SeriesSelect'

const variacaoFormSchema = z.object({
  variacaoId: z.string().min(1, 'ID da variação é obrigatório'),
  grupoId: z.string().min(1, 'Grupo é obrigatório'),
  serieId: z.string().min(1, 'Série é obrigatória'),
  codigoVeiling: z.string().min(1, 'Código veiling é obrigatório'),
  descricaoComercial: z.string().min(1, 'Descrição comercial é obrigatória'),
  descricaoCompleta: z.string().optional(),
  descricaoOriginal: z.string().optional(),
  variedade: z.string().optional(),
  nivelComercial: z.string().optional(),
  tipoEmbalagem: z.string().optional(),
  embalagemVariedade: z.string().optional(),
  embalagemMaterial: z.string().optional(),
  embalagemFormato: z.string().optional(),
  bulbos: z.string().optional(),
  numeroPote: z.string().optional(),
  numeroHashtes: z.string().optional(),
  numeroFlores: z.string().optional(),
  alturaCm: z.string().optional(),
  diametroFlorCm: z.string().optional(),
  gramas: z.string().optional(),
  litros: z.string().optional(),
  cor: z.string().optional(),
  tingida: z.boolean().default(false),
  precoVendaSugerido: z.number().min(0).default(0),
  ativo: z.boolean().default(true),
  imagens: z.array(z.string()).default([])
})

type VariacaoFormData = z.infer<typeof variacaoFormSchema>

export default function EditVariacaoPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<VariacaoFormData>({
    resolver: zodResolver(variacaoFormSchema),
    defaultValues: {
      variacaoId: '',
      grupoId: '',
      serieId: '',
      codigoVeiling: '',
      descricaoComercial: '',
      descricaoCompleta: '',
      descricaoOriginal: '',
      tingida: false,
      precoVendaSugerido: 0,
      ativo: true,
      imagens: []
    }
  })

  const { watch } = form
  const grupoId = watch('grupoId')

  
  useEffect(() => {
    const fetchVariacao = async () => {
      try {
        const response = await fetch(`/api/variacoes/${params.id}`)
        if (!response.ok) {
          throw new Error('Variação não encontrada')
        }
        const data = await response.json()

        form.reset({
          variacaoId: data.variacaoId,
          grupoId: data.grupoId,
          serieId: data.serieId,
          codigoVeiling: data.codigoVeiling,
          descricaoComercial: data.descricaoComercial,
          descricaoCompleta: data.descricaoCompleta || '',
          descricaoOriginal: data.descricaoOriginal || '',
          variedade: data.variedade || '',
          nivelComercial: data.nivelComercial || '',
          tipoEmbalagem: data.tipoEmbalagem || '',
          embalagemVariedade: data.embalagemVariedade || '',
          embalagemMaterial: data.embalagemMaterial || '',
          embalagemFormato: data.embalagemFormato || '',
          bulbos: data.bulbos || '',
          numeroPote: data.numeroPote || '',
          numeroHashtes: data.numeroHashtes || '',
          numeroFlores: data.numeroFlores || '',
          alturaCm: data.alturaCm || '',
          diametroFlorCm: data.diametroFlorCm || '',
          gramas: data.gramas || '',
          litros: data.litros || '',
          cor: data.cor || '',
          tingida: data.tingida || false,
          precoVendaSugerido: data.precoVendaSugerido || 0,
          ativo: data.ativo !== undefined ? data.ativo : true,
          imagens: data.imagens || []
        })
      } catch (error) {
        toast.error('Erro ao carregar variação', {
          description:
            error instanceof Error ? error.message : 'Erro desconhecido'
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchVariacao()
    }
  }, [params.id, form])

  const onSubmit = async (data: VariacaoFormData) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/variacoes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar variação')
      }

      toast.success('Variação atualizada com sucesso!', {
        description: `A variação foi atualizada.`
      })

      router.push('/cadastros/variacoes')
    } catch (error) {
      toast.error('Erro ao atualizar variação', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        'Tem certeza que deseja excluir esta variação? Esta ação não pode ser desfeita.'
      )
    ) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/variacoes/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir variação')
      }

      toast.success('Variação excluída com sucesso!', {
        description: 'A variação foi removida do sistema.'
      })

      router.push('/cadastros/variacoes')
    } catch (error) {
      toast.error('Erro ao excluir variação', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/cadastros/variacoes')}
          className="mb-4"
        >
          <Icon icon="arrow-left" className="mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="box-isometric-tape" className="text-primary-500" />
            Editar Variação
          </CardTitle>
          <CardDescription>
            Atualize as informações da variação de produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Relacionamentos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Relacionamentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* <FormField
                    control={form.control}
                    name="grupoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupo</FormLabel>
                        <FormControl>
                          <GroupSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={submitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  <FormField
                    control={form.control}
                    name="serieId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Série</FormLabel>
                        <FormControl>
                          <SerieSelectSimple
                            grupoId={grupoId}
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={submitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Identificação */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Identificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="variacaoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID da Variação</FormLabel>
                        <FormControl>
                          <Input placeholder="variacao-id" {...field} />
                        </FormControl>
                        <FormDescription>
                          Identificador único (slug)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="codigoVeiling"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Veiling</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} />
                        </FormControl>
                        <FormDescription>
                          Código do sistema Veiling
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Descrições */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descrições</h3>
                <FormField
                  control={form.control}
                  name="descricaoComercial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Comercial</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Descrição comercial do produto"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricaoCompleta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Completa</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição detalhada..."
                          className="min-h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Características */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Características</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="variedade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variedade</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tingida"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Tingida</FormLabel>
                          <FormDescription>
                            Produto tingido artificialmente
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="numeroPote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Pote</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alturaCm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura (cm)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroHashtes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Hastes</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroFlores"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Flores</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="tipoEmbalagem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Embalagem</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="embalagemMaterial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material Embalagem</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nivelComercial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível Comercial</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Comercial */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Informações Comerciais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="precoVendaSugerido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Sugerido (centavos)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Valor em centavos (ex: 1500 = R$ 15,00)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Ativo</FormLabel>
                          <FormDescription>
                            Produto disponível para venda
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  <Icon icon="trash" className="mr-2" />
                  Excluir Variação
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/cadastros/variacoes')}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Icon icon="spinner" className="mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Icon icon="check" className="mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
