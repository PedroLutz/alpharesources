import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../../functions/crud";
import { AuthContext } from "../../../../contexts/AuthContext";

const InputPlanos = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const [riscos, setRiscos] = useState([])
    const [riscosPorArea, setRiscosPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const camposRef = useRef({
        risco: null,
        areaImpacto: null,
        valor: null,
        descricao: null
    })
    const {isAdmin} = useContext(AuthContext);

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
    }, [areaSelecionada]);

    useEffect(() => {
        fetchRiscos();
    }, []);

    const handleAreaChange = (e) => {
        setAreaSelecionada(e.target.value);
        const areaSelect = e.target.value;
        const itensDaArea = riscos.filter(item => item.area === areaSelect).map(item => item.risco);
        setRiscosPorArea(itensDaArea);
    };

    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if(isNumber){
            value = value.replace(/[^0-9]/g, '');
        }
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        if(funcoes?.isImpactoCadastrado?.(obj.risco, obj.areaImpacto) ?? false){
            camposRef.current.areaImpacto.classList.add('campo-vazio');
            setExibirModal('impactoRepetido');
            return true;
        }
        if (obj.valor < 0) {
            camposRef.current['valor'].classList.add('campo-vazio');
            setExibirModal('valorNegativo');
            return true;
        }
        if (obj.valor > 5) {
            camposRef.current['valor'].classList.add('campo-vazio');
            setExibirModal('maiorQueCinco');
            return true;
        }
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
            <td>
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
                    style={{ marginTop: '0.3rem' }}
                    value={obj.risco}
                    name='risco'
                    onChange={(e) => handleChange(e, false)}
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
                    value={obj.areaImpacto}
                    name='areaImpacto'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.areaImpacto = el)}
                >
                    <option value="" defaultValue>Area of impact</option>
                    <option value='Scope'>Scope</option>
                    <option value='Schedule'>Schedule</option>
                    <option value='Resources'>Resources</option>
                    <option value='Quality'>Quality</option>
                    <option value='Reputation'>Reputation</option>
                </select>
            </td>
            <td style={{width: '3rem'}}>
                <input
                    name="valor"
                    onChange={(e) => handleChange(e, true)}
                    style={{width: '3rem'}}
                    value={obj.valor}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.valor = el)}
                />
            </td>
            <td>
                <textarea
                    type='text'
                    name="descricao"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.descricao}
                    placeholder="Description"
                    ref={el => (camposRef.current.descricao = el)}
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