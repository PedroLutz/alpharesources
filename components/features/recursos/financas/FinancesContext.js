import {createContext, useContext} from 'react';
import { useFinancesData } from './useFinancesData';

const FinancesContext = createContext(null);

export const FinancesProvider = ({children}) => {
    const contextData = useFinancesData();

    return (
        <FinancesContext.Provider value={contextData}>
            {children}
        </FinancesContext.Provider>
    )
}

export const useFinances = () => {
    const context = useContext(FinancesContext);

    if(!context) {
        throw new Error ("useFinances needs to be used inside a FinancesProvider");
    }

    return context;
}