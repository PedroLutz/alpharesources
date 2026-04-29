import {createContext, useContext} from 'react';
import { useEngajamentosData } from './useEngajamentosData';

const EngajamentosContext = createContext(null);

export const EngajamentosProvider = ({children}) => {
    const contextData = useEngajamentosData();

    return (
        <EngajamentosContext.Provider value={contextData}>
            {children}
        </EngajamentosContext.Provider>
    )
}

export const useEngajamentos = () => {
    const context = useContext(EngajamentosContext);

    if(!context) {
        throw new Error ("useEngajamentos needs to be used inside a EngajamentosProvider");
    }

    return context;
}