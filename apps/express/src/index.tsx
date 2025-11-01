import { randomUUID } from 'node:crypto'
import { spawn } from 'child_process'
import { prisma } from '@terraviva/database-pft'
import express from 'express'

import produtosBaseJson from './data/produtos-base.json'
import { client, conjuntosComerciaisSchema } from './typesense'
import { mapConjuntoToTypesense } from './typesense/typesense'

const app = express()

app.use((req, res, next) => {
  req.setTimeout(1000000) // 5 minutes
  res.setTimeout(1000000) // 5 minutes
  next()
})

app.get('/seed/:data', async (req, res) => {
  const { data } = req.params

  console.log(data)

  if (data === 'base') {
    await prisma.produtoBase.deleteMany({})

    for (const produtoBase of produtosBaseJson) {
      await prisma.produtoBase.create({
        data: {
          id: randomUUID(),
          slug: produtoBase.id,
          descricao: produtoBase.descricao,
          tipoProduto: produtoBase.tipo_produto,
          produtoBase: produtoBase.produto_base,
          createdAt: new Date()
        }
      })
    }

    return res.json({ message: 'Seeded produtos base' })
  }

  if (data === 'conjuntos') {
    const child = spawn('tsx', ['./src/seed-conjuntos.ts'], { stdio: 'pipe' })

    child.stdout.on('data', data => {
      console.log('Seeding progress:', data.toString().trim())
    })

    child.stderr.on('data', data => {
      console.error('Seeding error:', data.toString().trim())
    })

    child.on('close', code => {
      console.log('Seeding child exited with code', code)
    })

    return res.json({
      message: 'Seeding conjuntos comerciais started in background'
    })
  }

  if (data === 'typesense') {
    const conjunto = await prisma.conjuntoComercial.findMany({
      include: { produtoBase: true }
    })

    const parsedConjuntos = conjunto.map(mapConjuntoToTypesense)

    try {
      await client.collections().create(conjuntosComerciaisSchema)
    } catch (error) {
      // Collection might already exist, ignore
    }

    await client
      .collections('conjuntos_comerciais')
      .documents()
      .import(parsedConjuntos, {
        action: 'upsert'
      })

    return res.json({ message: 'Seeded typesense comerciais' })
  }

  return res.json({ error: 'Invalid seed route', status: 404 })
})

const PORT = 3001

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

export default app
