import {createContext, useContext} from 'react';
import { usePlanoData } from './usePlanoData';

const PlanoContext = createContext(null);

export const PlanoProvider = ({children}) => {
    const contextData = usePlanoData();

    return (
        <PlanoContext.Provider value={contextData}>
            {children}
        </PlanoContext.Provider>
    )
}

export const usePlano = () => {
    const context = useContext(PlanoContext);

    if(!context) {
        throw new Error ("usePlano needs to be used inside a PlanoProvider");
    }

    return context;
}