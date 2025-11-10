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
import { SelectFormField } from '@terraviva/ui/form-fields'
import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { Skeleton } from '@terraviva/ui/skeleton'
import { toast } from '@terraviva/ui/sonner'
import { Textarea } from '@terraviva/ui/textarea'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { ImageUpload } from '@/components/ImageUpload'

const grupoFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens'
    ),
  tipoProduto: z.enum(['FLOR', 'PLANTA'], {
    required_error: 'Tipo de produto é obrigatório'
  }),
  status: z.enum(['ATIVO', 'INATIVO'], {
    required_error: 'Status é obrigatório'
  }),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  imagem: z.string().optional()
})

type GrupoFormData = z.infer<typeof grupoFormSchema>

export default function EditGrupoPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<GrupoFormData>({
    resolver: zodResolver(grupoFormSchema),
    defaultValues: {
      nome: '',
      slug: '',
      tipoProduto: 'FLOR',
      status: 'ATIVO',
      descricao: '',
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
    const fetchGrupo = async () => {
      try {
        const response = await fetch(`/api/grupos/${params.id}`)
        if (!response.ok) {
          throw new Error('Grupo não encontrado')
        }
        const data = await response.json()

        form.reset({
          nome: data.nome,
          slug: data.slug,
          tipoProduto: data.tipoProduto,
          status: data.status,
          descricao: data.descricao,
          imagem: data.imagem || ''
        })
      } catch (error) {
        toast.error('Erro ao carregar grupo', {
          description:
            error instanceof Error ? error.message : 'Erro desconhecido'
        })
        // router.push('/cadastros/grupos')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchGrupo()
    }
  }, [params.id, form, router, toast])

  const onSubmit = async (data: GrupoFormData) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/grupos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar grupo')
      }

      toast.success('Grupo atualizado com sucesso!', {
        description: `O grupo "${data.nome}" foi atualizado.`
      })

      router.push('/cadastros/grupos')
    } catch (error) {
      toast.error('Erro ao atualizar grupo', {
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
        'Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.'
      )
    ) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/grupos/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir grupo')
      }

      toast.success('Grupo excluído com sucesso!', {
        description: 'O grupo foi removido do sistema.'
      })

      router.push('/cadastros/grupos')
    } catch (error) {
      toast.error('Erro ao excluir grupo', {
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
          onClick={() => router.push('/cadastros/grupos')}
          className="mb-4"
        >
          <Icon icon="arrow-left" className="mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="flower" className="text-primary-500" />
            Editar Grupo
          </CardTitle>
          <CardDescription>
            Atualize as informações do grupo de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Grupo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Crisântemo" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome principal do grupo de produtos
                      </FormDescription>
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
                        <Input placeholder="crisantemo" {...field} />
                      </FormControl>
                      <FormDescription>
                        Identificador único (URL-friendly)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectFormField
                  control={form.control}
                  name="tipoProduto"
                  label="Tipo de Produto"
                  description="Classificação do produto"
                  placeholder="Selecione o tipo"
                  required
                  options={[
                    { value: 'FLOR', label: 'Flor' },
                    { value: 'PLANTA', label: 'Planta' }
                  ]}
                />

                <SelectFormField
                  control={form.control}
                  name="status"
                  label="Status"
                  description="Status do grupo no sistema"
                  placeholder="Selecione o status"
                  required
                  options={[
                    { value: 'ATIVO', label: 'Ativo' },
                    { value: 'INATIVO', label: 'Inativo' }
                  ]}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva as características do grupo..."
                        className="min-h-32 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Informações detalhadas sobre o grupo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem do Grupo</FormLabel>
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
                      Imagem representativa do grupo (até 5MB)
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
                  Excluir Grupo
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/cadastros/grupos')}
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
