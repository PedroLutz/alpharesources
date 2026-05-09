import React, { createContext, useContext } from 'react';
import { useLicaoData } from './useLicaoData';

const LicaoContext = createContext(null);

export const LicaoProvider = ({children}) => {
    const contextData = useLicaoData();

    return (
        <LicaoContext.Provider value={contextData}>
            {children}
        </LicaoContext.Provider>
    )
}

export const useLicao = () => {
    const context = useContext(LicaoContext);

    if(!context) {
        throw new Error ("useLicao needs to be used inside a LicaoProvider");
    }

    return context;
}