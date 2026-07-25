import { useState, useEffect, useCallback, useMemo } from 'react';
import { handleFetch } from "../../../../../functions/crud_s";
import useAuth from '../../../../../hooks/useAuth';

export const useWbsData = () => {
    const { user, token } = useAuth();

    const [areas, setAreas] = useState([]);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [areasRes, itemsRes] = await Promise.all([
                handleFetch({ table: 'wbs_area', query: 'all', token }),
                handleFetch({ table: 'wbs_item', query: 'all', token })
            ]);

            setAreas(areasRes.data || []);
            setItems(itemsRes.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, token]);

    const [areasNamesToIdsMap, itemsNamesToIdsMap] = useMemo(() => 
        [
            new Map(areas.map(area => [area.name, area.id])), 
            new Map(items.map(item => [item.name, item.id]))
        ]
    , [areas, items]);

    const areasToItemsMap = useMemo(() => 
        new Map(areas.map(area => [area.name, items.filter(item => item.area_id === area.id)]))
    , [areas, items])

    useEffect(() => {
        if (user?.id && token) {
            fetchData();
        }
    }, [fetchData, user?.id, token]);

    return {
        areas,
        items,

        areasNamesToIdsMap,
        itemsNamesToIdsMap,
        areasToItemsMap,

        isLoading,
        setIsLoading,
        refetchData: fetchData,
    }
}