export interface ScheduleData {
    area: string;
    state: "Hold" | "To Begin" | "Executing" | "Complete" | string;
    status: "On Schedule" | "Overdue" | string;
}

interface GanttDataType {
    id: number;
    is_plan: boolean;
    start: string;
    end: string;
}

interface WbsAreaType {
    id: number;
    name: string;
}

interface WbsItemType {
    id: number;
    name: string;
    wbs_area: WbsAreaType;
}

export interface GanttObjectType {
    id: number;
    gantt_data: GanttDataType[];
    wbs_item: WbsItemType;
}

interface GanttSituationItemType {
    item: string;
    status: "complete" | "start" | "executing";
}

export interface GanttSituationAreaType {
    area: string;
    itens: GanttSituationItemType[];
}

export type FirstAndLastGanttType = {
    primeiro: GanttObjectType;
    ultimo: GanttObjectType;
} | undefined;
