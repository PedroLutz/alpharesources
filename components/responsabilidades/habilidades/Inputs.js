import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";
import styles from '../../../styles/modules/members.module.css'

const CadastroInputs = ({ obj, objSetter, funcao, tipo, setExibirModal }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const [nomesFuncoes, setNomesFuncoes] = useState([]);
    const camposRef = useRef({
        funcao: null,
        area: null,
        item: null,
        habilidade: null,
        nivel_atual: null,
        nivel_min: null,
        acao: null
    })
    const { isAdmin } = useContext(AuthContext);

    const fetchAreas = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    }

    const fetchFuncoes = async () => {
        const data = await fetchData('responsabilidades/funcoes/get/nomes');
        setNomesFuncoes(data.funcoes);
    }

    useEffect(() => {
        fetchAreas();
        fetchFuncoes();
    }, []);

    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if(isNumber){
            value = value.replace(/[^0-9]/g, '');
        }
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
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

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
        setItensPorArea(itensDaArea);

        handleChange(e);
    };

    const validaDados = () => {
        const campos = { nivel_atual: obj.nivel_atual, nivel_min: obj.nivel_min };

        for (const [key, value] of Object.entries(campos)) {
            if (value < 0) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('valorNegativo');
                return true;
            }
            if (value > 5) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('maiorQueCinco');
                return true;
            }
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

    const handleSubmit = (e) => {
        const isInvalido = validaDados();
        if(isInvalido == true) return;

        if (funcao.funcao1) {
            funcao.funcao1();
        } else {
            funcao(e);
        }
    }

    return (
        <tr>
            <td>
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
            <td>
                <select
                    value={obj.item}
                    name='item'
                    onChange={(e) => handleChange(e, false)}
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
                <select
                    name="funcao"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.funcao}
                    ref={el => (camposRef.current.funcao = el)}
                >
                    <option defaultValue value="">Role</option>
                    {nomesFuncoes.map((funcao, index) => (
                        <option key={index} value={funcao.funcao}>{funcao.funcao}</option>
                    ))}
                </select>
            </td>
            <td>
                -
            </td>
            <td>
                <textarea
                    name="habilidade"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.habilidade}
                    placeholder="Skill"
                    ref={el => (camposRef.current.habilidade = el)}
                />
            </td>
            <td id={styles.tdNivel}>
                <textarea
                    name="nivel_atual"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.nivel_atual}
                    placeholder="Current level"
                    ref={el => (camposRef.current.nivel_atual = el)}
                />
            </td>
            <td id={styles.tdNivel}>
                <textarea
                    name="nivel_min"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.nivel_min}
                    placeholder="Desired level"
                    ref={el => (camposRef.current.nivel_min = el)}
                />
            </td>
            <td>
                <textarea
                    name="acao"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.acao}
                    placeholder="Development action"
                    ref={el => (camposRef.current.acao = el)}
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