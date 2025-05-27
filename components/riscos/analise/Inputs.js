import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";

const InputPlanos = ({ obj, objSetter, funcao, tipo, setExibirModal }) => {
    const [riscos, setRiscos] = useState([])
    const [riscosPorArea, setRiscosPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const camposRef = useRef({
        risco: null,
        ocorrencia: null,
        impacto: null,
        acao: null,
        urgencia: null,
        impactoFinanceiro: null,
        impactoCronograma: null
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
        const campos = { ocorrencia: obj.ocorrencia, impacto: obj.impacto, urgencia: obj.urgencia, acao: obj.acao };

        for (const [key, value] of Object.entries(campos)) {
            if (value < 0) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('valorNegativo');
                return true;
            }
            if (value > 5) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('maiorQueCinco');
                return true;
            }
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

    const handleSubmit = (e) => {
        const isInvalido = validaDados();
        if(isInvalido == true) return;

        if (funcao.funcao1) {
            funcao.funcao1();
        } else {
            funcao(e);
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
                <input
                    name="ocorrencia"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.ocorrencia}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.ocorrencia = el)}
                />
            </td>
            <td>
                <input
                    name="impacto"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.impacto}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.impacto = el)}
                />
            </td>
            <td>
                <input
                    name="acao"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.acao}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.acao = el)}
                />
            </td>
            <td>
                <input
                    name="urgencia"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.urgencia}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.urgencia = el)}
                />
            </td>
            <td>-</td>
            <td>
                <input
                    name="impactoFinanceiro"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.impactoFinanceiro}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.impactoFinanceiro = el)}
                />
            </td>
            <td>-</td>
            <td>
                <input
                    name="impactoCronograma"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.impactoCronograma}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.impactoCronograma = el)}
                />
            </td>
            <td>-</td>
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

export default InputPlanos;