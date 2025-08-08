'use client';
import client from "../../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await client
    .from('raci_item')
    .select(`
        id,
        wbs_item (
            id,
            wbs_area (
                id,
                name
            ),
            name
        ),
        member (
            id,
            name
        ),
        responsibility`)
    .order('wbs_item.wbs_area.name', { ascending: true })
    .order('wbs_item.name', { ascending: true })
    .order('member.name', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}