import {createContext, useContext} from 'react';
import { useMembroData } from './useMembroData';

const MembroContext = createContext(null);

export const MembroProvider = ({children}) => {
    const contextData = useMembroData();

    return (
        <MembroContext.Provider value={contextData}>
            {children}
        </MembroContext.Provider>
    )
}

export const useMembro = () => {
    const context = useContext(MembroContext);

    if(!context) {
        throw new Error ("useMembro needs to be used inside a MembroProvider");
    }

    return context;
}