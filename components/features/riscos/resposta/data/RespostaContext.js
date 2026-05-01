import React, {createContext, useContext} from 'react';
import { useRespostaData } from './useRespostaData';

const RespostaContext = createContext(null);

export const RespostaProvider = ({children}) => {
    const contextData = useRespostaData();

    return (
        <RespostaContext.Provider value={contextData}>
            {children}
        </RespostaContext.Provider>
    )
}

export const useResposta = () => {
    const context = useContext(RespostaContext);

    if(!context) {
        throw new Error ("useResposta needs to be used inside a RespostaProvider");
    }

    return context;
}