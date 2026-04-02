import { useState, useCallback, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";

export const useHabilidadeData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [habilidades, setHabilidades] = useState([]);
    const [nomesFuncoes, setNomesFuncoes] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const skillRes = await handleFetch({
                table: 'skill',
                query: 'all',
                token
            });
            skillRes.data.forEach((d) => d.role.wbs_area.sort((a, b) => a.name > b.name))
            setHabilidades(skillRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const fetchOnce = useCallback(async () => {
        try {
            const funcoesRes = await handleFetch({
                table: "role",
                query: 'names',
                token
            });
            setNomesFuncoes(funcoesRes?.data || []);
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
        habilidades,
        nomesFuncoes,
        isLoading,
        setIsLoading,
        fetchData: refetchDataOnly
    }
};