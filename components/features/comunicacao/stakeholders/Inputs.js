import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../../functions/crud";
import { AuthContext } from "../../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const [nomesStakeholders, setNomesStakeholders] = useState([]);
    const camposRef = useRef({
        grupo: null,
        stakeholder: null,
        influencia: null,
        impacto: null,
        poder: null,
        interesse: null,
        expectativas: null,
        requisitos: null,
        engajamento_positivo: null,
        engajamento_negativo: null
    })
    const { isAdmin } = useContext(AuthContext);

    //funcao que busca os grupos de stakeholders
    const fetchStakeholders = async () => {
        const data = await fetchData('comunicacao/stakeholderGroups/get/stakeholderGroupsNames');
        setNomesStakeholders(data.stakeholderGroups);
    };      

    //useEffect que só roda na primeira render
    useEffect(() => {
        fetchStakeholders();
    }, []);

    //funcao que insere os dados no obj
    const handleChange = (e) => {
        var { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    //funcao para validar os dados e inserir no modal o texto de aviso
    const validaDados = () => {
        if(funcoes?.isStakeholderCadastrado?.(obj.grupo, obj.stakeholder) ?? false){
            camposRef.current.stakeholder.classList.add('campo-vazio');
            setExibirModal('stakeholderRepetido');
            return true;
        }
        const camposVazios = Object.entries(obj)
        .filter(([key, value]) => value === null || value === "")
        .map(([key]) => key);

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });
            setExibirModal('inputsVazios');
            return true;
        }

        return false;
    }

    //funcao que, caso os dados sejam validos, executa a funcao de submit
    const handleSubmit = () => {
        const isInvalido = validaDados();
        if(isInvalido) return;
        funcoes?.enviar();
    }

    return (
        <tr>
            <td>

                <select
                    name="grupo"
                    onChange={handleChange}
                    value={obj.grupo}
                    ref={el => (camposRef.current.grupo = el)}
                >
                    <option defaultValue value=''>Stakeholder Group</option>
                    {[...new Set(nomesStakeholders.map(item => item.grupo))].map((grupo, index) => (
                        <option key={index} value={grupo}>{grupo}</option>
                    ))};
                </select>
            </td>
            <td>
                <textarea
                    name="stakeholder"
                    onChange={handleChange}
                    value={obj.stakeholder}
                    placeholder="Stakeholder"
                    ref={el => (camposRef.current.stakeholder = el)}
                />
            </td>
            <td>
                <select
                    value={obj.influencia}
                    name='influencia'
                    onChange={handleChange}
                    ref={el => (camposRef.current.influencia = el)} >
                    <option value="" defaultValue>Influence</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.impacto}
                    name='impacto'
                    onChange={handleChange}
                    ref={el => (camposRef.current.impacto = el)} >
                    <option value="" defaultValue>Impact</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.poder}
                    name='poder'
                    onChange={handleChange}
                    ref={el => (camposRef.current.poder = el)} >
                    <option value="" defaultValue>Power</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.interesse}
                    name='interesse'
                    onChange={handleChange}
                    ref={el => (camposRef.current.interesse = el)} >
                    <option value="" defaultValue>Interest</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                <textarea
                    name="expectativas"
                    onChange={handleChange}
                    value={obj.expectativas}
                    placeholder="Expectations"
                    ref={el => (camposRef.current.expectativas = el)}
                />
            </td>
            <td>
                <textarea
                    name="requisitos"
                    onChange={handleChange}
                    value={obj.requisitos}
                    placeholder="Requisites"
                    ref={el => (camposRef.current.requisitos = el)}
                />
            </td>
            <td>
                <textarea
                    name="engajamento_positivo"
                    onChange={handleChange}
                    value={obj.engajamento_positivo}
                    placeholder="Positive Engagement"
                    ref={el => (camposRef.current.engajamento_positivo = el)}
                />
            </td>
            <td>
                <textarea
                    name="engajamento_negativo"
                    onChange={handleChange}
                    value={obj.engajamento_negativo}
                    placeholder="Negative Engagement"
                    ref={el => (camposRef.current.engajamento_negativo = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isAdmin}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default CadastroInputs;