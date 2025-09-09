'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  const { data, error } = await client
    .from('financial_release')
    .select(`
        id,
        type,
        description,
        value,
        date,
        wbs_area (
            id,
            name
        ),
        origin,
        destination`)
    .order('date', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}