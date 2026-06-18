import { useState, useEffect, useCallback, useMemo } from 'react';
import { handleFetch } from "../../../../../functions/crud_s";
import useAuth from '../../../../../hooks/useAuth';

export const useDictionaryData = () => {
    const { user, token } = useAuth();

    const [dicionarios, setDicionarios] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [dicionarioRes, itemsRes] = await Promise.all([
                handleFetch({ table: 'wbs_dictionary', query: 'all', token }),
                handleFetch({ table: 'wbs_item', query: 'with_areas', token })
            ]);

            setDicionarios(dicionarioRes.data || []);
            setElementosWBS(itemsRes.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, token]);

    const [areasSet, areasNames, itensSet, itensNames] = useMemo(() => {
        return [
            new Set(dicionarios.map(d => d.wbs_item.wbs_area.id)), 
            new Set(dicionarios.map(d => d.wbs_item.wbs_area.name)),
            new Set(dicionarios.map(d => d.wbs_item.id)),
            new Map(dicionarios.map(d => [d.wbs_item.name, d.wbs_item.id]))
        ]
    }, [dicionarios]);

    const elementosWBSMap = useMemo(() => {
        const areas = new Map();

        elementosWBS.forEach(e => {
            const areaName = e.wbs_area.name;
            
            if (!areas.has(areaName)) {
                areas.set(areaName, new Map());
            }
            areas.get(areaName).set(e.name, e.id);
        });

        return areas;
    }, [elementosWBS])

    useEffect(() => {
        if (user?.id && token) {
            fetchData();
        }
    }, [fetchData, user?.id, token]);

    return {
        dicionarios,
        elementosWBS,
        areasSet, itensSet,
        areasNames, itensNames,
        elementosWBSMap,
        isLoading,
        setIsLoading,
        refetchData: fetchData,
    }
}