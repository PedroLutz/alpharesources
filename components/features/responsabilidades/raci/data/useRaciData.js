import { useState, useCallback, useMemo, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleFetch, handlePostFetch } from "../../../../../functions/crud_s";

export const useRaciData = () => {
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [itensRaci, setItensRaci] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const [elementosWbs, setElementosWbs] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const raciRes = await handlePostFetch({
                table: "raci_item",
                query: 'all_ordered',
                token,
                data: { uid: user.id },
            });
            setItensRaci(raciRes?.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
        }
    }, [token]);

    const [areasSet, itensSet] = useMemo(() => {
        return [
            new Set(itensRaci.map(i => i.area_id)),
            new Set(itensRaci.map(i => i.item_id))
        ]
    }, [itensRaci])

    const [inputToMember, memberInputData] = useMemo(() => {
        const objTemp = {};
        const inputToMemberObj = {};
        nomesMembros.forEach((membro) => {
            objTemp[`input${membro.id}`] = '';
            inputToMemberObj[`input${membro.id}`] = membro.id;
        });
        return [inputToMemberObj, objTemp];
    }, [nomesMembros])

    const fetchOnce = useCallback(async () => {
        try {
            const [membrosRes, itensRes] = await Promise.all([
                handleFetch({ table: "member", query: 'names', token }),
                handleFetch({ table: 'wbs_item', query: 'with_areas', token })
            ]);
            setNomesMembros(membrosRes?.data || []);
            setElementosWbs(itensRes?.data || []);
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
        itensRaci,
        elementosWbs,
        nomesMembros,
        inputToMember,
        memberInputData,
        isLoading,
        setIsLoading,
        areasSet,
        itensSet,
        fetchData: refetchDataOnly
    }
};