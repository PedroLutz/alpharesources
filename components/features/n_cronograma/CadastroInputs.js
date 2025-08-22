import React, { useEffect, useState, useRef, useContext } from "react";
import { handleFetch } from "../../../functions/crud_s";
import styles from '../../../styles/modules/cronograma.module.css';
import useAuth from "../../../hooks/useAuth";

const CadastroInputs = ({ tipo, obj, objSetter, funcoes, setExibirModal, gantt }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [areas, setAreas] = useState([]);
    const [areasDp, setAreasDp] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState();
    const [areaSelecionadaDp, setAreaSelecionadaDp] = useState();
    const [itensDaArea, setItensDaArea] = useState([]);
    const [itensDaAreaDp, setItensDaAreaDp] = useState([]);
    const camposRef = useRef({
        item: null,
        area: null,
        start: null,
        end: null,
        dp_item: null,
        dp_area: null,
        situacao: null,
    });
    const {token} = useAuth();

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
                start: obj.start,
                end: obj.end,
                situacao: obj.situacao
            }
        } else if (tipo === 'cadastro') {
            camposConsiderados = {
                area: obj.area,
                item: obj.item,
                start: obj.start,
                end: obj.end,
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
        if (obj.start === "1970-01-01" && obj.end === "1970-01-01") {
            objEnviado = {
                ...obj,
                start: '',
                end: ''
            }
        }
        if (obj.start > obj.end) {
            setExibirModal('datasErradas');
            return true;
        }

        const [isInvalido, problema] = await checarValidezDosDados(objEnviado);
        if (isInvalido) {
            setExibirModal(problema);
            return true;
        }
        if (obj.dp_area && !obj.dp_item) {
            setExibirModal('depFaltando');
            return true;
        }
    }

    const atualizarItensPorArea = (area, setter, isDp) => {
            const itensDaArea = elementosWBS.filter(item => item.wbs_area.id == area 
                && funcoes?.checkItemDisponivel(item.id, isDp));
            setter(itensDaArea);
        }
    
        useEffect(() => {
            if (areaSelecionada != '') {
                atualizarItensPorArea(areaSelecionada, setItensDaArea, false);
            }
        }, [areaSelecionada, elementosWBS]);
    
        const handleAreaChange = (e, isDp) => {
            const areaSelecionada = e.target.value;
            if(isDp) {
                objSetter({...obj, dp_item_id: ""});
                atualizarItensPorArea(areaSelecionada, setItensDaAreaDp, isDp);
                setAreaSelecionadaDp(areaSelecionada);
            } else {
                objSetter({...obj, item_id: ""});
                atualizarItensPorArea(areaSelecionada, setItensDaArea, isDp);
                setAreaSelecionada(areaSelecionada);
            }
        };


    //funcao para buscar os elementos da WBS para inserção nos selects
    const fetchElementos = async () => {
            const data = await handleFetch({
                table: 'wbs_item',
                query: 'with_areas',
                token
            })
            const elementos = data.data;
            setAreas([...new Map(
                    elementos
                    .filter(item => funcoes?.checkAreaDisponivel(item.wbs_area.id, false))
                    .map(item => [
                        item.wbs_area.id, 
                        { id: item.wbs_area.id, name: item.wbs_area.name }])
                ).values()
            ]);
            setAreasDp([...new Map(
                    elementos
                    .filter(item => funcoes?.checkAreaDisponivel(item.wbs_area.id, true))
                    .map(item => [
                        item.wbs_area.id, 
                        { id: item.wbs_area.id, name: item.wbs_area.name }])
                ).values()
            ]);
            setElementosWBS(elementos);
    }


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
        funcoes?.setLoading(true);
        const isInvalido = await validaDados();
        funcoes?.setLoading(false);
        if (isInvalido) return;
        funcoes?.enviar();
    }

    return (
        <React.Fragment>
            {tipo === 'cadastro' && (
                <React.Fragment>
                    <td>
                        <select
                            name="area"
                            onChange={(e) => handleAreaChange(e, false)}
                            value={areaSelecionada}
                            ref={el => (camposRef.current.area = el)}
                        >
                            <option value="" defaultValue>Area</option>
                            {areas.map((area, index) => (
                                <option key={index} value={area.id}>{area.name}</option>
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
                            {itensDaArea.map((item, index) => (
                                <option key={index} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </td>
                </React.Fragment>
            )}
            <td>
                <input
                    type="date"
                    name="start"
                    onChange={handleChange}
                    value={obj.start}
                    ref={el => (camposRef.current.start = el)}
                />
            </td>
            <td>
                <input
                    type="date"
                    name="end"
                    onChange={handleChange}
                    value={obj.end}
                    ref={el => (camposRef.current.end = el)}
                />
            </td>
            {tipo !== 'updatemonitoring' ? (
                <React.Fragment>
                    <td>
                        <select
                            name="dp_area"
                            onChange={(e) => handleAreaChange(e, true)}
                            value={areaSelecionadaDp}
                            ref={el => (camposRef.current.dp_area = el)}
                        >
                            <option value="" defaultValue>None</option>
                            {areasDp.map((area, index) => (
                                <option key={index} value={area.id}>{area.name}</option>
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
                            {itensDaAreaDp.map((item, index) => (
                                <option key={index} value={item.id}>{item.value}</option>
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
                    <button className={styles.botaoCadastro} onClick={(e) => handleSubmit(e)}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </React.Fragment>
    )
}

export default CadastroInputs;