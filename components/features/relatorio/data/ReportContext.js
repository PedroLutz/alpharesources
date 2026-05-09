import React, { createContext, useContext } from 'react';
import { useReportData } from './useReportData';

const ReportContext = createContext(null);

export const ReportProvider = ({children}) => {
    const contextData = useReportData();

    return (
        <ReportContext.Provider value={contextData}>
            {children}
        </ReportContext.Provider>
    )
}

export const useReport = () => {
    const context = useContext(ReportContext);

    if(!context) {
        throw new Error ("useReport needs to be used inside a ReportProvider");
    }

    return context;
}