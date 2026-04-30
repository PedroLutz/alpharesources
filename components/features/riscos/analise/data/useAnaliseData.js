import { useState, useCallback, useEffect, useMemo } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";

export const useAnaliseData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [analises, setAnalises] = useState([]);
    const [riscos, setRiscos] = useState([]);
    const [itensWBS, setItensWBS] = useState([]);
    const [areasWBS, setAreasWBS] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const analisesRes = await handleFetch({
                table: 'risk_analysis',
                query: 'all',
                token
            });
            setAnalises(analisesRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const fetchOnce = useCallback(async () => {
        try {
            const [areasRes, riscosRes] = await Promise.all([
                handleFetch({ table: 'wbs_area', query: 'all', token }),
                handleFetch({ table: 'risk', query: 'risks_and_areas', token }),
            ]);
            setAreasWBS(areasRes?.data || []);
            setRiscos(riscosRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const riscosMapeados = useMemo(() => {
        const _map = new Map();
        for(let occ = 1; occ <= 5; occ++){
            for(let imp = 1; imp <= 5; imp++){
                _map.set(`${occ}-${imp}`, []);
            }
        }
        analises.forEach(risco => {
            _map.get(`${risco.occurrence}-${risco.impact}`).push(risco.risk.risk);
        })

        return _map;
    }, [analises])

    const refetchAnalises = async () => {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
    }

    useEffect(() => {
        if (!user?.id || !token) return;

        const fetchAll = async () => {
            setIsLoading(true);
            try {
                await Promise.all([fetchData(), fetchOnce()]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAll();

    }, [fetchData, fetchOnce, user?.id, token]);

    return {
        analises,
        areasWBS,
        riscos,
        riscosMapeados,
        isLoading,
        setIsLoading,
        fetchData: refetchAnalises
    }
};