import { useContext } from "react";
import { ColorContext } from "../contexts/ColorProvider";

const useColor = () => {
    const context = useContext(ColorContext);

    if(!ColorContext){
        throw new Error("useColor must be used inside ColorProvider");
    }

    return context;
}

export default useColor;