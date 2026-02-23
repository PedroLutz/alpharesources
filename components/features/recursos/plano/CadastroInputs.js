import { useEffect, useState, useRef } from "react";
import React from "react";
import styles from '../../../../styles/modules/planoAquisicao.module.css'
import { handleFetch } from '../../../../functions/crud_s';
import useAuth from '../../../../hooks/useAuth';
import usePerm from "../../../../hooks/usePerm";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const [areaSelecionada, setAreaSelecionada] = useState("");
    const [recursoSelecionado, setRecursoSelecionado] = useState('');
    const [areas, setAreas] = useState([]);
    const [recursos, setRecursos] = useState([]);
    const [recursosPorArea, setRecursosPorArea] = useState([]);
    const camposRef = useRef({
        area: null,
        resource_id: null,
        method_a: null,
        plan_a: null,
        details_a: null,
        value_a: null,
        expected_date: null,
        critical_date: null,
        plan_b: null,
        method_b: null,
        value_b: null,
        details_b: null,
        plan_real: null,
        date_real: null,
        value_real: null
    });
    const isFirstRender = useRef(true);
    const { token } = useAuth();
    const { isEditor } = usePerm();

    const fetchAreas = async () => {
        const data = await handleFetch({
            table: 'wbs_area',
            query: 'all',
            token
        });
        setAreas(data.data);
    }

    //funcao para buscar os nome dos recursos
    const fetchRecursos = async () => {
        const data = await handleFetch({
            table: 'resource',
            query: 'resourcesAndAreas',
            token
        });
        setRecursos(data.data);
        setRecursosPorArea(data.data);
    };

    //useEffect que usa apenas na primeira render
    useEffect(() => {
        fetchRecursos();
        fetchAreas();
    }, []);

    const atualizarRecursosPorArea = (area) => {
        var recursosDaArea;
        if (area != -1) {
            recursosDaArea = recursos.filter(item => item.wbs_item?.wbs_area?.id == area);
        } else {
            recursosDaArea = recursos.filter(item => item.wbs_item == null);
        }
        setRecursosPorArea(recursosDaArea);
    }

    useEffect(() => {
        if (areaSelecionada != '') {
            atualizarRecursosPorArea(areaSelecionada, setRecursosPorArea);
        }
    }, [areaSelecionada, recursos]);

    useEffect(() => {
        if (tipo == "update") {
            if (obj?.resource?.id !== '') {
                const item = recursos.find(item => item.id == obj?.resource?.id);
                if (item) {
                    const areaSelecionada = item?.wbs_area?.id || -1;
                    setAreaSelecionada(areaSelecionada);
                    atualizarRecursosPorArea(areaSelecionada, setRecursosPorArea);
                    setRecursoSelecionado(item?.id);
                }
            } else {
                setAreaSelecionada(-1);
                atualizarRecursosPorArea(-1, setRecursosPorArea);
            }
        }
    }, [obj?.resource?.id, recursos]);

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        objSetter({ ...obj, resource_id: "" });
        setAreaSelecionada(areaSelecionada);
        atualizarRecursosPorArea(areaSelecionada, setRecursosPorArea);
        camposRef.current.area.classList.remove('campo-vazio');
    };

    //useEffect que so roda quando areaSelecionada eh atualizado, para apagar o valor de recurso no obj
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        objSetter({
            ...obj,
            resource_id: ''
        });
    }, [areaSelecionada]);

    //funcao geral para inserir os dados dos inputs no obj
    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if (name == "resource_id") {
            setRecursoSelecionado(value);
        } else {
            if (isNumber) {
                value = value.replace(/[^0-9.]/g, '');
            }
            objSetter({
                ...obj,
                [name]: value,
            });
        }
        e.target.classList.remove('campo-vazio');
    };

    //funcao para validar os dados do objeto
    const validaDados = () => {
        if (obj.expected_date > obj.critical_date) {
            camposRef.current.expected_date.classList.add('campo-vazio');
            camposRef.current.critical_date.classList.add('campo-vazio');
            setExibirModal('datasSemSentido');
            return false;
        }
        const {plan_real, value_real, date_real, ...camposConsiderados} = obj;
        camposConsiderados.resource_id = recursoSelecionado;
        const camposVazios = Object.keys(camposConsiderados).filter(
            key => camposConsiderados[key] === null || camposConsiderados[key] === ""
        );

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return false;
        }

        return true;
    };

    //funcao que chama validaDados, e se os dados estao ok, chama as funcoes de submit
    const handleSubmit = async () => {
        const isValid = validaDados();
        if (!isValid) return;

        const sentObj = {
            ...obj,
            resource_id: recursoSelecionado
        }
        funcoes?.enviar(sentObj);
        setAreaSelecionada('');
        setRecursoSelecionado('');
    };

    return (
        <tr className="linha-cadastro">
            <td className={styles.tdRecurso}>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={areaSelecionada || ""}
                    ref={el => (camposRef.current.area = el)}
                >
                    <option value="" defaultValue>Area</option>
                    {areas.map((area, index) => (
                        <option key={index} value={area.id}>{area.name}</option>
                    ))}
                    <option value={-1}>Others</option>
                </select>

                <select
                    style={{ marginTop: '0.3rem' }}
                    value={recursoSelecionado || ""}
                    name='resource_id'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.resource_id = el)}
                >
                    <option value="" defaultValue>Resource</option>
                    {recursosPorArea.map((item, index) => (
                        <option key={index} value={item.id}>{item.resource}</option>
                    ))}
                </select>
            </td>
            <td>
                <select
                    value={obj.method_a || ""}
                    name='method_a'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.method_a = el)} >
                    <option value="" defaultValue>Acquisition method</option>
                    <option value="purchase">Purchase</option>
                    <option value="rental">Rental</option>
                    <option value="borrowing">Borrowing</option>
                    <option value="outsourcing">Outsourcing</option>
                </select>
            </td>
            <td>
                <textarea type='text'
                    value={obj.plan_a || ""}
                    name='plan_a'
                    placeholder='Supplier'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.plan_a = el)} />
            </td>
            <td>
                <textarea type='text'
                    value={obj.details_a || ""}
                    name='details_a'
                    placeholder='Details'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.details_a = el)} />
            </td>
            <td className={styles.tdValor}>
                <input
                    value={obj.value_a || ""}
                    name='value_a'
                    placeholder='Value'
                    onChange={(e) => handleChange(e, true)}
                    min="0"
                    ref={el => (camposRef.current.value_a = el)} />
            </td>
            <td className={styles.tdDatas}>
                <input
                    value={obj.expected_date || ""}
                    name='expected_date'
                    type="date"
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.expected_date = el)} />
            </td>
            <td className={styles.tdDatas}>
                <input
                    value={obj.critical_date || ""}
                    name='critical_date'
                    type="date"
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.critical_date = el)} />
            </td>
            <td>
                <select
                    value={obj.method_b || ""}
                    name='method_b'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.method_b = el)} >
                    <option value="" defaultValue>Acquisition method</option>
                    <option value="purchase">Purchase</option>
                    <option value="rental">Rental</option>
                    <option value="borrowing">Borrowing</option>
                    <option value="outsourcing">Outsourcing</option>
                </select>
            </td>
            <td>
                <textarea type='text'
                    value={obj.plan_b || ""}
                    name='plan_b'
                    placeholder='Supplier'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.plan_b = el)} />
            </td>
            <td>
                <textarea type='text'
                    value={obj.details_b || ""}
                    name='details_b'
                    placeholder='Details'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.details_b = el)} />
            </td>
            <td className={styles.tdValor}>
                <input
                    value={obj.value_b || ""}
                    name='value_b'
                    placeholder='Value'
                    onChange={(e) => handleChange(e, true)}
                    min="0"
                    ref={el => (camposRef.current.value_b = el)} />
            </td>
            <td>
                <textarea type='text'
                    value={obj.plan_real || ""}
                    name='plan_real'
                    placeholder='Actual strategy'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.plan_real = el)} />
            </td>
            <td>
                <input
                    value={obj.date_real || ""}
                    name='date_real'
                    type="date"
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.date_real = el)} />
            </td>
            <td className={styles.tdValor}>
                <input type='number'
                    value={obj.value_real || ""}
                    name='value_real'
                    placeholder='Value'
                    onChange={(e) => handleChange(e, true)}
                    min="0"
                    ref={el => (camposRef.current.value_real = el)} />
            </td>
            <td>-</td>
            <td>-</td>
            <td className={tipo === 'update' ? 'botoes_acoes' : ''}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)} disabled={!isEditor}>Add new</button>
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