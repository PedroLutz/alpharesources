import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";

const func = () => {
    useEffect(()=>{
        const run = async () => {
            // await fetch('../api/mongodbtransfer/all');
        }
        run()
    }, [])

    return (<div>QUE MERDA</div>)
}

export default func;