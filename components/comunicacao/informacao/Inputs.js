import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [gruposENomes, setGruposENomes] = useState([]);
    const [stakeholdersDoGrupo, setStakeholdersDoGrupo] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const camposRef = useRef({
        grupo: null,
        stakeholder: null,
        informacao: null,
        metodo: null,
        frequencia: null,
        canal: null,
        responsavel: null,
        registro: null
    })
    const { isAdmin } = useContext(AuthContext);
    const isFirstRender = useRef(true);

    const fetchGruposENomes = async () => {
        const data = await fetchData('comunicacao/stakeholders/get/gruposENomes');
        setGruposENomes(data.gruposENomes);
    };

    const fetchMembros = async () => {
        const data = await fetchData('responsabilidades/membros/get/nomes');
        setNomesMembros(data.nomes);
    };

    useEffect(() => {
        fetchGruposENomes();
        fetchMembros();
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        objSetter({
            ...obj,
            stakeholder: ''
        });
    }, [obj.grupo]);

    useEffect(() => {
            if (obj.grupo != '') {
                const stakeholdersDoGrupo = gruposENomes.filter(item => item.grupo === obj.grupo).map(item => item.stakeholder);
                setStakeholdersDoGrupo(stakeholdersDoGrupo);
            } else {
                setStakeholdersDoGrupo([]);
            }
        }, [obj.grupo, gruposENomes]);

    const handleChange = (e) => {
        var { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const handleGrupoChange = (e) => {
        const grupoSelecionado = e.target.value;
        const stakeholdersDoGrupo = gruposENomes.filter(item => item.grupo === grupoSelecionado).map(item => item.stakeholder);
        setStakeholdersDoGrupo(stakeholdersDoGrupo);

        handleChange(e);
    };

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => value === null || value === "");
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
        <tr>
            <td>
                <select
                    name="grupo"
                    onChange={handleGrupoChange}
                    value={obj.grupo}
                    ref={el => (camposRef.current.grupo = el)}
                >
                    <option value="" defaultValue>Group</option>
                    {[...new Set(gruposENomes.map(stakeholder => stakeholder.grupo))].map((grupo, index) => (
                        <option key={index} value={grupo}>{grupo}</option>
                    ))};
                </select>
            </td>
            <td>
                <select
                    value={obj.stakeholder}
                    name='stakeholder'
                    onChange={handleChange}
                    ref={el => (camposRef.current.stakeholder = el)}

                >
                    <option value="" defaultValue>Stakeholder</option>
                    {stakeholdersDoGrupo.map((stakeholder, index) => (
                        <option key={index} value={stakeholder}>{stakeholder}</option>
                    ))}
                </select>
            </td>
            <td>
                <textarea
                    name="informacao"
                    onChange={handleChange}
                    value={obj.informacao}
                    placeholder="Communicated information"
                    ref={el => (camposRef.current.informacao = el)}
                />
            </td>
            <td>
                <textarea
                    name="metodo"
                    onChange={handleChange}
                    value={obj.metodo}
                    placeholder="Method"
                    ref={el => (camposRef.current.metodo = el)}
                />
            </td>
            <td>
                <select
                    value={obj.frequencia}
                    name='frequencia'
                    onChange={handleChange}
                    ref={el => (camposRef.current.frequencia = el)}
                >
                    <option value="" defaultValue>Frequency</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="On demand">On demand</option>
                </select>
            </td>
            <td>
                <textarea
                    name="canal"
                    onChange={handleChange}
                    value={obj.canal}
                    placeholder="Channel"
                    ref={el => (camposRef.current.canal = el)}
                />
            </td>
            <td>
                <select
                    name="responsavel"
                    onChange={handleChange}
                    value={obj.responsavel}
                    ref={el => (camposRef.current.responsavel = el)}
                >
                    <option defaultValue value="">Responsible</option>
                    <option value='Circunstancial'>Circunstancial</option>
                    {nomesMembros.map((membro, index) => (
                        <option key={index} value={membro.nome}>{membro.nome}</option>
                    ))}
                </select>
            </td>
            <td>
                <textarea
                    name="registro"
                    onChange={handleChange}
                    value={obj.registro}
                    placeholder="Record"
                    ref={el => (camposRef.current.registro = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isAdmin}>Add new</button>
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