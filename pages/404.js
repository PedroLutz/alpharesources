import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Pagina404 = () => {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/');
        }, 3000); // redireciona depois de 2 segundos

        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{height: '90vh'}}>
            <div className="overlay">
            <div className="modal">
                <img src='/images/alphie_lost.png' style={{ width: '200px', height: '200px'}} />
                <p style={{textAlign: 'center'}}> Uh oh, looks like you're lost! Redirecting you to the main menu...</p>
            </div>
        </div>
        </div>
        
    );
}

export default Pagina404;