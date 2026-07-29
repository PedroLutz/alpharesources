import { useState, useEffect, useCallback, useMemo } from 'react';
import { handleFetch } from "../../../../functions/crud_s";
import useAuth from '../../../../hooks/useAuth';
import { Task } from '../../../ui/GanttChart/GanttChart';

type WbsAreaType = {
    id: number;
    name: string;
    color: string,
}

type WbsItemType = {
    id: number;
    name: string;
    wbs_area: WbsAreaType;
}

type GanttDataType = {
    id: number;
    is_plan: boolean;
    start: Date | null;
    end: Date | null;
    status: "start" | "executing" | "complete";
}

type DependencyType = { dependency_id: number };

export type GanttResType = {
    id: number;
    gantt_data: [GanttDataType, GanttDataType];
    gantt_dependency: DependencyType[];
    wbs_item: WbsItemType;
}

export type TempoDataType = {
    gantts: GanttResType[];
    isLoading: boolean;
    chartData: Task[];
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    refetchData: () => Promise<void>;
}

export const useTempoData = () : TempoDataType => {
    const { user, token } = useAuth();

    const [gantts, setGantts] = useState<GanttResType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await handleFetch({
                table: "gantt",
                query: "all",
                token
            })

            setGantts(res.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [user?.id, token]);

    const chartData = useMemo(() => {
        const _data = [];
        gantts.forEach((gantt) => {
            const dependencies = gantt.gantt_dependency.map(g => g.dependency_id);
            const baseObj = {
                ganttId: gantt.id,
                area: gantt.wbs_item.wbs_area.name,
                item: gantt.wbs_item.name,
                color: gantt.wbs_item.wbs_area.color,
                dependencies
            };
            for(let i = 0; i < 2; i++){
                const start = gantt.gantt_data[i].start;
                const end = gantt.gantt_data[i].end;
                _data.push({
                    ...baseObj,
                    id: gantt.gantt_data[i].id,
                    is_plan: gantt.gantt_data[i].is_plan,
                    start: start ? new Date(`${gantt.gantt_data[i].start}T00:00:00Z`) : null,
                    end: end ? new Date(`${gantt.gantt_data[i].end}T00:00:00Z`): null,
                    status: gantt.gantt_data[i].status
                })
            }
        })
        return _data;
    }, [gantts])

    useEffect(() => {
        const fetchOnce = async () => {
            setIsLoading(true);
            await fetchData();
            setIsLoading(false);
        }

        if (user?.id && token) {
            fetchOnce();
        }
    }, [fetchData, user?.id, token]);

    return {
        gantts,
        isLoading,
        chartData,
        setIsLoading,
        refetchData: fetchData,
    }
}