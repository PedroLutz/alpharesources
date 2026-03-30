import { useState, useEffect, useCallback } from 'react';
import { handleFetch } from "../../../../functions/crud_s";
import useAuth from '../../../../hooks/useAuth';
import { isoDateToEuDate } from '../../../../functions/general';

export const useRecursoData = () => {
    const { user, token } = useAuth();

    const [recursos, setRecursos] = useState([]);
    const [datasPlanos, setDatasPlanos] = useState(new Map());
    const [itensPorArea, setItensPorArea] = useState(new Map());
    const [areas, setAreas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [recursosRes, datasPlanosRes] = await Promise.all([
                handleFetch({ table: 'resource', query: 'all', token }),
                handleFetch({ table: 'gantt', query: 'plansStartsPerItem', token })
            ]);

            setRecursos(recursosRes?.data || []);

            const datasPlanosMap = new Map(datasPlanosRes?.data?.map(item => [
                item.wbs_item?.id,
                isoDateToEuDate(item.gantt_data[0]?.start)
            ]));
            setDatasPlanos(datasPlanosMap);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const fetchWbs = useCallback(async () => {
        try {
            const itemsRes = await handleFetch({ table: 'wbs_item', query: 'with_areas', token });        
            const areasMap = new Map();
            const itensPorAreaMap = new Map();
            itemsRes?.data?.forEach(item => {
                areasMap.set(item.wbs_area.id, item.wbs_area.name);

                if(itensPorAreaMap.has(item.wbs_area.id)){
                    itensPorAreaMap.get(item.wbs_area.id).push({id: item.id, name: item.name});
                } else {
                    itensPorAreaMap.set(item.wbs_area.id, [{id: item.id, name: item.name}]);
                }
            });
            itensPorAreaMap.set(-1, [{id: -1, name: "Others"}]);
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
        recursos,
        datasPlanos,
        areas,
        itensPorArea,
        isLoading,
        setIsLoading,
        refetchData: refetchDataOnly, 
    }
}