import { useEffect, useState, useRef } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [nomesStakeholders, setNomesStakeholders] = useState([]);
    const camposRef = useRef({
        stakeholder: null,
        informacao: null,
        timing: null,
        check: null
    })

    const fetchStakeholders = async () => {
        const data = await fetchData('stakeholders/get/stakeholderNames');
        setNomesStakeholders(data.stakeholders);
    };

    useEffect(() => {
        fetchStakeholders();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const handleCheck = (e) => {
        const { name, checked } = e.target;
        objSetter({
            ...obj,
            [name]: checked,
        });
    }

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => value === null);
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    const validaDados = () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);
        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });
            setEmptyFields(camposVazios);
            checkDados('inputsVazios');
            return true;
        }
    }

    const handleSubmit = (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            !isInvalido && funcao(e);
        }
    }

    return (
        <React.Fragment>
            {tipo != 'update' && (
                <td>

                    <select
                        name="stakeholder"
                        onChange={handleChange}
                        value={obj.stakeholder}
                    >
                        <option value="" disabled>Stakeholder</option>
                        {[...new Set(nomesStakeholders.map(item => item.name))].map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))};
                    </select>
                </td>
            )}
            <td>
                <input
                    name="informacao"
                    onChange={handleChange}
                    value={obj.informacao}
                    placeholder="Information"
                    ref={el => (camposRef.current.informacao = el)}
                />
            </td>
            <td>
                <input
                    name="timing"
                    onChange={handleChange}
                    value={obj.timing}
                    placeholder="Timing"
                    ref={el => (camposRef.current.timing = el)}
                />
            </td>
            
            <td>
            {tipo == 'update' ? (
                <input
                type="checkbox"
                name="check"
                onChange={handleCheck}
                checked={obj.check}
                ref={el => (camposRef.current.check = el)}
            />
            ) : (
                '-'
            )}
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcao.funcao2}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </React.Fragment>
    )
}

export default CadastroInputs;