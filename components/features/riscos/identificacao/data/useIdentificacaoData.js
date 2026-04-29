import { useState, useCallback, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";

export const useIdentificacaoData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [riscos, setRiscos] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const [itensWBS, setItensWBS] = useState([]);
    const [areasWBS, setAreasWBS] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const riscosRes = await handleFetch({
                table: 'risk',
                query: 'all',
                token
            });
            setRiscos(riscosRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const fetchOnce = useCallback(async () => {
        try {
            const [itemsRes, areasRes, membrosRes] = await Promise.all([
                handleFetch({ table: 'wbs_item', query: 'with_areas', token }),
                handleFetch({ table: 'wbs_area', query: 'all', token }),
                handleFetch({ table: 'member', query: 'names', token }),
            ]);
            setItensWBS(itemsRes?.data || []);
            setAreasWBS(areasRes?.data || []);
            setNomesMembros(membrosRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token])

    const refetchRiscos = async () => {
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
        riscos,
        itensWBS,
        areasWBS,
        nomesMembros,
        isLoading,
        setIsLoading,
        fetchData: refetchRiscos
    }
};