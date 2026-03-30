import { useState, useEffect, useCallback } from 'react';
import { handleFetch, handlePostFetch } from "../../../../../functions/crud_s";
import useAuth from '../../../../../hooks/useAuth';
import { isoDateToEuDate } from '../../../../../functions/general';
import { generateGraphData } from './generateGraphData';

export const useRecursoData = () => {
    const { user, token } = useAuth();

    const [planos, setPlanos] = useState([]);
    const [itensPorArea, setItensPorArea] = useState(new Map());
    const [areas, setAreas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
            const totalContin = emvRes.data.reduce((acc, cur) => acc += (cur.financial_impact * (cur.occurrence / 5)), 0);
            setTotalContingencia(totalContin);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const graphData = useMemo(() => { 
        return {...generateGraphData(areaSummary), totalContingencia}
    }, [areaSummary]);

    const fetchWbs = useCallback(async () => {
        try {
            const itemsRes = await handleFetch({ table: 'wbs_item', query: 'with_areas', token });
            const areasMap = new Map();
            const itensPorAreaMap = new Map();
            itemsRes?.data?.forEach(item => {
                areasMap.set(item.wbs_area.id, item.wbs_area.name);

                if (itensPorAreaMap.has(item.wbs_area.id)) {
                    itensPorAreaMap.get(item.wbs_area.id).push({ id: item.id, name: item.name });
                } else {
                    itensPorAreaMap.set(item.wbs_area.id, [{ id: item.id, name: item.name }]);
                }
            });
            itensPorAreaMap.set(-1, [{ id: -1, name: "Others" }]);
            setAreas(Array.from(areasMap.entries()));
            setItensPorArea(itensPorAreaMap);
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
                fetchWbs()
            ]);
            setIsLoading(false);
        };

        fetchAll();

    }, [fetchData, fetchWbs, user?.id, token]);

    return {
        planos,
        areas,
        itensPorArea,
        isLoading,
        setIsLoading,
        graphData,
        refetchData: refetchDataOnly,
    }
}