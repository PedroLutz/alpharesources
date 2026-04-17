import { useState, useCallback, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";
import { useMemo } from "react";

export const useGruposData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [groups, setGroups] = useState([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const groupsRes = await handleFetch({
                table: 'stakeholder_group',
                query: 'all',
                token
            });
            setGroups(groupsRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const groupsSet = useMemo(() => 
        new Set(groups.map(g => g.group.trim().toLowerCase()))
        , [groups]);

    useEffect(() => {
        if (!user?.id || !token) return;

        fetchData()

    }, [fetchData, , user?.id, token]);

    return {
        groups,
        groupsSet,
        isLoading,
        setIsLoading,
        fetchData
    }
};