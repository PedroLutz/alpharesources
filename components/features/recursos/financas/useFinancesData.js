import { useState, useEffect, useCallback } from 'react';
import { handleFetch } from "../../../../functions/crud_s";
import useAuth from '../../../../hooks/useAuth';
import { jsDateToEuDate } from '../../../../functions/general';

export const useFinancesData = () => {
    const { user, token } = useAuth();

    const [lancamentos, setLancamentos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [wbsAreas, setWbsAreas] = useState([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [lancamentosRes, areasRes] = await Promise.all([
                handleFetch({ table: 'financial_release', query: 'all', token }),
                handleFetch({ table: 'wbs_area', query: 'all', token })
            ]);
            
            setWbsAreas(areasRes.data);
            

            var balance = 0;
            const lancamentosData = lancamentosRes.data;
            
            lancamentosData.forEach((item) => {
                item.date = jsDateToEuDate(item.date);
                if (item.type != "exchange") balance = balance + item.value;
                item.balance = balance.toFixed(2);
            });
            
            let lancamentosReversed = [];
            for (let i = lancamentosData.length; i > 0; i--) {
                lancamentosReversed.push(lancamentosData[i - 1]);
            }
            setLancamentos(lancamentosReversed);
        } catch {

        } finally {
            setIsLoading(false);
        }
    }, [user?.id, token]);

    useEffect(() => {
        if (user?.id && token) {
            fetchData();
        }
    }, [fetchData, user?.id, token]);

    return {
        lancamentos,
        isLoading,
        setIsLoading,
        wbsAreas,
        refetchData: fetchData,
    }
}