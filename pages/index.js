import Menu from '../components/features/Menu'
import client from '../lib/supabaseClient';

function index() {

  return (
       <div>
        <Menu/>
        <button onClick={() => client.auth.signOut()}>Sign out</button>
      </div>
  );
}

export default index;