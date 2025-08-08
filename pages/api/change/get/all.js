'use client';
import client from "../../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await client
    .from('change')
    .select(`
        id,
        wbs_area (
            id,
            name,
            color
        ),
        responsible_request_id ( name ),
        responsible_approval_id ( name ),
        type,
        item,
        change,
        reasoning,
        impact,
        is_approved,
        status`)
    .order('wbs_area.name', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}