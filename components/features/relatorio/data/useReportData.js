import { useState, useCallback, useMemo } from "react";
import { transformReportData } from "../utils/transformReportData";
import { transformScheduleData } from "../utils/transformScheduleData";
import useAuth from "../../../../hooks/useAuth";
import { handleFetch, handlePostFetch } from "../../../../functions/crud_s";
import styles from '../../../../styles/modules/relatorio.module.css'

export const useReportData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState({});
    const [ganttPlanData, setGanttPlanData] = useState([]);
    const [ganttActualData, setGanttActualData] = useState([]);
    const [ganttSituationData, setGanttSituationData] = useState([]);
    const [interval, setInterval] = useState("");

    const fetchData = useCallback(async (setExibirModal) => {
        try {
            setIsLoading(true);
            setShowReport(false);
            if (interval == "") {
                setExibirModal(`Please select a valid interval!`);
                setIsLoading(false);
                setShowReport(false);
                return;
            }

            const [
                responseReport,
                responsePlano,
                responseGantt,
                responseSituacoesGantt
            ] = await Promise.all([
                handlePostFetch({
                    table: "report", query: 'all', token,
                    data: { uid: user.id, interval_text: interval },
                }),
                handleFetch({ table: "gantt", query: "startAndEndPlans", token }),
                handleFetch({ table: "gantt", query: "startAndEndMonitors", token }),
                handleFetch({ table: "gantt", query: "monitorsAndStatus", token })
            ])

            setReportData(responseReport.data);
            setGanttPlanData(responsePlano.data);
            setGanttActualData(responseGantt.data);
            setGanttSituationData(responseSituacoesGantt.data?.ganttPorArea);
            setIsLoading(false);
            setShowReport(true);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token, interval, user?.id]);

    const [
        tarefasIniciadas, tarefasConcluidas,
        tarefasEmAndamento, tarefasPlanejadas,
        riscos, oportunidades
    ] = useMemo(() => {
        return transformReportData(reportData);
    }, [reportData])

    const areaAnalysis = useMemo(() => {
        return transformScheduleData(ganttPlanData, ganttActualData, ganttSituationData)
    }, [ganttPlanData, ganttActualData, ganttSituationData]);

    return {
        tarefasIniciadas, tarefasConcluidas,
        tarefasEmAndamento, tarefasPlanejadas,
        riscos, oportunidades, areaAnalysis,
        interval,
        setInterval,
        isLoading,
        setIsLoading,
        showReport,
        setShowReport,
        styles,
        fetchData
    }
};