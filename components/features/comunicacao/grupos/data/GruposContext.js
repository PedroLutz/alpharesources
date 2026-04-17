import {createContext, useContext} from 'react';
import { useGruposData } from './useGruposData';

const GruposContext = createContext(null);

export const GruposProvider = ({children}) => {
    const contextData = useGruposData();

    return (
        <GruposContext.Provider value={contextData}>
            {children}
        </GruposContext.Provider>
    )
}

export const useGrupos = () => {
    const context = useContext(GruposContext);

    if(!context) {
        throw new Error ("useGrupos needs to be used inside a GruposProvider");
    }

    return context;
}