import React, { useEffect, useState, useRef, useContext } from "react";
import { handleFetch } from "../../../functions/crud_s";
import styles from '../../../styles/modules/cronograma.module.css';
import { cleanForm, jsDateToEuDate, euDateToIsoDate, euDateToJsDate } from '../../../functions/general';
import useAuth from "../../../hooks/useAuth";

const CadastroInputs = ({ tipo, obj, objSetter, funcoes, setExibirModal, gantt, loaded, disabled }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [areas, setAreas] = useState([]);
    const [areasDp, setAreasDp] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [areaSelecionadaDp, setAreaSelecionadaDp] = useState('');
    const [itensDaArea, setItensDaArea] = useState([]);
    const [itensDaAreaDp, setItensDaAreaDp] = useState([]);
    const camposRef = useRef({
        item: null,
        area: null,
        start: null,
        end: null,
        dp_item: null,
        dp_area: null,
        status: null,
    });
    const { token } = useAuth();

    //funcao para inserir os dados dos inputs para o objeto
    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
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
                area: areaSelecionada,
                item: obj.item_id,
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
        if (obj.start === "1970-01-01" && obj.end === "1970-01-01") {
            objEnviado = {
                ...obj,
                start: '',
                end: ''
            }
        }
        if (obj.start > obj.end) {
            setExibirModal('datasErradas');
            camposRef.current.end.classList.add('campo-vazio');
            return true;
        }

        var depData;
        if(tipo != 'updatemonitoring'){
            depData = funcoes?.findGanttByItemId(objEnviado.dp_item)
        } else {
            depData = funcoes?.findGanttById(objEnviado.dependency_id);
        }
        if (depData?.gantt_data[0]?.end > objEnviado.start) {
            camposRef.current.dp_item?.classList.add('campo-vazio');
            camposRef.current.dp_area?.classList.add('campo-vazio');
            camposRef.current.start?.classList.add('campo-vazio');
            camposRef.current.end?.classList.add('campo-vazio');
            setExibirModal('dpNotOkay');
            return true;
        }
        if (areaSelecionadaDp && !obj.dp_item) {
            setExibirModal('depFaltando');
            camposRef.current.dp_item.classList.add('campo-vazio');
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

    //useEffect que roda apenas na primeira execucao
    useEffect(() => {
        fetchElementos();
    }, []);

    useEffect(() => {
        if (loaded == true) {
            setAreas([...new Map(
                elementosWBS
                    .filter(item => funcoes?.checkAreaDisponivel(item.wbs_area.id, item.id, false))
                    .map(item => [
                        item.wbs_area.id,
                        { id: item.wbs_area.id, name: item.wbs_area.name }])
            ).values()
            ]);
            setAreasDp([...new Map(
                elementosWBS
                    .filter(item => funcoes?.checkAreaDisponivel(item.wbs_area.id, item.id, true))
                    .map(item => [
                        item.wbs_area.id,
                        { id: item.wbs_area.id, name: item.wbs_area.name }])
            ).values()
            ]);
            setItensDaArea([]);
            setItensDaAreaDp([]);
        }

    }, [loaded, elementosWBS]);

    useEffect(() => {
        if (obj?.dependency_id !== "" && tipo !== 'updatemonitoring') {
            const depItem = funcoes?.findGanttById(obj.dependency_id);
            if (depItem) {
                const areaSelecionada = depItem.wbs_item.wbs_area.id;
                setAreaSelecionadaDp(areaSelecionada);
                atualizarItensPorArea(areaSelecionada, setItensDaAreaDp, true);
                objSetter({
                    ...obj,
                    dp_item: funcoes?.findGanttById(obj.dependency_id).wbs_item.id
                })
            }
        }
    }, [obj?.dependency_id, elementosWBS]);


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

    const handleAreaChange = (e, isDp) => {
        const areaSelecionada = e.target.value;
        if (isDp) {
            objSetter({ ...obj, dp_item: "" });
            atualizarItensPorArea(areaSelecionada, setItensDaAreaDp, isDp);
            setAreaSelecionadaDp(areaSelecionada);
            camposRef.current.dp_area.classList.remove('campo-vazio');
        } else {
            objSetter({ ...obj, item_id: "" });
            atualizarItensPorArea(areaSelecionada, setItensDaArea, isDp);
            setAreaSelecionada(areaSelecionada);
            camposRef.current.area.classList.remove('campo-vazio');
        }
    };

    //funcao para buscar os elementos da WBS para inserção nos selects
    const fetchElementos = async () => {
        var elementos;
        try {
            const data = await handleFetch({
                table: 'wbs_item',
                query: 'with_areas',
                token
            })
            elementos = data?.data ?? [];
        } finally {
            if (tipo != 'updatemonitoring') {
                setAreas([...new Map(
                    elementos
                        .filter(item => funcoes?.checkAreaDisponivel(item.wbs_area.id, item.id, false))
                        .map(item => [
                            item.wbs_area.id,
                            { id: item.wbs_area.id, name: item.wbs_area.name }])
                ).values()
                ]);
                setAreasDp([...new Map(
                    elementos
                        .filter(item => funcoes?.checkAreaDisponivel(item.wbs_area.id, item.id, true))
                        .map(item => [
                            item.wbs_area.id,
                            { id: item.wbs_area.id, name: item.wbs_area.name }])
                ).values()
                ]);
            }

            setElementosWBS(elementos);
        }
    }


    //funcao que valida os dados e executa ou nao a funcao de submit
    const handleSubmit = async () => {
        funcoes?.setLoading(true);
        const isInvalido = await validaDados();
        if (isInvalido) { funcoes?.setLoading(false); return; }
        funcoes?.enviar();
        setAreaSelecionada('');
        setAreaSelecionadaDp('');
        Object.values(camposRef.current).forEach(el => {
            if (el) el.classList.remove('campo-vazio')
        })
        funcoes?.setLoading(false);
    }

    return (
        <React.Fragment>
            {tipo === 'cadastro' && (
                <React.Fragment>
                    <td>
                        <select
                            name="area"
                            onChange={(e) => handleAreaChange(e, false)}
                            value={areaSelecionada || ''}
                            ref={el => (camposRef.current.area = el)}
                        >
                            <option value="" defaultValue>Area</option>
                            {areas.map((area, index) => (
                                <option key={index} value={area.id}>{area.name}</option>
                            ))}
                        </select>
                    </td>
                    <td>
                        <select
                            name="item_id"
                            onChange={handleChange}
                            value={obj.item_id || ''}
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
                    value={obj.start || ''}
                    ref={el => (camposRef.current.start = el)}
                />
            </td>
            <td>
                <input
                    type="date"
                    name="end"
                    onChange={handleChange}
                    value={obj.end || ''}
                    ref={el => (camposRef.current.end = el)}
                />
            </td>
            {tipo !== 'updatemonitoring' ? (
                <React.Fragment>
                    <td>
                        <select
                            name="dp_area"
                            onChange={(e) => handleAreaChange(e, true)}
                            value={areaSelecionadaDp || ''}
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
                            value={obj.dp_item || ''}
                            ref={el => (camposRef.current.dp_item = el)}
                        >
                            <option value="" defaultValue>None</option>
                            {itensDaAreaDp.map((item, index) => (
                                <option key={index} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </td>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <td>{obj.dependency_id ? funcoes?.findGanttById(obj.dependency_id).wbs_item.wbs_area.name : '-'}</td>
                    <td>{obj.dependency_id ? funcoes?.findGanttById(obj.dependency_id).wbs_item .name : '-'}</td>
                </React.Fragment>
            )}

            {gantt && (
                <td>
                    <select
                        name="status"
                        onChange={handleChange}
                        value={obj.status || 'start'}
                        ref={el => (camposRef.current.status = el)}
                    >
                        <option value="start">Starting</option>
                        <option value="executing">Executing</option>
                        <option value="complete">Completed</option>
                    </select>
                </td>
            )}
            <td className={tipo !== 'cadastro' ? 'botoes_acoes' : undefined}>
                {tipo === 'cadastro' ? (
                    <button className={styles.botaoCadastro} onClick={(e) => handleSubmit(e)} disabled={disabled}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit} disabled={disabled}>✔️</button>
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </React.Fragment>
    )
}

export default CadastroInputs;