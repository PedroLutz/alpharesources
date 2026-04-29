import {createContext, useContext} from 'react';
import { useEngajamentoGruposData } from './useEngajamentoGruposData';

const EngajamentoGruposContext = createContext(null);

export const EngajamentoGruposProvider = ({children}) => {
    const contextData = useEngajamentoGruposData();

    return (
        <EngajamentoGruposContext.Provider value={contextData}>
            {children}
        </EngajamentoGruposContext.Provider>
    )
}

export const useEngajamentoGrupos = () => {
    const context = useContext(EngajamentoGruposContext);

    if(!context) {
        throw new Error ("useEngajamentoGrupos needs to be used inside a EngajamentoGruposProvider");
    }

    return context;
}