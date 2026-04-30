import React, {createContext, useContext} from 'react';
import { useAnaliseData } from './useAnaliseData';

const AnaliseContext = createContext(null);

export const AnaliseProvider = ({children}) => {
    const contextData = useAnaliseData();

    return (
        <AnaliseContext.Provider value={contextData}>
            {children}
        </AnaliseContext.Provider>
    )
}

export const useAnalise = () => {
    const context = useContext(AnaliseContext);

    if(!context) {
        throw new Error ("useAnalise needs to be used inside a AnaliseProvider");
    }

    return context;
}