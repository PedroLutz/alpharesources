import { createContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { getIsEditor } from '../lib/getIsEditor';

export const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const {user, token, loading} = useAuth();
    const [isEditor, setIsEditor] = useState(false);

    

    useEffect(() => {
        const getData = async () => {
            const editor = await getIsEditor(user.id, token);
            setIsEditor(editor);
        }

        if(!loading && user && token){
            getData();
        }
    }, [user, token, loading])

  return (
    <PermissionContext.Provider value={{ isEditor }}>
      {children}
    </PermissionContext.Provider>
  );
};