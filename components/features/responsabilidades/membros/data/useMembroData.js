import { useState, useCallback, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";

export const useMembroData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [membros, setMembros] = useState([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const membrosRes = await handleFetch({
                table: 'member',
                query: 'all',
                token
            });
            setMembros(membrosRes?.data || []);
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
        membros,
        isLoading,
        setIsLoading,
        fetchData
    }
};