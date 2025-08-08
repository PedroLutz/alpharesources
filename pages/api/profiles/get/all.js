'use client';
import client from "../../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await client
    .from('profiles')
    .select(`
        id,
        editor_id,
        is_editor`)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}