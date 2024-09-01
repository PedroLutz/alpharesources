import { useEffect, useState, useRef } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const camposRef = useRef({
        name: null,
        involvement: null,
        influence: null,
        power: null,
        interest: null,
        expectations: null,
        requisites: null,
        information: null,
        method: null,
        timing: null,
        tools: null,
        responsible: null
    })

    const fetchMembros = async () => {
        const data = await fetchData('responsabilidades/membros/get/nomes');
        setNomesMembros(data.nomes);
    };

    useEffect(() => {
        fetchMembros();
    }, []);

    const generateMapping = (p, i) => {
        if(p === '' || i === ''){
            return '-';
        }
        if (p === "true" && i === "true") {
            return "Close Management";
        }
        if (p === "false" && i === "true") {
            return "Keep informed";
        }
        if (p === "true" && i === "false") {
            return "Keep satisfied";
        }
        if (p === "false" && i === "false") {
            return "Monitor";
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
        generateMapping(obj.power, obj.interest)
    };

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
        if(funcao.funcao1){
            !isInvalido && funcao.funcao1();
        } else {
            !isInvalido && funcao(e);
        }
    }

    return (
        <tr>
            <td>
                <input
                    name="name"
                    onChange={handleChange}
                    value={obj.name}
                    placeholder="Stakeholder"
                    ref={el => (camposRef.current.name = el)}
                />
            </td>
            <td>
                <input
                    name="involvement"
                    onChange={handleChange}
                    value={obj.involvement}
                    placeholder="Involvement"
                    ref={el => (camposRef.current.involvement = el)}
                />
            </td>
            <td>
                <input
                    name="influence"
                    onChange={handleChange}
                    value={obj.influence}
                    placeholder="Potencial Influence"
                    ref={el => (camposRef.current.influence = el)}
                />
            </td>
            <td>
                <select
                    name="power"
                    onChange={handleChange}
                    value={obj.power}
                    ref={el => (camposRef.current.power = el)}
                >
                    <option disabled value="">Power</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                <select
                    name="interest"
                    onChange={handleChange}
                    value={obj.interest}
                    ref={el => (camposRef.current.interest = el)}
                >
                    <option disabled value="">Interest</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                {generateMapping(obj.power, obj.interest)}
            </td>
            <td>
                <input
                    name="expectations"
                    onChange={handleChange}
                    value={obj.expectations}
                    placeholder="Expectations"
                    ref={el => (camposRef.current.expectations = el)}
                />
            </td>
            <td>
                <input
                    name="requisites"
                    onChange={handleChange}
                    value={obj.requisites}
                    placeholder="Requisites"
                    ref={el => (camposRef.current.requisites = el)}
                />
            </td>
            <td>
                <input
                    name="information"
                    onChange={handleChange}
                    value={obj.information}
                    placeholder="Information"
                    ref={el => (camposRef.current.information = el)}
                />
            </td>
            <td>
                <input
                    name="method"
                    onChange={handleChange}
                    value={obj.method}
                    placeholder="Method"
                    ref={el => (camposRef.current.method = el)}
                />
            </td>
            <td>
                <input
                    name="tools"
                    onChange={handleChange}
                    value={obj.tools}
                    placeholder="Tools"
                    ref={el => (camposRef.current.tools = el)}
                />
            </td>
            <td>
                <select
                    name="responsible"
                    onChange={handleChange}
                    value={obj.responsible}
                    ref={el => (camposRef.current.responsible = el)}>
                    <option disabled value="">Responsible</option>
                    <option value='Circunstancial'>Circunstancial</option>
                    {nomesMembros.map((membro, index) => (
                        <option key={index} value={membro.nome}>{membro.nome}</option>
                    ))}
                </select>
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
        </tr>
    )
}

export default CadastroInputs;