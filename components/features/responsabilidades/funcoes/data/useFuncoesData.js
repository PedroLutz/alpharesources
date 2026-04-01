import { useState, useEffect, useCallback } from 'react';
import { handleFetch } from "../../../../../functions/crud_s";
import useAuth from '../../../../../hooks/useAuth';

export const useFuncoesData = () => {
    const { user, token } = useAuth();

    const [funcoes, setFuncoes] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const [areas, setAreas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const funcoesRes = await handleFetch({ table: "role", query: 'all', token, });
            funcoesRes.data.forEach((d) => d.wbs_area.sort((a, b) => a.name > b.name))
            setFuncoes(funcoesRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const fetchOnce = useCallback(async () => {
        try {
            const [membrosRes, areasRes] = await Promise.all([
                handleFetch({ table: "member", query: 'names', token }),
                handleFetch({ table: "wbs_area", query: 'all', token })
            ]);
            setNomesMembros(membrosRes?.data || []);
            setAreas(areasRes?.data || []);
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
                fetchOnce()
            ]);
            setIsLoading(false);
        };

        fetchAll();
        
    }, [fetchData, fetchOnce, user?.id, token]);

    return {
        funcoes,
        nomesMembros,
        areas,
        isLoading,
        setIsLoading,
        fetchData: refetchDataOnly, 
    }
}