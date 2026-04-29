import { useState, useCallback, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch } from "../../../../../functions/crud_s";
import { useMemo } from "react";

export const useInformacaoData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [informacoes, setInformacoes] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const [stakeholders, setStakeholders] = useState([]);
    const [groups, setGroups] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const informacaoRes = await handleFetch({
                table: 'information',
                query: 'all',
                token 
            });
            setInformacoes(informacaoRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const fetchOnce = useCallback(async () => {
        try {
            const [ groupsRes, membrosRes, stakeholdersRes ] = await Promise.all([
                handleFetch({ table: 'stakeholder_group', query: 'groups_names', token }),
                handleFetch({ table: 'member', query: 'names', token }),
                handleFetch({ table: 'stakeholder', query: 'with_groups', token })
            ]);
            setGroups(groupsRes?.data || []);
            setNomesMembros(membrosRes?.data || []);
            setStakeholders(stakeholdersRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token])

    const refetchInformacoes = async () => {
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
        informacoes,
        groups,
        nomesMembros,
        stakeholders,
        isLoading,
        setIsLoading,
        fetchData: refetchInformacoes
    }
};