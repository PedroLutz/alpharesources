import {createContext, useContext} from 'react';
import { useHabilidadeData } from './useHabilidadeData';

const HabilidadeContext = createContext(null);

export const HabilidadeProvider = ({children}) => {
    const contextData = useHabilidadeData();

    return (
        <HabilidadeContext.Provider value={contextData}>
            {children}
        </HabilidadeContext.Provider>
    )
}

export const useHabilidade = () => {
    const context = useContext(HabilidadeContext);

    if(!context) {
        throw new Error ("useHabilidade needs to be used inside a HabilidadeProvider");
    }

    return context;
}