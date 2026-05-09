import { FirstAndLastGanttType, GanttObjectType, GanttSituationAreaType, ScheduleData } from "./scheduleDataTypes";

export const transformScheduleData = (
    ganttPlanData: GanttObjectType[],
    ganttActualData: GanttObjectType[],
    ganttSituationData: GanttSituationAreaType[])
    : ScheduleData[] => {

    // Armazenam o primeiro e o último Gantt dos planos e dos reais
    const primeiroEUltimoPlanos: FirstAndLastGanttType[] = [];
    const primeiroEUltimoGantts: FirstAndLastGanttType[] = [];

    // Isola apenas  o id e o nome de cada área
    const areas = new Map(
        ganttPlanData?.map(
            item => [item.wbs_item.wbs_area.id,
            { id: item.wbs_item.wbs_area.id, name: item.wbs_item.wbs_area.name }
            ] as [number, { id: number; name: string }]));

    // Encontra o primeiro e o ultimo de cada área
    areas.forEach((area) => {
        {
            const primeiroInicio = ganttPlanData?.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                .reduce((min, obj) => obj.gantt_data[0].start < min.gantt_data[0].start ? obj : min);
            const ultimoTermino = ganttPlanData?.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                .reduce((max, obj) => obj.gantt_data[0].end > max.gantt_data[0].end ? obj : max);
            primeiroEUltimoPlanos.push({ primeiro: primeiroInicio, ultimo: ultimoTermino });

        }
        {
            const primeiroInicio = ganttActualData?.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                .reduce((min, obj) => obj.gantt_data[0].start < min.gantt_data[0].start ? obj : min);
            const ultimoTermino = ganttActualData?.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                .reduce((max, obj) => obj.gantt_data[0].end > max.gantt_data[0].end ? obj : max);
            primeiroEUltimoGantts.push({ primeiro: primeiroInicio, ultimo: ultimoTermino });
        }
    })

    // Agrupa o primeiro e o ultimo em uma array e insere numa array global
    var duplas: FirstAndLastGanttType[][] = [];
    primeiroEUltimoPlanos.forEach((dado) => {
        const gantt = primeiroEUltimoGantts.find(o => o?.primeiro.wbs_item.wbs_area.id === dado?.primeiro.wbs_item.wbs_area.id);
        duplas.push([dado, gantt])
    })

    // Armazena a situacao de cada area de acordo com o status dos itens de cada area
    const objSituacao: Record<string, string> = {}
    ganttSituationData?.forEach((dado) => {
        if (dado.itens.filter((item) => item?.status === "executing").length === 0 &&
            dado.itens.filter((item) => item?.status === "start").length === 0) {
            objSituacao[dado.area] = "Complete";
        }
        else if (dado.itens.filter((item) => item?.status === "executing").length === 0 &&
            dado.itens.filter((item) => item?.status === "start").length > 0 &&
            dado.itens.filter((item) => item?.status === 'complete').length > 0) {
            objSituacao[dado.area] = "Hold";
        }
        else if (dado.itens.filter((item) => item?.status === "executing").length > 0) {
            objSituacao[dado.area] = "Executing";
        }
        else if (dado.itens.filter((item) => item?.status === "executing").length === 0 &&
            dado.itens.filter((item) => item?.status === "complete").length === 0) {
            objSituacao[dado.area] = "To Begin";
        }
    })

    // Constroi a array do resumo de todas as areas
    const arrayAnalise: ScheduleData[] = [];
    duplas.forEach((dupla) => {
        const area = dupla[0]?.ultimo.wbs_item.wbs_area.name;
        const planoUltimo = dupla[0]?.ultimo;
        const ganttUltimo = dupla[1]?.ultimo;

        if (!planoUltimo || !area || !ganttUltimo) return;

        const hoje = new Date().toISOString();
        const obj: ScheduleData = { area: area, state: objSituacao[area], status: "" }

        // Checar se a area esta no cronograma ou esta atrasada
        var isOnSchedule : boolean = false;
        switch(objSituacao[area]){
            case "Executing": { isOnSchedule = planoUltimo.gantt_data[0].end >= hoje; break; }
            case "Hold": { isOnSchedule = planoUltimo.gantt_data[0].end >= hoje; break; }
            case "To Begin": { isOnSchedule = planoUltimo?.gantt_data[0].end >= hoje; break; }
            case "Complete": { isOnSchedule = planoUltimo.gantt_data[0].end >= ganttUltimo.gantt_data[0].end; }
        }

        obj.status = isOnSchedule ? 'On Schedule' : 'Overdue';
        arrayAnalise.push(obj);
    })
    return arrayAnalise;
}