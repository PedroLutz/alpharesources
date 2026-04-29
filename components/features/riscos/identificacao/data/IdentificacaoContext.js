import React, {createContext, useContext} from 'react';
import { useIdentificacaoData } from './useIdentificacaoData';

const IdentificacaoContext = createContext(null);

export const IdentificacaoProvider = ({children}) => {
    const contextData = useIdentificacaoData();

    return (
        <IdentificacaoContext.Provider value={contextData}>
            {children}
        </IdentificacaoContext.Provider>
    )
}

export const useIdentificacao = () => {
    const context = useContext(IdentificacaoContext);

    if(!context) {
        throw new Error ("useIdentificacao needs to be used inside a IdentificacaoProvider");
    }

    return context;
}