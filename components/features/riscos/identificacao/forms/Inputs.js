import { useEffect, useState, useRef } from "react";
import React from "react";
import styles from '../../../../../styles/modules/risco.module.css'
import usePerm from "../../../../../hooks/usePerm";
import { useIdentificacao } from "../data/IdentificacaoContext";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal, backgroundColor }) => {
    const { riscos, itensWBS, areasWBS, nomesMembros } = useIdentificacao();
    const {isEditor} = usePerm();
    const [itensPorArea, setItensPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const camposRef = useRef({
        area: null,
        item_id: null,
        owner_id: null,
        risk: null,
        classification: null,
        is_negative: null,
        effect: null,
        cause: null,
        trigger: null,
    })

    const isRiscoCadastrado = (risco) => {
        return riscos.some((r) => r.risk.trim().toLowerCase() === risco.trim().toLowerCase());
    }

    const atualizarItensPorArea = (area) => {
        const itensDaArea = itensWBS.filter(item => item.wbs_area.id == area);
        setItensPorArea(itensDaArea);
    }

    useEffect(() => {
        if (tipo == "update") {
            if (obj?.item_id !== '') {
                const item = itensWBS.find(item => item.id == obj?.item_id);
                if (item) {
                    const areaSelecionada = item?.wbs_area?.id ?? -1;
                    setAreaSelecionada(areaSelecionada);
                }
            } else {
                setAreaSelecionada(-1);
            }
        }
    }, [obj?.item_id, itensWBS]);

    //so executa quando o tipo for cadastro pq a atualizacao n altera nem a area nem o item
    //ent n pode mexer no obj
    useEffect(() => {
        if (tipo == 'cadastro') {
            objSetter({
                ...obj,
                item_id: ''
            })
        }
    }, [areaSelecionada]);

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        objSetter({ ...obj, item_id: "" });
        setAreaSelecionada(areaSelecionada);
        atualizarItensPorArea(areaSelecionada);
        camposRef.current.area.classList.remove('campo-vazio');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        if (tipo != 'update' && isRiscoCadastrado(obj.risk)) {
            camposRef.current.risco.classList.add('campo-vazio');
            setExibirModal('riscoRepetido');
            return false;
        }

        const camposVazios = Object.keys(obj).filter(key => obj[key] === null || obj[key] === "")

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return false;
        }
        return true;
    }

    const handleSubmit = () => {
        const isValid = validaDados();
        if (!isValid) return;
        funcoes?.enviar();
        setAreaSelecionada('');
    }

    return (
        <tr style={{backgroundColor}}>
            <td className={styles.riscoTdArea}>
                <select
                    name="area"
                    onChange={(e) => handleAreaChange(e, false)}
                    value={areaSelecionada || ''}
                    ref={el => (camposRef.current.area = el)}
                >
                    <option value="" defaultValue>Area</option>
                    {areasWBS.map((area, index) => (
                        <option key={index} value={area.id}>{area.name}</option>
                    ))}
                    <option value={-1}>Others</option>
                </select>
            </td>
            <td className={styles.riscoTdItem}>
                <select
                    name="item_id"
                    onChange={handleChange}
                    value={obj.item_id || ''}
                    ref={el => (camposRef.current.item = el)}
                >
                    <option value="" defaultValue>Item</option>
                    {itensPorArea.map((item, index) => (
                        <option key={index} value={item.id}>{item.name}</option>
                    ))}
                    <option value={-1}>Others</option>
                </select>
            </td>
            <td>
                <textarea
                    name="risk"
                    onChange={handleChange}
                    value={obj.risk}
                    placeholder='Risk'
                    ref={el => (camposRef.current.risk = el)}
                    className={styles.risco_td_risco}
                />
            </td>
            <td>
                <select
                    name="classification"
                    onChange={handleChange}
                    value={obj.classification}
                    ref={el => (camposRef.current.classification = el)}
                    className={styles.risco_td_classificacao}
                >
                    <option defaultValue value="">Classification</option>
                    <option value='normative'>Normative</option>
                    <option value='technical'>Technical</option>
                    <option value='financial'>Financial</option>
                    <option value='managerial'>Managerial</option>
                </select>
            </td>
            <td>
                <select
                    name="is_negative"
                    onChange={handleChange}
                    value={obj.is_negative}
                    ref={el => (camposRef.current.is_negative = el)}
                    className={styles.risco_td_ehNegativo}
                >
                    <option defaultValue value="">Category</option>
                    <option value={true}>Threat</option>
                    <option value={false}>Opportunity</option>
                </select>
            </td>
            <td>
                <textarea
                    name="effect"
                    onChange={handleChange}
                    value={obj.effect}
                    placeholder='Effect'
                    ref={el => (camposRef.current.effect = el)}
                    className={styles.risco_td_efeito}
                />
            </td>
            <td>
                <textarea
                    name="cause"
                    onChange={handleChange}
                    value={obj.cause}
                    placeholder='Causes'
                    ref={el => (camposRef.current.cause = el)}
                />
            </td>
            <td>
                <textarea
                    name="trigger"
                    onChange={handleChange}
                    value={obj.trigger}
                    placeholder='Trigger'
                    ref={el => (camposRef.current.trigger = el)}
                    className={styles.risco_td_gatilho}
                />
            </td>
            <td>
                <select
                    name="owner_id"
                    onChange={handleChange}
                    value={obj.owner_id}
                    ref={el => (camposRef.current.owner_id = el)}
                >
                    <option defaultValue value="">Responsible</option>
                    {nomesMembros.map((membro, index) => (
                        <option key={index} value={membro.id}>{membro.name}</option>
                    ))}
                    <option value={-1}>Circunstancial</option>
                </select>

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