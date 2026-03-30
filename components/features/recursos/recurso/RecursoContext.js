import {createContext, useContext} from 'react';
import { useRecursoData } from './useRecursoData';

const RecursoContext = createContext(null);

export const RecursoProvider = ({children}) => {
    const contextData = useRecursoData();

    return (
        <RecursoContext.Provider value={contextData}>
            {children}
        </RecursoContext.Provider>
    )
}

export const useRecurso = () => {
    const context = useContext(RecursoContext);

    if(!context) {
        throw new Error ("useRecurso needs to be used inside a RecursoProvider");
    }

    return context;
}