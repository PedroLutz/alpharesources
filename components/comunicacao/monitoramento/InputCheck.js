import { useState, useEffect } from "react";
import React from "react";

const CadastroInputs = ({ funcao, item }) => {
    const [isChecked, setIsChecked] = useState([]);

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
        />
    )
}

export default CadastroInputs;