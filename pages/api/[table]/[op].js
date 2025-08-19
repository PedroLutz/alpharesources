import { createServerClient } from "../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  const { table, op } = req.query
  const body = req.body

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  if (!['create', 'update', 'delete'].includes(op)) {
    return res.status(400).json({ error: 'operação inválida' })
  }

  try {
    let resultado

    console.log(req.body)

    if (op === 'create') {
      const { data, error } = await client.from(table).insert(body)
      if (error) throw error
      resultado = data
    }

    if (op === 'update') {
      const { id, ...campos } = body
      const { data, error } = await client.from(table).update(campos).eq('id', id)
      if (error) throw error
      resultado = data
    }

    if (op === 'delete') {
      const { id } = body
      const { data, error } = await client.from(table).delete().eq('id', id)
      if (error) throw error
      resultado = data
    }

    return res.status(200).json({ success: true, resultado })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}