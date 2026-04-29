import { useEffect, useState, useRef } from "react";
import usePerm from "../../../../../hooks/usePerm";
import useAuth from "../../../../../hooks/useAuth";
import React from "react";
import { handleFetch } from "../../../../../functions/crud_s";
import styles from '../../../../../styles/modules/comunicacao.module.css'

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const { token } = useAuth();
    const { isEditor } = usePerm();
    const [stakeholders, setStakeholders] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [grupoSelecionado, setGrupoSelecionado] = useState('');
    const [stakeholdersDoGrupo, setStakeholdersDoGrupo] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const [verOpcaoCustom, setVerOpcaoCustom] = useState(false);
    const camposRef = useRef({
        grupo: null,
        stakeholder_id: null,
        information: null,
        method: null,
        frequency: null,
        channel: null,
        responsible_id: null,
        register: null,
        feedback: null,
        action: null
    })

    //funcao que busca os grupos e nomes dos stakeholders

    const atualizarStakeholdersDoGrupo = (group) => {
        const stakeholdersPorGrupo = stakeholders.filter(item => item.stakeholder_group.id == group);
        setStakeholdersDoGrupo(stakeholdersPorGrupo);
    }

    useEffect(() => {
        if (tipo == "update") {
            const item = stakeholders.find(item => item.id == obj?.stakeholder_id);
            if (item) {
                const grupoSelecionado = item?.stakeholder_group?.id;
                setGrupoSelecionado(grupoSelecionado);
            }
        }
    }, [obj?.stakeholder_id, stakeholders]);

    useEffect(() => {
        if (grupoSelecionado != '') {
            atualizarStakeholdersDoGrupo(grupoSelecionado);
        } else {
            setStakeholdersDoGrupo(stakeholders);
        }
    }, [grupoSelecionado, stakeholders]);

    useEffect(() => {
        setGrupos([...new Map(
            stakeholders
                .map(item => [
                    item.stakeholder_group.id,
                    { id: item.stakeholder_group.id, name: item.stakeholder_group.group }])
        ).values()
        ]);
        setStakeholdersDoGrupo(stakeholders);
    }, [stakeholders]);


    //so executa quando o tipo for cadastro pq a atualizacao n altera nem a area nem o item
    //ent n pode mexer no obj
    useEffect(() => {
        if (tipo == 'cadastro') {
            objSetter({
                ...obj,
                stakeholder_id: ''
            })
        }
    }, [grupoSelecionado]);

    const handleGrupoChange = (e) => {
        const grupoSelecionado = e.target.value;
        objSetter({ ...obj, stakeholder_id: "" });
        atualizarStakeholdersDoGrupo(grupoSelecionado);
        setGrupoSelecionado(grupoSelecionado);
        camposRef.current.grupo.classList.remove('campo-vazio');
    };

    //funcao para buscar os elementos da WBS para inserção nos selects
    const fetchGruposENomes = async () => {
        var stakeholders;
        try {
            const data = await handleFetch({
                table: 'stakeholder',
                query: 'with_groups',
                token
            })
            stakeholders = data?.data ?? [];
        } finally {
            setGrupos([...new Map(
                stakeholders
                    .map(item => [
                        item.stakeholder_group.id,
                        { id: item.stakeholder_group.id, name: item.stakeholder_group.group }])
            ).values()
            ]);
            setStakeholders(stakeholders);
        }
    }

    //funcao que busca os nomes dos membros
    const fetchMembros = async () => {
        const data = await handleFetch({
            table: 'member',
            query: 'names',
            token
        })
        setNomesMembros(data.data);
    };

    //useEffect que roda na primeira render, e verifica se o campo obj.frequencia tem algum valor
    //se esse valor for diferente dos preestabelecidos e nao for vazio, inicia o componente mostrando o input de opcao customizada
    useEffect(() => {
        const opcoesPreEstabelecidas = ["Daily", "Weekly", "Monthly", "On demand"];
        if (obj.frequency && !opcoesPreEstabelecidas.includes(obj.frequency)) {
            setVerOpcaoCustom(true);
        }
        fetchGruposENomes();
        fetchMembros();
    }, [obj.frequency]);

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


    const validaDados = () => {
        const {feedback, action, register, ...camposConsiderados} = obj;
        const camposVazios = Object.keys(camposConsiderados)
            .filter(key => camposConsiderados[key] === null || camposConsiderados[key] === "")

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return false;
        }

        return true;
    }

    const handleSubmit = async () => {
        const isValid = validaDados();
        if (!isValid) return;
        await funcoes?.enviar();
        setVerOpcaoCustom(false);
        setGrupoSelecionado("");
    }

    return (
        <tr>
            <td className={styles.infoTdStakeholder}>
                <select
                    name="grupo"
                    onChange={handleGrupoChange}
                    value={grupoSelecionado}
                    ref={el => (camposRef.current.grupo = el)}
                >
                    <option value="" defaultValue>Group</option>
                    {grupos.map((grupo, index) => (
                        <option key={index} value={grupo.id}>{grupo.name}</option>
                    ))};
                </select>
            </td>
            <td className={styles.infoTdStakeholder}>
                <select
                    value={obj.stakeholder_id}
                    name='stakeholder_id'
                    onChange={handleChange}
                    ref={el => (camposRef.current.stakeholder_id = el)}

                >
                    <option value="" defaultValue>Stakeholder</option>
                    {stakeholdersDoGrupo.map((stakeholder, index) => (
                        <option key={index} value={stakeholder.id}>{stakeholder.stakeholder}</option>
                    ))}
                </select>
            </td>
            <td className={styles.infoTdInfo}>
                <textarea
                    name="information"
                    onChange={handleChange}
                    value={obj.information}
                    placeholder="Communicated information"
                    ref={el => (camposRef.current.information = el)}
                />
            </td>
            <td>
                <textarea
                    name="method"
                    onChange={handleChange}
                    value={obj.method}
                    placeholder="Method"
                    ref={el => (camposRef.current.method = el)}
                />
            </td>
            <td className={styles.infoTdFrequencia}>
                <select
                    className={verOpcaoCustom && styles.infoTdFrequenciaSelect}
                    value={obj.frequency}
                    name='frequency'
                    onChange={handleFrequenciaChange}
                    ref={el => (camposRef.current.frequency = el)}
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
                        value={obj.frequency}
                        placeholder="New frequency"
                        name='frequency'
                        onChange={handleChange} />
                )}
            </td>
            <td>
                <textarea
                    name="channel"
                    onChange={handleChange}
                    value={obj.channel}
                    placeholder="Channel"
                    ref={el => (camposRef.current.channel = el)}
                />
            </td>
            <td>
                <select
                    name="responsible_id"
                    onChange={handleChange}
                    value={obj.responsible_id}
                    ref={el => (camposRef.current.responsible_id = el)}
                >
                    <option defaultValue value="">Responsible</option>
                    <option value={-1}>Circunstancial</option>
                    {nomesMembros.map((membro, index) => (
                        <option key={index} value={membro.id}>{membro.name}</option>
                    ))}
                </select>
            </td>
            <td>
                <textarea
                    name="register"
                    onChange={handleChange}
                    value={obj.register}
                    placeholder="Record"
                    ref={el => (camposRef.current.register = el)}
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
                    name="action"
                    onChange={handleChange}
                    value={obj.action}
                    placeholder="Action Taken"
                    ref={el => (camposRef.current.action = el)}
                />
            </td>
            <td className={tipo === 'update' && 'botoes_acoes'}>
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