'use client';
import client from "../../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await client
    .from('cost_benefit')
    .select(`
        id,
        identification,
        description,
        cost,
        cost_ranking,
        impact,
        urgency,
        explanation`)
    .order('identification', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}