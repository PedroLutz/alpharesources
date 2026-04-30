import React, {createContext, useContext} from 'react';
import { useImpactoData } from './useImpactoData';

const ImpactoContext = createContext(null);

export const ImpactoProvider = ({children}) => {
    const contextData = useImpactoData();

    return (
        <ImpactoContext.Provider value={contextData}>
            {children}
        </ImpactoContext.Provider>
    )
}

export const useImpacto = () => {
    const context = useContext(ImpactoContext);

    if(!context) {
        throw new Error ("useImpacto needs to be used inside a ImpactoProvider");
    }

    return context;
}