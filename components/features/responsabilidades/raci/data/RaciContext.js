import {createContext, useContext} from 'react';
import { useRaciData } from './useRaciData';

const RaciContext = createContext(null);

export const RaciProvider = ({children}) => {
    const contextData = useRaciData();

    return (
        <RaciContext.Provider value={contextData}>
            {children}
        </RaciContext.Provider>
    )
}

export const useRaci = () => {
    const context = useContext(RaciContext);

    if(!context) {
        throw new Error ("useRaci needs to be used inside a RaciProvider");
    }

    return context;
}