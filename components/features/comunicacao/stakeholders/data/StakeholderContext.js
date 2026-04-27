import {createContext, useContext} from 'react';
import { useStakeholderData } from './useStakeholderData';

const StakeholderContext = createContext(null);

export const StakeholderProvider = ({children}) => {
    const contextData = useStakeholderData();

    return (
        <StakeholderContext.Provider value={contextData}>
            {children}
        </StakeholderContext.Provider>
    )
}

export const useStakeholder = () => {
    const context = useContext(StakeholderContext);

    if(!context) {
        throw new Error ("useStakeholder needs to be used inside a StakeholderProvider");
    }

    return context;
}