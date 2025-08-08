'use client';
import client from "../../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await client
    .from('information')
    .select(`
        id,
        stakeholder ( id, stakeholder_group (id, group), stakeholder),
        information,
        method,
        frequency,
        channel,
        responsible,
        register,
        feedback,
        action`)
    .order('stakeholder.stakeholder_group.group', { ascending: true })
    .order('stakeholder.stakeholder', { ascending: true })
    .order('information', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}