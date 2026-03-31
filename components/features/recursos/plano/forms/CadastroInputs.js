import { useEffect, useState, useRef } from "react";
import React from "react";
import styles from '../../../../../styles/modules/planoAquisicao.module.css'
import { handleFetch } from '../../../../../functions/crud_s';
import useAuth from '../../../../../hooks/useAuth';
import usePerm from "../../../../../hooks/usePerm";
import { usePlano } from "../data/PlanoProvider";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const { areas, recursosPorArea } = usePlano();
    const [areaSelecionada, setAreaSelecionada] = useState("");
    const [recursoSelecionado, setRecursoSelecionado] = useState('');
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
    const { isEditor } = usePerm();

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        objSetter({ ...obj, resource_id: "" });
        setAreaSelecionada(Number(areaSelecionada));
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

    useEffect(() => {
        if (tipo == "update") {
            if (obj?.resource?.id !== null) {
                const areaSelecionada = obj?.resource?.wbs_item?.wbs_area?.id || -1;
                setAreaSelecionada(Number(areaSelecionada));

                setRecursoSelecionado(obj?.resource?.id);
            } else {
                setAreaSelecionada(-1);
                setRecursoSelecionado(-1);
            }
        }
    }, [obj?.resource?.id]);

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
        const { plan_real, value_real, date_real, ...camposConsiderados } = obj;
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
                        <option key={index} value={area[0]}>{area[1]}</option>
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
                    {recursosPorArea.get(areaSelecionada)?.map((item, _) => (
                        <option key={item.id} value={item.id}>{item.resource}</option>
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
                <input
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