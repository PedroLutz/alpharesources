import { useEffect, useState, useRef } from "react";
import React from "react";
import { handleFetch } from "../../../../functions/crud_s";
import usePerm from "../../../../hooks/usePerm";
import useAuth from "../../../../hooks/useAuth";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const {isEditor} = usePerm();
    const {token} = useAuth();
    const [nomesStakeholders, setNomesStakeholders] = useState([]);
    const camposRef = useRef({
        group_id: null,
        stakeholder: null,
        influence: null,
        impact: null,
        power: null,
        interest: null,
        expectations: null,
        requisites: null,
        positive_eng: null,
        negative_eng: null
    })

    //funcao que busca os grupos de stakeholders
    const fetchStakeholders = async () => {
        const data = await handleFetch({
                        table: 'stakeholder_group',
                        query: 'groups_names',
                        token
                    });
        setNomesStakeholders(data.data);
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
        if(funcoes?.isStakeholderCadastrado?.(obj.group_id, obj.stakeholder) ?? false){
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
                    name="group_id"
                    onChange={handleChange}
                    value={obj.group_id}
                    ref={el => (camposRef.current.group_id = el)}
                >
                    <option defaultValue value=''>Stakeholder Group</option>
                    {nomesStakeholders.map((group, index) => (
                        <option key={index} value={group.id}>{group.group}</option>
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
                    value={obj.influence}
                    name='influence'
                    onChange={handleChange}
                    ref={el => (camposRef.current.influence = el)} >
                    <option value="" defaultValue>Influence</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.impact}
                    name='impact'
                    onChange={handleChange}
                    ref={el => (camposRef.current.impact = el)} >
                    <option value="" defaultValue>Impact</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.power}
                    name='power'
                    onChange={handleChange}
                    ref={el => (camposRef.current.power = el)} >
                    <option value="" defaultValue>Power</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.interest}
                    name='interest'
                    onChange={handleChange}
                    ref={el => (camposRef.current.interest = el)} >
                    <option value="" defaultValue>Interest</option>
                    <option value={true}>High</option>
                    <option value={false}>Low</option>
                </select>
            </td>
            <td>
                <textarea
                    name="expectations"
                    onChange={handleChange}
                    value={obj.expectations}
                    placeholder="Expectations"
                    ref={el => (camposRef.current.expectations = el)}
                />
            </td>
            <td>
                <textarea
                    name="requisites"
                    onChange={handleChange}
                    value={obj.requisites}
                    placeholder="Requisites"
                    ref={el => (camposRef.current.requisites = el)}
                />
            </td>
            <td>
                <textarea
                    name="positive_eng"
                    onChange={handleChange}
                    value={obj.positive_eng}
                    placeholder="Positive Engagement"
                    ref={el => (camposRef.current.positive_eng = el)}
                />
            </td>
            <td>
                <textarea
                    name="negative_eng"
                    onChange={handleChange}
                    value={obj.negative_eng}
                    placeholder="Negative Engagement"
                    ref={el => (camposRef.current.negative_eng = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isEditor}>Add new</button>
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