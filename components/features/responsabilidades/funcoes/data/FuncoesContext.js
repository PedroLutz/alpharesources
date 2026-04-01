import {createContext, useContext} from 'react';
import { useFuncoesData } from './useFuncoesData';

const FuncoesContext = createContext(null);

export const FuncoesProvider = ({children}) => {
    const contextData = useFuncoesData();

    return (
        <FuncoesContext.Provider value={contextData}>
            {children}
        </FuncoesContext.Provider>
    )
}

export const useFuncoes = () => {
    const context = useContext(FuncoesContext);

    if(!context) {
        throw new Error ("useFuncoes needs to be used inside a FuncoesProvider");
    }

    return context;
}