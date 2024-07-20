import React, { useEffect, useState, useRef } from "react";
import { fetchData } from "../../functions/crud";

const CadastroInputs = ({ tipo, obj, objSetter, funcao, checkDados, plano }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState({ notDp: [], dp: [] });
    const camposRef = useRef({
        item: null,
        area: null,
        inicio: null,
        termino: null,
        dp_item: null,
        dp_area: null,
    });

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => !value);
        if(emptyFields.length === 2 && (form.dp_area === '' && form.dp_item === '')){
            return [false, []]
        }
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        objSetter({
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
        if(obj.dp_area && !obj.dp_item){
            checkDados('depFaltando')
            return true;
        }
    }

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

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };

    useEffect(() => {
        fetchElementos();
    }, []);

    useEffect(() => {
        if (obj.dp_area) {
            const itensDaArea = elementosWBS
                .filter(item => item.area === obj.dp_area)
                .map(item => item.item);
            setItensPorArea({ ...itensPorArea, dp: itensDaArea });
        }
    }, [obj, elementosWBS]);

    useEffect(() => {
        if(obj.dp_area === ''){
            objSetter({
                ...obj,
                dp_item: ''
            })
        }
    }, [obj.dp_area])

    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if(funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            !isInvalido && funcao(e);
        }
    };

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
                            <option value="" disabled>Area</option>
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
                            <option value="" disabled>Item</option>
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
            <td>
                <select
                    name="dp_area"
                    onChange={(e) => handleAreaChange(e, true)}
                    value={obj.dp_area}
                    ref={el => (camposRef.current.dp_area = el)}
                >
                    <option value="">None</option>
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
                    <option value="">None</option>
                    {itensPorArea.dp.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
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
        </React.Fragment>
    )
}

export default CadastroInputs;