import {createContext, useContext} from 'react';
import { useInformacaoData } from './useInformacaoData';

const InformacaoContext = createContext(null);

export const InformacaoProvider = ({children}) => {
    const contextData = useInformacaoData();

    return (
        <InformacaoContext.Provider value={contextData}>
            {children}
        </InformacaoContext.Provider>
    )
}

export const useInformacao = () => {
    const context = useContext(InformacaoContext);

    if(!context) {
        throw new Error ("useInformacao needs to be used inside a InformacaoProvider");
    }

    return context;
}