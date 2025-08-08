'use client';
import client from "../../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await client
    .from('skill')
    .select(`
        id,
        role (
            id,
            role,
            member (
                id,
                name
            )
        ),
        skill,
        cur_level,
        min_level,
        action
        `)
    .order('risk.wbs_item.wbs_area.name', { ascending: true })
    .order('risk.wbs_item.name', { ascending: true })
    .order('risk.name', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}