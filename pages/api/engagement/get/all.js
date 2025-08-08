'use client';
import client from "../../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await client
    .from('engagement')
    .select(`
        id,
        stakeholder (
            id,
            stakeholder_group (
                id,
                group
            ),
            stakeholder,
            power,
            interest
        ),
        eng_level,
        eng_target_level
        `)
    .order('stakeholder.stakeholder_group.group', { ascending: true })
    .order('stakeholder.stakeholder', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}