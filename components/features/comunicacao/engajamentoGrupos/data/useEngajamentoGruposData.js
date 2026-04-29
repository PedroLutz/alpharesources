import { useState, useCallback, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";
import { useMemo } from "react";

export const useEngajamentoGruposData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [groupEngagements, setGroupEngagements] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const groupEngagementRes = await handleFetch({ 
                table: 'stakeholder_group_engagement', 
                query: 'all', 
                token 
            });
            setGroupEngagements(groupEngagementRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    useEffect(() => {
        if (!user?.id || !token) return;

        const fetchAll = async () => {
            setIsLoading(true);
            try {
                await fetchData();
            } finally {
                setIsLoading(false);
            }
        }

        fetchAll();

    }, [fetchData, user?.id, token]);

    return {
        groupEngagements,
        isLoading,
        setIsLoading,
        fetchData
    }
};