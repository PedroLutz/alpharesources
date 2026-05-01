import { useState, useCallback, useEffect, useMemo } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";

export const useRespostaData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [respostas, setRespostas] = useState([]);
    const [riscos, setRiscos] = useState([]);
    const [areasWBS, setAreasWBS] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const respostasRes = await handleFetch({
                table: 'risk_response',
                query: 'all',
                token
            });
            setRespostas(respostasRes?.data || []);
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

    const refetchImpactos = async () => {
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
        respostas,
        areasWBS,
        riscos,
        isLoading,
        setIsLoading,
        fetchData: refetchImpactos
    }
};