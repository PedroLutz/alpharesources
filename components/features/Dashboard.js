import useAuth from "../../hooks/useAuth";
import { handlePostFetch } from "../../functions/crud_s";
import { useState, useEffect } from "react";

const Dashboard = () => {
    const {user, token} = useAuth();
    const user_id = user?.id;

    const fetchDados = async () => {
        const data = await handlePostFetch({
            table: 'dashboard',
            query: 'all',
            token,
            data: {uid: user_id, interval_text: '1 week'}
        })
        console.log(data);
    }

    useEffect(() => {
        fetchDados();
    }, []);

    return (<div>DASHBOARD</div>)
};

export default Dashboard;