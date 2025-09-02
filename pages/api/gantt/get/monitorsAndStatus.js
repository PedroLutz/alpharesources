'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  const { data, error } = await client
    .from('gantt')
    .select(`
      id,
      wbs_item (
        id,
        name,
        wbs_area (
          id,
          name
        )
      ),
      gantt_data!inner (
        id,
        status
      )
    `)
    .eq('gantt_data.is_plan', false);

  if (error) return res.status(400).json({ error: error.message });

  // transformar no formato { area, itens[] }
  const ganttPorArea = data.reduce((acc, row) => {
    const area = row.wbs_item?.wbs_area?.name || "Sem área";
    const item = row.wbs_item?.name || "Sem item";
    const status = row.gantt_data[0]?.status || "Sem status";

    if (!acc[area]) {
      acc[area] = { area, itens: [] };
    }

    acc[area].itens.push({
      item,
      status
    });

    return acc;
  }, {});

  return res.status(200).json({
    ganttPorArea: Object.values(ganttPorArea)
  });
}
