import { createContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { handleFetch } from '../functions/crud_s';

export const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
    const {user, token, loading} = useAuth();
    const [colors, setColors] = useState({});

    useEffect(() => {
        const getData = async () => {
            const data = await handleFetch({
                table: 'color',
                query: 'all',
                token
            });
            setColors(data.data);
        }

        if(!loading && user && token){
            getData();
        }
    }, [user, token, loading])

  return (
    <ColorContext.Provider value={{ colors }}>
      {children}
    </ColorContext.Provider>
  );
};