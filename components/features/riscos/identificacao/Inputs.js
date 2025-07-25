import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../../functions/crud";
import { AuthContext } from "../../../../contexts/AuthContext";
import styles from '../../../../styles/modules/risco.module.css'

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const camposRef = useRef({
        area: null,
        item: null,
        risco: null,
        classificacao: null,
        ehNegativo: null,
        efeito: null,
        causa: null,
        gatilho: null,
        dono: null
    })
    const {isAdmin} = useContext(AuthContext)

    const fetchMembros = async () => {
        const data = await fetchData('responsabilidades/membros/get/nomes');
        setNomesMembros(data.nomes);
    };
    
    useEffect(() => {
        fetchMembros();
    }, []);

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        objSetter({
            ...obj,
            item: ''
        });
    }, [obj.area]);

    const isFirstRender = useRef(true);

    useEffect(() => {
        fetchElementos();
    }, []);

    const atualizarItensPorArea = (area) => {
        const itensDaArea = elementosWBS.filter(item => item.area === area).map(item => item.item);
        setItensPorArea(itensDaArea);
    }

    useEffect(() => {
        if(obj.area != ''){
            atualizarItensPorArea(obj.area);
        }
    }, [obj.area, elementosWBS])

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        atualizarItensPorArea(areaSelecionada);
        handleChange(e);
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
        if(funcoes?.isRiscoCadastrado?.(obj.risco) ?? false){
            camposRef.current.risco.classList.add('campo-vazio');
            setExibirModal('riscoRepetido');
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

    const handleSubmit = () => {
        const isInvalido = validaDados();
        if(isInvalido == true) return;
        funcoes?.enviar();
    }

    return (
        <tr>
            <td className={styles.riscoTdArea}>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={obj.area}
                    ref={el => (camposRef.current.area = el)}
                    
                >
                    <option value="" defaultValue>Area</option>
                    {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                        <option key={index} value={area}>{area}</option>
                    ))};
                    <option value="Others">Others</option>
                </select>
            </td>
            <td className={styles.riscoTdItem}>
                <select
                    value={obj.item}
                    name='item'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.item = el)}
                >
                    <option value="" defaultValue>Item</option>
                    {itensPorArea.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                    <option value="Others">Others</option>
                </select>
            </td>
            <td>
                <textarea
                    name="risco"
                    onChange={handleChange}
                    value={obj.risco}
                    placeholder='Risk'
                    ref={el => (camposRef.current.risco = el)}
                    className={styles.risco_td_risco}
                />
            </td>
            <td>
                <select
                    name="classificacao"
                    onChange={handleChange}
                    value={obj.classificacao}
                    ref={el => (camposRef.current.classificacao = el)}
                    className={styles.risco_td_classificacao}
                >
                    <option defaultValue value="">Classification</option>
                    <option value='Normative'>Normative</option>
                    <option value='Technical'>Technical</option>
                    <option value='Financial'>Financial</option>
                    <option value='Managerial'>Managerial</option>
                </select>
            </td>
            <td>
                <select
                    name="ehNegativo"
                    onChange={handleChange}
                    value={obj.ehNegativo}
                    ref={el => (camposRef.current.ehNegativo = el)}
                    className={styles.risco_td_ehNegativo}
                >
                    <option defaultValue value="">Category</option>
                    <option value={true}>Threat</option>
                    <option value={false}>Opportunity</option>
                </select>
            </td>
            <td>
                <textarea
                    name="efeito"
                    onChange={handleChange}
                    value={obj.efeito}
                    placeholder='Effect'
                    ref={el => (camposRef.current.efeito = el)}
                    className={styles.risco_td_efeito}
                />
            </td>
            <td>
                <textarea
                    name="causa"
                    onChange={handleChange}
                    value={obj.causa}
                    placeholder='Causes'
                    ref={el => (camposRef.current.causa = el)}
                />
            </td>
            <td>
                <textarea
                    name="gatilho"
                    onChange={handleChange}
                    value={obj.gatilho}
                    placeholder='Trigger'
                    ref={el => (camposRef.current.gatilho = el)}
                    className={styles.risco_td_gatilho}
                />
            </td>
            <td>
                <select
                    name="dono"
                    onChange={handleChange}
                    value={obj.dono}
                    placeholder='Owner'
                    ref={el => (camposRef.current.dono = el)}
                    className={styles.risco_td_dono}>
                        <option defaultValue value="">Responsible</option>
                        <option value='Circunstancial'>Circunstancial</option>
                        {nomesMembros.map((membro, index) => (
                            <option key={index} value={membro.nome}>{membro.nome}</option>
                        ))}
                    </select>
                
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