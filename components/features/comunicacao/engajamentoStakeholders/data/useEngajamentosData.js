import { useState, useCallback, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";
import { useMemo } from "react";

export const useEngajamentosData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [engajamentos, setEngajamentos] = useState([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const engajamentosRes = await handleFetch({
                table: 'engagement',
                query: 'all',
                token
            });
            setEngajamentos(engajamentosRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!user?.id || !token) return;

        fetchData()

    }, [fetchData, , user?.id, token]);

    return {
        engajamentos,
        isLoading,
        setIsLoading,
        fetchData
    }
};