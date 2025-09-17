'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  const { data, error } = await client
    .from('resource_acquisition_plan')
    .select(`
        id,
        resource (
            id,
            wbs_item (
              wbs_area (
                  id,
                  name,
                  color
              )
            ),
            resource
        ),
        method_a,
        plan_a,
        details_a,
        value_a,
        expected_date,
        critical_date,
        method_b,
        plan_b,
        value_b,
        details_b,
        plan_real,
        date_real,
        value_real`)
    .order('resource(wbs_item->wbs_area->name)', { ascending: true })
    .order('resource(resource)', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}