import { useState, useEffect, useCallback } from 'react';
import { handleFetch } from "../../../../functions/crud_s";
import useAuth from '../../../../hooks/useAuth';

export const useCBData = () => {
    const { user, token } = useAuth();

    const [custoBeneficios, setCustoBeneficios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => { //callback memoizes the function, avoiding re-renders
        setIsLoading(true);
        try {
            const custoBeneficioRes = await handleFetch({ table: 'cost_benefit', query: 'all', token });
            custoBeneficioRes.data.forEach((cb) => {
                cb.mediaBeneficios = parseFloat((cb.area_impact
                    + cb.impact
                    + cb.urgency
                    + cb.edge)
                    / 4).toFixed(2)
            })
            setCustoBeneficios(custoBeneficioRes.data || []);
        } catch (err) {
            console.error("Error while loading data: ", err);
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
        custoBeneficios,
        isLoading,
        setIsLoading,
        refetchData: fetchData,
    }
}