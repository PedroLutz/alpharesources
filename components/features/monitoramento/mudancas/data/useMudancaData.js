import { useState, useCallback, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";

export const useMudancaData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [mudancas, setMudancas] = useState([]);
    const [areasWBS, setAreasWBS] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const mudancasRes = await handleFetch({
                table: 'change',
                query: 'all',
                token
            });
            setMudancas(mudancasRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const fetchOnce = useCallback(async () => {
        try {
            const areasRes = await handleFetch({ table: 'wbs_area', query: 'all', token });
            setAreasWBS(areasRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token])

    const refetchMudancas = async () => {
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
        mudancas,
        areasWBS,
        isLoading,
        setIsLoading,
        fetchData: refetchMudancas
    }
};