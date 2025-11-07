import client from "../../lib/supabaseClient";
import { useRouter } from 'next/router';

const Logout = () => {
    const router = useRouter();

    return (
        <button className="botao_logout" onClick={async () => {
            router.replace('/login');
            await client.auth.signOut();
        }}>Logoff</button>
    );
};

export default Logout;
