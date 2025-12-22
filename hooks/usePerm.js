import { useContext } from "react";
import { PermissionContext } from "../contexts/PermissionProvider";

const usePerm = () => {
    const context = useContext(PermissionContext);

    if(!context){
        throw new Error("usePerm must be used inside PermissionContext");
    }

    return context;
}

export default usePerm;