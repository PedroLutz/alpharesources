import { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "../../../../lib/supabaseServerClient";
import { GanttResType } from "../../../../components/features/tempo/data/useTempoData";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = createServerClient(token);

  // Removidos os .order() nativos para fazermos a ordenação via JS
  const { data, error } : {data: GanttResType[], error: any}= await client
    .from('gantt')
    .select(`
    id,
    wbs_item (
      id,
      wbs_area (id, color, name),
      name
    ),
    gantt_data!inner (
      id,
      is_plan,
      start,
      end,
      status
    ),
    gantt_dependency!gantt_dependency_gantt_id_fkey (
      dependency_id
    )
  `);

  if (error) return res.status(400).json({ error: error.message })

  if (!data) return res.status(200).json([]);

  data.forEach((gantt) => {
    if (gantt.gantt_data) {
      gantt.gantt_data.sort((a, b) => {
        return a.is_plan === b.is_plan ? 0 : a.is_plan ? -1 : 1;
      });
    }
  });

  const sortedData = data.sort((a, b) => {
    const areaA = a.wbs_item?.wbs_area?.name?.toLowerCase() || "";
    const areaB = b.wbs_item?.wbs_area?.name?.toLowerCase() || "";
    if (areaA !== areaB) return areaA < areaB ? -1 : 1;

    const planA = a.gantt_data?.find(d => d.is_plan);
    const planB = b.gantt_data?.find(d => d.is_plan);
    const actualA = a.gantt_data?.find(d => !d.is_plan);
    const actualB = b.gantt_data?.find(d => !d.is_plan);

    const startPlanA = planA?.start ? new Date(planA.start).getTime() : Infinity;
    const startPlanB = planB?.start ? new Date(planB.start).getTime() : Infinity;
    if (startPlanA !== startPlanB) return startPlanA - startPlanB;

    const endPlanA = planA?.end ? new Date(planA.end).getTime() : Infinity;
    const endPlanB = planB?.end ? new Date(planB.end).getTime() : Infinity;
    if (endPlanA !== endPlanB) return endPlanA - endPlanB;

    const startActualA = actualA?.start ? new Date(actualA.start).getTime() : Infinity;
    const startActualB = actualB?.start ? new Date(actualB.start).getTime() : Infinity;
    if (startActualA !== startActualB) return startActualA - startActualB;

    const endActualA = actualA?.end ? new Date(actualA.end).getTime() : Infinity;
    const endActualB = actualB?.end ? new Date(actualB.end).getTime() : Infinity;
    if (endActualA !== endActualB) return endActualA - endActualB;

    const itemA = a.wbs_item?.name?.toLowerCase() || "";
    const itemB = b.wbs_item?.name?.toLowerCase() || "";
    return itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
});

  return res.status(200).json(sortedData);
}