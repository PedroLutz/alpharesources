import { useState, useEffect, useCallback, useMemo } from 'react';
import { handleFetch, handlePostFetch } from "../../../../../functions/crud_s";
import useAuth from '../../../../../hooks/useAuth';
import { generateGraphData } from './generateGraphData';

export const usePlanoData = () => {
    const { user, token } = useAuth();

    const [planos, setPlanos] = useState([]);
    const [recursosPorArea, setRecursosPorArea] = useState(new Map());
    const [areas, setAreas] = useState([]);
    const [cores, setCores] = useState({})
    const [isLoading, setIsLoading] = useState(true);
    const [contingencia, setContingencia] = useState([]);
    const [totalContingencia, setTotalContingencia] = useState(0);
    const [areaSummary, setAreaSummary] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const [planosRes, areaSummaryRes, emvRes] = await Promise.all([
                handleFetch({ table: 'resource_acquisition_plan', query: 'all', token }),
                handlePostFetch({ table: 'resource_acquisition_plan', query: 'area_summary', data: { uid: user.id }, token }),
                handleFetch({ table: 'risk_analysis', query: 'emvs_per_item', token })
            ]);

            planosRes.data.forEach((item) => {
                const dataEsperada = new Date(item.expected_date);
                const dataLimite = new Date(item.critical_date);
                const dataReal = new Date(item.date_real);
                if (item.date_real) {
                    item.date_diference = `Expected: ${(dataReal - dataEsperada) / (1000 * 60 * 60 * 24)} days,\n
                    Critical: ${(dataReal - dataLimite) / (1000 * 60 * 60 * 24)} days`
                } else {
                    item.date_diference = `-`
                }
                if (item.value_real) {
                    item.value_diference = `Plan A: R$${Number(item.value_real - item.value_a).toFixed(2)},\n
                    Plan B: R$${Number(item.value_real - item.value_b).toFixed(2)}`
                } else {
                    item.value_diference = `-`
                }
            });

            setPlanos(planosRes?.data || []);
            setAreaSummary(areaSummaryRes?.data || []);
            setContingencia(emvRes?.data || []);
            const totalContin = emvRes.data.reduce((acc, cur) => acc += (cur.financial_impact * (cur.occurrence / 5)), 0);
            setTotalContingencia(totalContin);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const graphData = useMemo(() => {
        return { ...generateGraphData(areaSummary, contingencia), totalContingencia }
    }, [areaSummary, totalContingencia, contingencia]);

    const fetchRecursos = useCallback(async () => {
        try {
            const recursosRes = await handleFetch({ table: 'resource', query: 'resourcesAndAreas', token });
            const areasMap = new Map();
            const cores = {};
            const recursosPorAreaMap = new Map();
            recursosRes?.data?.forEach(item => {
                if (item?.wbs_item?.wbs_area.id != null) {
                    areasMap.set(item?.wbs_item?.wbs_area.id, item?.wbs_item?.wbs_area.name);
                    cores[item?.wbs_item?.wbs_area.name] = item?.wbs_item?.wbs_area.color ?? "";
                    if (recursosPorAreaMap.has(item?.wbs_item?.wbs_area.id)) {
                        recursosPorAreaMap.get(item?.wbs_item?.wbs_area.id).push({ id: item?.id, resource: item?.resource });
                    } else {
                        recursosPorAreaMap.set(item?.wbs_item?.wbs_area.id, [{ id: item?.id, resource: item?.resource }]);
                    }
                }
            });
            recursosPorAreaMap.set(-1, [{ id: -1, resource: "Others" }]);
            console.log(recursosPorAreaMap)
            setAreas(Array.from(areasMap.entries()));
            setCores({ ...cores, Others: "#ccc" });
            setRecursosPorArea(recursosPorAreaMap);
        } catch (err) {
            console.error("Error while loading WBS data: ", err);
        }
    }, [token]);

    const refetchDataOnly = useCallback(async () => {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
    }, [fetchData]);

    useEffect(() => {
        if (!user?.id || !token) return;

        const fetchAll = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchData(),
                fetchRecursos()
            ]);
            setIsLoading(false);
        };

        fetchAll();

    }, [fetchData, fetchRecursos, user?.id, token]);

    return {
        planos,
        cores,
        areas,
        recursosPorArea,
        isLoading,
        setIsLoading,
        graphData,
        refetchData: refetchDataOnly,
    }
}