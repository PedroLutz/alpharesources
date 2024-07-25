import { useEffect, useState, useRef } from "react";
import React from "react";
import { fetchData } from "../../functions/crud";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const camposRef = useRef({
        area: null,
        item: null,
        risco: null,
        efeito: null,
        ehNegativo: null,
        causas: null,
        gatilho: null,
        ocorrencia: null,
        impacto: null,
        urgencia: null,
    })

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

    useEffect(() => {
        if (obj.area) {
            const itensDaArea = elementosWBS.filter(item => item.area === obj.area).map(item => item.item);
            setItensPorArea(itensDaArea);
        }
    }, [obj.area, elementosWBS]);


    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
        setItensPorArea(itensDaArea);

        handleChange(e, objSetter, obj);
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

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => value === null);
        emptyFields.map(([key]) => console.log(key));
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    const validaDados = () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);
        console.log(camposVazios);
        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });
            checkDados('inputsVazios');
            return true;
        }
    }

    const handleSubmit = (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            !isInvalido && funcao(e);
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
                    <option value="" disabled>Area</option>
                    {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                        <option key={index} value={area}>{area}</option>
                    ))};
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
                </select>
            </td>
            <td>
                <input
                    name="risco"
                    onChange={handleChange}
                    value={obj.risco}
                    ref={el => (camposRef.current.risco = el)}
                />
            </td>
            <td>
                <input
                    name="efeito"
                    onChange={handleChange}
                    value={obj.efeito}
                    ref={el => (camposRef.current.efeito = el)}
                />
            </td>
            <td>
                <select
                    name="ehNegativo"
                    onChange={handleChange}
                    value={obj.ehNegativo}
                    ref={el => (camposRef.current.ehNegativo = el)}
                >
                    <option disabled value="">Select</option>
                    <option value={true}>Threat</option>
                    <option value={false}>Opportunity</option>
                </select>
            </td>
            <td>
                <input
                    name="causas"
                    onChange={handleChange}
                    value={obj.causas}
                    ref={el => (camposRef.current.causas = el)}
                />
            </td>
            <td>
                <input
                    name="gatilho"
                    onChange={handleChange}
                    value={obj.gatilho}
                    ref={el => (camposRef.current.gatilho = el)}
                />
            </td>
            <td>
                <input
                    type='number'
                    name="ocorrencia"
                    onChange={handleChange}
                    value={obj.ocorrencia}
                    ref={el => (camposRef.current.ocorrencia = el)}
                />
            </td>
            <td>
                <input
                    type='number'
                    name="impacto"
                    onChange={handleChange}
                    value={obj.impacto}
                    ref={el => (camposRef.current.impacto = el)}
                />
            </td>
            <td>
                <input
                    type='number'
                    name="urgencia"
                    onChange={handleChange}
                    value={obj.urgencia}
                    ref={el => (camposRef.current.urgencia = el)}
                />
            </td>
            <td>
                {(obj.ocorrencia * obj.impacto * obj.urgencia)}
            </td>
            <td>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit}>buceta</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>clicket</button>
                        <button onClick={funcao.funcao2}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default CadastroInputs;