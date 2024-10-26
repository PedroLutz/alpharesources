import { useState, useEffect, useContext } from "react";
import React from "react";
import { AuthContext } from "../../../contexts/AuthContext";

const CadastroInputs = ({ funcao, item }) => {
    const [isChecked, setIsChecked] = useState([]);
    const {isAdmin} = useContext(AuthContext)

    useEffect(() => {
        setIsChecked(item.check)
    }, [])

    const handleCheck = (e) => {
        const { checked } = e.target;
        console.log(checked)
        setIsChecked(checked);
        funcao(checked, item)
    }

    return (
        <input
            type="checkbox"
            name="check"
            style={{width: '1rem'}}
            onChange={handleCheck}
            checked={isChecked}
            disabled={!isAdmin}
        />
    )
}

export default CadastroInputs;