import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../../functions/crud";
import { AuthContext } from "../../../../contexts/AuthContext";
import styles from '../../../../styles/modules/risco.module.css'

const InputPlanos = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const [riscos, setRiscos] = useState([])
    const [riscosPorArea, setRiscosPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [estrategias, setEstrategias] = useState([]);
    const camposRef = useRef({
        risco: null,
        estrategia: null,
        detalhamento: null
    })
    const {isAdmin} = useContext(AuthContext)

    const fetchRiscos = async () => {
        const data = await fetchData('riscos/risco/get/riscosAreas');
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

    const validaDados = () => {
        const camposVazios = Object.entries(obj)
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
        return false;
    }

    const handleSubmit = () => {
        const isInvalido = validaDados();
        if(isInvalido == true) return;
        funcoes?.enviar();
    }

    return (
        <tr>
            <td >
                <div>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={areaSelecionada}
                >
                    <option value="" defaultValue>Area</option>
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
                    <option value="" defaultValue>Risk</option>
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
                    <option defaultValue value="">Select</option>
                    {estrategias.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </td>
            <td>
                <textarea
                    name="detalhamento"
                    onChange={handleChange}
                    value={obj.detalhamento}
                    ref={el => (camposRef.current.detalhamento = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isAdmin}>Add new</button>
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

export default InputPlanos;