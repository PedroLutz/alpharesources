import React, {createContext, useContext} from 'react';
import { useDictionaryData } from './useDictionaryData';

const DictionaryContext = createContext(null);

export const DictionaryProvider = ({children}) => {
    const contextData = useDictionaryData();

    return (
        <DictionaryContext.Provider value={contextData}>
            {children}
        </DictionaryContext.Provider>
    )
}

export const useDictionary = () => {
    const context = useContext(DictionaryContext);

    if(!context) {
        throw new Error ("useDictionary needs to be used inside a DictionaryProvider");
    }

    return context;
}