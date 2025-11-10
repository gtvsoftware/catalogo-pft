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
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'


import { ImageUpload } from '@/components/ImageUpload'

const serieFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens'
    ),
  grupoId: z.string().min(1, 'Grupo é obrigatório'),
  imagem: z.string().optional()
})

type SerieFormData = z.infer<typeof serieFormSchema>

export default function EditSeriePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<SerieFormData>({
    resolver: zodResolver(serieFormSchema),
    defaultValues: {
      nome: '',
      slug: '',
      grupoId: '',
      imagem: ''
    }
  })

  const { watch, setValue } = form
  const nome = watch('nome')

  
  useEffect(() => {
    if (nome && !form.formState.dirtyFields.slug) {
      const slugified = nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setValue('slug', slugified)
    }
  }, [nome, form.formState.dirtyFields.slug, setValue])

  
  useEffect(() => {
    const fetchSerie = async () => {
      try {
        const response = await fetch(`/api/series/${params.id}`)
        if (!response.ok) {
          throw new Error('Série não encontrada')
        }
        const data = await response.json()

        form.reset({
          nome: data.nome,
          slug: data.slug,
          grupoId: data.grupoId,
          imagem: data.imagem || ''
        })
      } catch (error) {
        toast.error('Erro ao carregar série', {
          description:
            error instanceof Error ? error.message : 'Erro desconhecido'
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchSerie()
    }
  }, [params.id, form])

  const onSubmit = async (data: SerieFormData) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/series/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar série')
      }

      toast.success('Série atualizada com sucesso!', {
        description: `A série "${data.nome}" foi atualizada.`
      })

      router.push('/cadastros/series')
    } catch (error) {
      toast.error('Erro ao atualizar série', {
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
        'Tem certeza que deseja excluir esta série? Esta ação não pode ser desfeita.'
      )
    ) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/series/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir série')
      }

      toast.success('Série excluída com sucesso!', {
        description: 'A série foi removida do sistema.'
      })

      router.push('/cadastros/series')
    } catch (error) {
      toast.error('Erro ao excluir série', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
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
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/cadastros/series')}
          className="mb-4"
        >
          <Icon icon="arrow-left" className="mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="layer-group" className="text-primary-500" />
            Editar Série
          </CardTitle>
          <CardDescription>
            Atualize as informações da série de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* <FormField
                control={form.control}
                name="grupoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo</FormLabel>
                    <FormControl>
                      <GrupoSelect
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Selecione o grupo ao qual esta série pertence
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Série</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Orange Reagan" {...field} />
                      </FormControl>
                      <FormDescription>Nome principal da série</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="orange-reagan" {...field} />
                      </FormControl>
                      <FormDescription>
                        Identificador único (URL-friendly)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem da Série</FormLabel>
                    <FormControl>
                      <ImageUpload
                        slug={watch('slug')}
                        value={field.value}
                        onChange={field.onChange}
                        onRemove={() => field.onChange('')}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Imagem representativa da série (até 5MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  <Icon icon="trash" className="mr-2" />
                  Excluir Série
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/cadastros/series')}
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
