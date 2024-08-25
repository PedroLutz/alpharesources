import { useEffect, useState, useRef } from "react";
import React from "react";
import { fetchData } from "../../functions/crud";

const InputPlanos = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [riscos, setRiscos] = useState([])
    const [riscosPorArea, setRiscosPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [estrategias, setEstrategias] = useState([]);
    const camposRef = useRef({
        risco: null,
        estrategia: null,
        detalhamento: null
    })

    const fetchRiscos = async () => {
        const data = await fetchData('riscos/riscos/get/riscosEAreas');
        setRiscos(data.riscos);
        var todosOsRiscos = [];
        data.riscos.forEach((risco) => {
            todosOsRiscos.push([risco.risco])
        })
        setRiscosPorArea(todosOsRiscos);
    };


    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current === true) {
            isFirstRender.current = false;
            return;
        }

        objSetter({
            ...obj,
            risco: ''
        });
        setEstrategias([])
    }, [areaSelecionada]);

    useEffect(() => {
        fetchRiscos();
    }, []);

    useEffect(() => {
        if (obj.risco) {
            generateEstrategias();
        }
    }, [obj.risco, riscos]);

    const handleAreaChange = (e) => {
        setAreaSelecionada(e.target.value);
        const areaSelect = e.target.value;
        const itensDaArea = riscos.filter(item => item.area === areaSelect).map(item => item.risco);
        setRiscosPorArea(itensDaArea);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const generateEstrategias = () => {
        if(!obj.risco){
            return;
        }
        const riscoEncontrado = riscos.find(o => o.risco === obj.risco);
        if (!riscoEncontrado) {
            return;
        }
        const ehAmeaca = riscoEncontrado.ehNegativo;
        if(ehAmeaca){ 
            setEstrategias(["Avoid", "Mitigate", "Transfer", "Accept"]);
            return;
        } else {
            setEstrategias(["Exploit", "Enhance", "Share", "Ignore"]);
            return;
        }
    }

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => value === '');
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    const validaDados = () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);
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
                <div>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={areaSelecionada}
                >
                    <option value="" disabled>Area</option>
                    {[...new Set(riscos.map(item => item.area))].map((area, index) => (
                        <option key={index} value={area}>{area}</option>
                    ))};
                    <option value="Others">Others</option>
                </select>
                </div>
                
                <select
                    style={{marginTop: '0.3rem'}}
                    value={obj.risco}
                    name='risco'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.risco = el)}
                >
                    <option value="" disabled>Risk</option>
                    {riscosPorArea.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </td>
            <td>
                <select
                    name="estrategia"
                    onChange={handleChange}
                    value={obj.estrategia}
                    ref={el => (camposRef.current.estrategia = el)}
                >
                    <option disabled value="">Select</option>
                    {estrategias.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </td>
            <td>
                <input
                    name="detalhamento"
                    onChange={handleChange}
                    value={obj.detalhamento}
                    ref={el => (camposRef.current.detalhamento = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit}>Add new</button>
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

export default InputPlanos;