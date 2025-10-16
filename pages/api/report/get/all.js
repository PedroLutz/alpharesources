'use client'
import { createServerClient } from '../../../../lib/supabaseServerClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { uid, interval_text } = req.body
  const token = req.headers.authorization?.replace('Bearer ', '')
  const client = createServerClient(token)

  // executa tudo em paralelo
  const results = await Promise.all([
    client.rpc('items_completed_recently', { uid, interval_text }),
    client.rpc('items_in_execution', { uid }),
    client.rpc('items_planned_to_start', { uid, interval_text }),
    client.rpc('items_started_recently', { uid, interval_text }),
    client.rpc('opportunity_of_items_in_execution', { uid }),
    client.rpc('threats_of_items_in_execution', { uid })
  ])

  // nomes na mesma ordem das chamadas
  const names = [
    'completed',
    'execution',
    'planned',
    'started',
    'opportunities',
    'threats'
  ]

  // mapeia pra um formato mais legível
  const mapped = results.map((r, i) => ({
    name: names[i],
    data: r.data,
    error: r.error
  }))

  // checa erros
  const errors = mapped.filter(r => r.error)
  if (errors.length > 0) {
    errors.forEach(e =>
      console.error(`erro ao buscar ${e.name}:`, e.error.message)
    )
    return res.status(400).json({
      error: 'ocorreram erros em algumas consultas',
      details: errors.map(e => ({
        name: e.name,
        message: e.error.message
      }))
    })
  }

  // junta todos os dados em um objeto final
  const data = Object.fromEntries(mapped.map(r => [r.name, r.data]))

  return res.status(200).json(data)
}
