import React, { useEffect, useState, useRef, useContext } from "react";
import { fetchData } from "../../functions/crud";
import styles from '../../styles/modules/cronograma.module.css';
import { AuthContext } from "../../contexts/AuthContext";

const CadastroInputs = ({ tipo, obj, objSetter, funcoes, setExibirModal, gantt }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState({ notDp: [], dp: [] });
    const camposRef = useRef({
        item: null,
        area: null,
        inicio: null,
        termino: null,
        dp_item: null,
        dp_area: null,
        situacao: null,
    });
    const { isAdmin } = useContext(AuthContext);

    //funcao para inserir os dados dos inputs para o objeto
    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const checarValidezDosDados = async (item) => {
        const response = await fetch('/api/cronograma/checks/checkData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        const data = await response.json();
        return [data.invalido, data.problema];
    };

    //funcao para verificar entre diversos casos para validar os dados
    const validaDados = async () => {
        let camposConsiderados;
        if (tipo === 'update' || tipo === 'updatemonitoring') {
            camposConsiderados = {
                inicio: obj.inicio,
                termino: obj.termino,
                situacao: obj.situacao
            }
        } else if (tipo === 'cadastro') {
            camposConsiderados = {
                area: obj.area,
                item: obj.item,
                inicio: obj.inicio,
                termino: obj.termino,
            }
        }

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
        var objEnviado = obj;
        if (obj.dp_area == undefined && obj.dp_item == undefined) {
            objEnviado = {
                ...obj,
                dp_area: '',
                dp_item: ''
            }
        }
        if (obj.inicio === "1970-01-01" && obj.termino === "1970-01-01") {
            objEnviado = {
                ...obj,
                inicio: '',
                termino: ''
            }
        }
        const datasNotOk = obj.inicio > obj.termino;
        if (datasNotOk) {
            setExibirModal('datasErradas');
            return true;
        }

        const [isInvalido, problema] = await checarValidezDosDados(objEnviado);
        if (isInvalido) {
            setExibirModal(problema);
            return true;
        }
        if (obj.dp_area && !obj.dp_item) {
            setExibirModal('depFaltando')
            return true;
        }
    }


    //funcao para atualizar os itens no select apos a selecao de uma area (seja dp ou nao)
    const handleAreaChange = (e, isDp) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS
            .filter(item => item.area === areaSelecionada).map(item => item.item);
        if (!isDp) {
            setItensPorArea({ ...itensPorArea, notDp: itensDaArea });
        } else {
            setItensPorArea({ ...itensPorArea, dp: itensDaArea });
        }
        handleChange(e);
    };


    //funcao para buscar os elementos da WBS para inserção nos selects
    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };


    //useEffect que roda apenas na primeira execucao
    useEffect(() => {
        fetchElementos();
    }, []);

    //useEffect que so executa quando obj.dp_area atualiza que apaga
    //o valor de dp_item caso dp_area for vazio
    useEffect(() => {
        if (obj.dp_area == '') {
            objSetter({
                ...obj,
                dp_item: ''
            })
        }
    }, [obj.dp_area]);


    //so executa quando o tipo for cadastro pq a atualizacao n altera nem a area nem o item
    //ent n pode mexer no obj
    useEffect(() => {
        if (tipo == 'cadastro') {
            objSetter({
                ...obj,
                item: ''
            })
        }
    }, [obj.area]);


    //funcao que valida os dados e executa ou nao a funcao de submit
    const handleSubmit = async () => {
        const isInvalido = await validaDados();
        if (isInvalido) return;
        funcoes?.funcao1();
    }

    return (
        <React.Fragment>
            {tipo === 'cadastro' && (
                <React.Fragment>
                    <td>
                        <select
                            name="area"
                            onChange={(e) => handleAreaChange(e, false)}
                            value={obj.area}
                            ref={el => (camposRef.current.area = el)}
                        >
                            <option value="" defaultValue>Area</option>
                            {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                                <option key={index} value={area}>{area}</option>
                            ))};
                        </select>
                    </td>
                    <td>
                        <select
                            name="item"
                            onChange={handleChange}
                            value={obj.item}
                            ref={el => (camposRef.current.item = el)}
                        >
                            <option value="" defaultValue>Item</option>
                            {itensPorArea.notDp.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </td>
                </React.Fragment>
            )}
            <td>
                <input
                    type="date"
                    name="inicio"
                    onChange={handleChange}
                    value={obj.inicio}
                    ref={el => (camposRef.current.inicio = el)}
                />
            </td>
            <td>
                <input
                    type="date"
                    name="termino"
                    onChange={handleChange}
                    value={obj.termino}
                    ref={el => (camposRef.current.termino = el)}
                />
            </td>
            {tipo !== 'updatemonitoring' ? (
                <React.Fragment>
                    <td>
                        <select
                            name="dp_area"
                            onChange={(e) => handleAreaChange(e, true)}
                            value={obj.dp_area}
                            ref={el => (camposRef.current.dp_area = el)}
                        >
                            <option value="" defaultValue>None</option>
                            {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                                <option key={index} value={area}>{area}</option>
                            ))};
                        </select>
                    </td>
                    <td>
                        <select
                            name="dp_item"
                            onChange={handleChange}
                            value={obj.dp_item}
                            ref={el => (camposRef.current.dp_item = el)}
                        >
                            <option value="" defaultValue>None</option>
                            {itensPorArea.dp.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </td>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <td>{obj.dp_area || '-'}</td>
                    <td>{obj.dp_item || '-'}</td>
                </React.Fragment>
            )}

            {gantt && (
                <td>
                    <select
                        name="situacao"
                        onChange={handleChange}
                        value={obj.situacao}
                        ref={el => (camposRef.current.situacao = el)}
                    >
                        <option value="iniciar">Starting</option>
                        <option value="em andamento">Executing</option>
                        <option value="concluida">Completed</option>
                    </select>
                </td>
            )}
            <td className={tipo !== 'cadastro' ? 'botoes_acoes' : undefined}>
                {tipo === 'cadastro' ? (
                    <button className={styles.botaoCadastro} disabled={!isAdmin} onClick={(e) => handleSubmit(e)}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcoes?.funcao2}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </React.Fragment>
    )
}

export default CadastroInputs;