import { randomUUID } from 'node:crypto'

import { spawn } from 'node:child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { prisma } from '@terraviva/database-pft'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import produtosBaseJson from './data/produtos-base.json'
// import { client, conjuntosComerciaisSchema } from './typesense'
// import { mapConjuntoToTypesense } from './typesense/typesense'

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
    const scriptPath = path.join(__dirname, 'seed-conjuntos.ts')
    const isWindows = process.platform === 'win32'

    // Use tsx directly with proper stdio piping
    const command = isWindows ? 'tsx.cmd' : 'tsx'
    const tsxPath = path.join(__dirname, '..', 'node_modules', '.bin', command)

    const child = spawn(tsxPath, [scriptPath], {
      stdio: ['ignore', 'pipe', 'pipe'], // Keep stdout and stderr piped
      shell: isWindows,
      windowsHide: true,
      env: { ...process.env, FORCE_COLOR: '0' } // Disable colors for cleaner output
    })

    console.log(`🚀 Background seeding process started with PID: ${child.pid}`)

    // Capture stdout
    child.stdout?.on('data', (data) => {
      const output = data.toString().trim()
      try {
        const parsed = JSON.parse(output)
        console.log(`[SEED ${parsed.type.toUpperCase()}]:`, parsed.message)
      } catch {
        console.log('[SEED]:', output)
      }
    })

    // Capture stderr
    child.stderr?.on('data', (data) => {
      console.error('[SEED ERROR]:', data.toString().trim())
    })

    // Handle process completion
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Seeding process completed successfully')
      } else {
        console.error(`❌ Seeding process exited with code ${code}`)
      }
    })

    child.on('error', (error) => {
      console.error('❌ Failed to start seeding process:', error.message)
    })

    return res.json({
      message: 'Seeding conjuntos comerciais started in background',
      pid: child.pid
    })
  }

  // if (data === 'typesense') {
  //   const conjunto = await prisma.conjuntoComercial.findMany({
  //     include: { produtoBase: true }
  //   })

  //   const parsedConjuntos = conjunto.map(mapConjuntoToTypesense)

  //   try {
  //     await client.collections().create(conjuntosComerciaisSchema)
  //   } catch (error) {
  //     // Collection might already exist, ignore
  //   }

  //   await client
  //     .collections('conjuntos_comerciais')
  //     .documents()
  //     .import(parsedConjuntos, {
  //       action: 'upsert'
  //     })

  //   return res.json({ message: 'Seeded typesense comerciais' })
  // }

  return res.json({ error: 'Invalid seed route', status: 404 })
})

const PORT = 3001

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

export default app
