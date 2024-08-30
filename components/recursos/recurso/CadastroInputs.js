import { useEffect, useState, useRef } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const camposRef = useRef({
        area: null,
        item: null,
        recurso: null,
        uso: null,
        status: null,
        ehEssencial: null
    });

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };

    useEffect(() => {
        fetchElementos();
    }, []);

    useEffect(() => {
        if (obj.area) {
            const itensDaArea = elementosWBS.filter(item => item.area === obj.area).map(item => item.item);
            setItensPorArea(itensDaArea);
        }
    }, [obj.area, elementosWBS]);

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

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => !value);
        return [emptyFields.length > 1, emptyFields.map(([key]) => key)];
    };

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
        setItensPorArea(itensDaArea);

        handleChange(e, objSetter, obj);
    };

    const handleChange = (e, setter, obj) => {
        const { name, value } = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        setter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);
        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });
            setEmptyFields(camposVazios);
            checkDados('inputsVazios');
            return true;
        }
    };

    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
            return;
        } else {
            !isInvalido && funcao(e);
        }
    };

    return (
        <tr className='linha-cadastro'>
            <td>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={obj.area}
                    ref={el => (camposRef.current.area = el)}

                >
                    <option value="" disabled>Area</option>
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
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.item = el)}

                >
                    <option value="" disabled>Item</option>
                    {itensPorArea.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                    <option value="Others">Others</option>
                </select>
            </td>
            <td>
                <input type='text'
                    value={obj.recurso}
                    name='recurso'
                    placeholder='Resource'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    min="0"
                    ref={el => (camposRef.current.recurso = el)} />
            </td>
            <td>
                <input type='text'
                    value={obj.uso}
                    name='uso'
                    placeholder='Use'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    min="0"
                    ref={el => (camposRef.current.uso = el)} />
            </td>
            <td>
                <select
                    value={obj.status}
                    name='status'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.status = el)} >
                    <option value="" disabled>Acquisition method</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Rental">Rental</option>
                    <option value="Borrowing">Borrowing</option>
                    <option value="Outsourcing">Outsourcing</option>
                    <option value="Already acquired">Already acquired</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.ehEssencial}
                    name='ehEssencial'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.ehEssencial = el)} >
                    <option value="" disabled>-</option>
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                </select>
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)}>Add new</button>
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