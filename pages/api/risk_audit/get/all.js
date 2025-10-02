'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  const { data, error } = await client
    .from('risk_audit')
    .select(`
        id,
        risk (
            id,
            risk,
            wbs_item (
                id,
                wbs_area (
                    id,
                    name,
                    color
                ),
                name
            ),
            risk_analysis (
              impact,
              urgency,
              action,
              financial_impact,
              schedule_impact
            )
        ),
        response,
        impact,
        action,
        urgency,
        financial_impact,
        schedule_impact,
        impact_description,
        evaluation_description
        `)
    .order('risk(wbs_item->wbs_area->name)', { ascending: true })
    .order('risk(wbs_item->name)', { ascending: true })
    .order('risk(risk)', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json(data)
}