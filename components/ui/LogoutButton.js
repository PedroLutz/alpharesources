import client from "../../lib/supabaseClient";
import { useRouter } from 'next/router';

const Logout = () => {
    const router = useRouter();

    return (
        <button className="botao_logout" onClick={async () => {
            await client.auth.signOut();
            router.replace('/login');
        }}>Logoff</button>
    );
};

export default Logout;
