import { useState, useCallback, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";

export const useLicaoData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [licoes, setLicoes] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const licoesRes = await handleFetch({
                table: 'lesson',
                query: 'all',
                token
            });
            setLicoes(licoesRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const fetchLicoesWrapper = async () => {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
    }

    useEffect(() => {
        if (!user?.id || !token) return;
        fetchLicoesWrapper();
    }, [fetchData, user?.id, token]);

    return {
        licoes,
        isLoading,
        setIsLoading,
        fetchData
    }
};