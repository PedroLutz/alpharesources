'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { uid } = req.body;

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  const { data, error } = await client
  .rpc('resource_acquisition_plan_monthly_summary_for_user', { uid });

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}