import React, { createContext, useContext } from 'react';
import { useMudancaData } from './useMudancaData';

const MudancaContext = createContext(null);

export const MudancaProvider = ({children}) => {
    const contextData = useMudancaData();

    return (
        <MudancaContext.Provider value={contextData}>
            {children}
        </MudancaContext.Provider>
    )
}

export const useMudanca = () => {
    const context = useContext(MudancaContext);

    if(!context) {
        throw new Error ("useMudanca needs to be used inside a MudancaProvider");
    }

    return context;
}