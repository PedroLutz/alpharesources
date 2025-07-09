import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../../functions/crud";
import { AuthContext } from "../../../../contexts/AuthContext";
import styles from '../../../../styles/modules/comunicacao.module.css'

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const [gruposENomes, setGruposENomes] = useState([]);
    const [stakeholdersDoGrupo, setStakeholdersDoGrupo] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const [verOpcaoCustom, setVerOpcaoCustom] = useState(false);
    const camposRef = useRef({
        grupo: null,
        stakeholder: null,
        informacao: null,
        metodo: null,
        frequencia: null,
        canal: null,
        responsavel: null,
        registro: null,
        feedback: null,
        acao: null
    })
    const { isAdmin } = useContext(AuthContext);
    const isFirstRender = useRef(true);

    //funcao que busca os grupos e nomes dos stakeholders
    const fetchGruposENomes = async () => {
        const data = await fetchData('comunicacao/stakeholders/get/gruposENomes');
        setGruposENomes(data.gruposENomes);
    };

    //funcao que busca os nomes dos membros
    const fetchMembros = async () => {
        const data = await fetchData('responsabilidades/membros/get/nomes');
        setNomesMembros(data.nomes);
    };

    //useEffect que roda na primeira render, e verifica se o campo obj.frequencia tem algum valor
    //se esse valor for diferente dos preestabelecidos e nao for vazio, inicia o componente mostrando o input de opcao customizada
    useEffect(() => {
        const opcoesPreEstabelecidas = ["Daily", "Weekly", "Monthly", "On demand"];
        if (obj.frequencia && !opcoesPreEstabelecidas.includes(obj.frequencia)) {
            setVerOpcaoCustom(true);
        }

        fetchGruposENomes();
        fetchMembros();
    }, []);

    //useEffect que so roda quando obj.grupo atualiza, que limpa o valor de stakeholder
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

    //funcao que insere os dados no obj
    const handleChange = (e) => {
        var { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    //funcao para atualizar a frequencia, mostrando o input de opcao custom caso
    //a opcao selecionada seja a de valor customizado
    const handleFrequenciaChange = (e) => {
        const valorSelecionado = e.target.value;
        if (valorSelecionado === 'custom') {
            setVerOpcaoCustom(true);
            e.target.value = '';
            handleChange(e);
        } else {
            setVerOpcaoCustom(false);
            handleChange(e);
        }
    }

    useEffect(() => {
        if(obj.grupo != ''){
            const stakeholdersDoGrupo = gruposENomes.filter(item => item.grupo === obj.grupo).map(item => item.stakeholder);
            setStakeholdersDoGrupo(stakeholdersDoGrupo);
        }
    }, [obj.grupo, gruposENomes])


    //funcao para atualizar o grupo, inserindo em stakeholdersDoGrupo os stakeholders pertencentes ao grupo selecionado
    const handleGrupoChange = (e) => {
        const grupoSelecionado = e.target.value;
        const stakeholdersDoGrupo = gruposENomes.filter(item => item.grupo === grupoSelecionado).map(item => item.stakeholder);
        setStakeholdersDoGrupo(stakeholdersDoGrupo);

        handleChange(e);
    };


    const validaDados = () => {
        if(funcoes?.isStakeholderCadastrado?.(obj.grupo, obj.stakeholder) ?? false){
            camposRef.current.stakeholder.classList.add('campo-vazio');
            setExibirModal('stakeholderRepetido');
            return true;
        }

        const camposConsiderados = { ...obj };
        delete camposConsiderados.feedback;
        delete camposConsiderados.acao;
        delete camposConsiderados.registro;
        const camposVazios = Object.entries(camposConsiderados)
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

    const handleSubmit = async () => {
        const isInvalido = validaDados();
        if(isInvalido) return;
        await funcoes?.enviar();
        setVerOpcaoCustom(false);
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
            <td id={styles.infoTdInfo}>
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
            <td id={verOpcaoCustom ? styles.infoTdFrequencia : ''}>
                <select
                    value={obj.frequencia}
                    name='frequencia'
                    onChange={handleFrequenciaChange}
                    ref={el => (camposRef.current.frequencia = el)}
                >
                    <option value="" name='default' defaultValue>Frequency</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="On demand">On demand</option>
                    <option value="custom">Other option...</option>
                </select>
                {verOpcaoCustom && (
                    <input type="text"
                        value={obj.frequencia}
                        placeholder="New frequency"
                        name='frequencia'
                        onChange={handleChange} />
                )}
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
            <td>
                <textarea
                    name="feedback"
                    onChange={handleChange}
                    value={obj.feedback}
                    placeholder="Feedback"
                    ref={el => (camposRef.current.feedback = el)}
                />
            </td>
            <td>
                <textarea
                    name="acao"
                    onChange={handleChange}
                    value={obj.acao}
                    placeholder="Action Taken"
                    ref={el => (camposRef.current.acao = el)}
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