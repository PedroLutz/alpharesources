import {createContext, useContext} from 'react';
import { useCBData } from './useCBData';

const CBContext = createContext(null);

export const CBProvider = ({children}) => {
    const contextData = useCBData();

    return (
        <CBContext.Provider value={contextData}>
            {children}
        </CBContext.Provider>
    )
}

export const useCostBenefit = () => {
    const context = useContext(CBContext);

    if(!context) {
        throw new Error ("useCB needs to be used inside a CBProvider");
    }

    return context;
}