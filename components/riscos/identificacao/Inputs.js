import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const camposRef = useRef({
        area: null,
        item: null,
        risco: null,
        classificacao: null,
        ehNegativo: null,
        efeito: null,
        causa: null,
        gatilho: null
    })
    const {isAdmin} = useContext(AuthContext)

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
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => value === "");
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
                <input
                    name="risco"
                    onChange={handleChange}
                    value={obj.risco}
                    placeholder='Risk'
                    ref={el => (camposRef.current.risco = el)}
                />
            </td>
            <td>
                <select
                    name="classificacao"
                    onChange={handleChange}
                    value={obj.classificacao}
                    ref={el => (camposRef.current.classificacao = el)}
                >
                    <option disabled value="">Classification</option>
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
                >
                    <option disabled value="">Category</option>
                    <option value={true}>Threat</option>
                    <option value={false}>Opportunity</option>
                </select>
            </td>
            <td>
                <input
                    name="efeito"
                    onChange={handleChange}
                    value={obj.efeito}
                    placeholder='Effect'
                    ref={el => (camposRef.current.efeito = el)}
                />
            </td>
            <td>
                <input
                    name="causa"
                    onChange={handleChange}
                    value={obj.causa}
                    placeholder='Causes'
                    ref={el => (camposRef.current.causa = el)}
                />
            </td>
            <td>
                <input
                    name="gatilho"
                    onChange={handleChange}
                    value={obj.gatilho}
                    placeholder='Trigger'
                    ref={el => (camposRef.current.gatilho = el)}
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