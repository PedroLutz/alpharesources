import React, {createContext, useContext} from 'react';
import { useAuditData } from './useAuditData';

const AuditContext = createContext(null);

export const AuditProvider = ({children}) => {
    const contextData = useAuditData();

    return (
        <AuditContext.Provider value={contextData}>
            {children}
        </AuditContext.Provider>
    )
}

export const useAudit = () => {
    const context = useContext(AuditContext);

    if(!context) {
        throw new Error ("useAudit needs to be used inside a AuditProvider");
    }

    return context;
}