import client from "../../lib/supabaseClient";

const Logout = () => {
    return (
        <button className="botao_logout" onClick={async () => {
            await client.auth.signOut();
            router.replace('/login');
        }}>Logoff</button>
    );
};

export default Logout;
