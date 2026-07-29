import React, { createContext, useContext, ReactNode } from 'react';
import { GanttResType, useTempoData } from './useTempoData';
import { Task } from '../../../ui/GanttChart/GanttChart';

export interface TempoContextType {
    gantts: GanttResType[];
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    refetchData: () => Promise<void>;
    chartData: Task[];
}

const TempoContext = createContext<TempoContextType | null>(null);

interface TempoProviderProps {
    children: ReactNode;
}

export const TempoProvider = ({ children }: TempoProviderProps) => {
    const contextData = useTempoData();

    return (
        <TempoContext.Provider value={contextData}>
            {children}
        </TempoContext.Provider>
    );
};

export const useTempo = (): TempoContextType => {
    const context = useContext(TempoContext);

    if (!context) {
        throw new Error("useTempo must be used inside a TempoProvider");
    }

    return context;
};