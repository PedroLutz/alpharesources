'use client';
import { createServerClient } from "../../../../lib/supabaseServerClient";

export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });

    const { uid, interval_text } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    const client = createServerClient(token);

    try {
        const [
            { data: delayed_start, error: error_ds },
            { data: delayed_end, error: error_de },
            { data: count_tasks, error: error_ct },
            { data: threats, error: error_r },
            { data: opportunities, error: error_o },
            { data: budget_percentage, error: error_bp },
            { data: area_summary, error: error_as },
            { data: items_completed_recently, error: error_ic},
            { data: items_planned_to_start, error: error_ip},
            { data: resources_nearing_expected_date, error: error_rne},
            { data: resources_nearing_critical_date, error: error_rnc},
            { data: current_cash_value, error: error_cc},
            { data: count_items_per_area, error: error_ci}
        ] = await Promise.all([
            client.rpc('delayed_start_tasks_per_user', { uid }),
            client.rpc('delayed_end_tasks_per_user', { uid }),
            client.rpc('count_tasks_per_user', { uid }),
            client.rpc('threats_of_items_in_execution_with_rpn', { uid }),
            client.rpc('opportunities_of_items_in_execution_with_rpn', { uid }),
            client.rpc('resource_budget_and_spent', { uid }),
            client.rpc('financial_release_area_summary_for_user', { uid }),
            client.rpc('items_completed_recently', { uid, interval_text }),
            client.rpc('items_planned_to_start', { uid, interval_text }),
            client.rpc('resources_nearing_expected_date', { uid, interval_text }),
            client.rpc('resources_nearing_critical_date', { uid, interval_text }),
            client.rpc('current_cash_value', { uid, interval_text }),
            client.rpc('count_items_per_area', { uid })
        ]);

        const firstError = error_ds || error_de || error_ct || error_r || error_o || error_bp || 
                        error_as || error_ic || error_ip || error_rne || error_rnc || error_cc || error_ci;
        if (firstError) throw new Error(firstError.message);

        return res.status(200).json({
            delayed_tasks: { delayed_start, delayed_end },
            count_tasks: count_tasks[0],
            active_risks: {threats, opportunities},
            budget_percentage: budget_percentage[0],
            area_summary,
            items_in_interval: {items_completed_recently, items_planned_to_start},
            resources: {resources_nearing_expected_date, resources_nearing_critical_date},
            current_cash_value: current_cash_value[0],
            count_items_per_area
        });

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}