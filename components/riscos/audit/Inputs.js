import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";

const InputPlanos = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [riscos, setRiscos] = useState([])
    const [riscosPorArea, setRiscosPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const camposRef = useRef({
        risco: null,
        resposta: null,
        impactoFinanceiro: null,
        descricaoImpacto: null
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

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
                    style={{ marginTop: '0.3rem' }}
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
                <input
                    type='text'
                    name="resposta"
                    onChange={handleChange}
                    value={obj.resposta}
                    placeholder="Response"
                    ref={el => (camposRef.current.resposta = el)}
                />
            </td>
            <td>
                <input
                    type='number'
                    name="impactoFinanceiro"
                    onChange={handleChange}
                    value={obj.impactoFinanceiro}
                    ref={el => (camposRef.current.impactoFinanceiro = el)}
                />
            </td>
            <td>
                <input
                    type='text'
                    name="descricaoImpacto"
                    onChange={handleChange}
                    value={obj.descricaoImpacto}
                    placeholder="Impact description"
                    ref={el => (camposRef.current.descricaoImpacto = el)}
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

export default InputPlanos;