import React, {createContext, useContext} from 'react';
import { useWbsData } from './useWbsData';

const WbsContext = createContext(null);

export const WbsProvider = ({children}) => {
    const contextData = useWbsData();

    return (
        <WbsContext.Provider value={contextData}>
            {children}
        </WbsContext.Provider>
    )
}

export const useWbs = () => {
    const context = useContext(WbsContext);

    if(!context) {
        throw new Error ("useWbs needs to be used inside a WbsProvider");
    }

    return context;
}