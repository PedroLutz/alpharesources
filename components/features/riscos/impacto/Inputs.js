import { useEffect, useState, useRef } from "react";
import React from "react";
import { handleFetch } from "../../../../functions/crud_s";
import useAuth from "../../../../hooks/useAuth";
import styles from '../../../../styles/modules/risco.module.css'

const InputPlanos = ({ obj, objSetter, funcoes, tipo, setExibirModal, isEditor, seeArea }) => {
    const [riscos, setRiscos] = useState([])
    const [riscosPorArea, setRiscosPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [areas, setAreas] = useState([]);
    const camposRef = useRef({
        risk_id: null,
        impact_area: null,
        score: null,
        description: null
    })
    const { token } = useAuth();

    const fetchRiscos = async () => {
        const data = await handleFetch({
            table: 'risk',
            query: 'risks_and_areas',
            token
        })
        setRiscos(data.data);
        var todosOsRiscos = [];
        var areas = [];
        data.data.forEach((risco) => {
            todosOsRiscos.push({ id: risco.id, risk: risco.risk })
            if (risco?.wbs_item) {
                if (!areas.some(a => a.id == risco?.wbs_item?.wbs_area?.id))
                    areas.push({ id: risco?.wbs_item?.wbs_area?.id, name: risco?.wbs_item?.wbs_area?.name });
            }
        })
        setAreas(areas);
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
            risk_id: ''
        });
    }, [areaSelecionada]);

    useEffect(() => {
        fetchRiscos();
    }, []);

    const handleAreaChange = (e) => {
        setAreaSelecionada(e.target.value);
        const areaSelect = e.target.value;
        const itensDaArea = riscos.filter(
            item => {
                if (areaSelect == -1) return item?.wbs_item == undefined;
                if (areaSelect == "") return true;
                return item?.wbs_item?.wbs_area?.id == areaSelect
            }
        ).map(item => ({ id: item.id, risk: item.risk }));
        setRiscosPorArea(itensDaArea);
    };

    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if (isNumber) {
            value = value.replace(/[^0-9]/g, '');
        }
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        if (funcoes?.isImpactoCadastrado?.(obj.risk_id, obj.impact_area) ?? false) {
            camposRef.current.impact_area.classList.add('campo-vazio');
            setExibirModal('impactoRepetido');
            return true;
        }
        if (obj.score < 0) {
            camposRef.current.score.classList.add('campo-vazio');
            setExibirModal('scoreNegativo');
            return true;
        }
        if (obj.score > 5) {
            camposRef.current.score.classList.add('campo-vazio');
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
        if (isInvalido == true) return;
        funcoes?.enviar();
    }

    return (
        <tr>
            {seeArea && (
                <React.Fragment>
                    <td>-</td>
                    <td>-</td>
                </React.Fragment>
            )}
            <td className={styles.impactoTdRisco}>
                <div>
                    <select
                        name="area"
                        onChange={handleAreaChange}
                        value={areaSelecionada}
                    >
                        <option value="" defaultValue>Area</option>
                        {areas.map((area, index) => (
                            <option key={index} value={area.id}>{area.name}</option>
                        ))};
                        <option value={-1}>Others</option>
                    </select>
                </div>

                <select
                    style={{ marginTop: '0.3rem' }}
                    value={obj.risk_id}
                    name='risk_id'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.risk_id = el)}
                >
                    <option value="" defaultValue>Risk</option>
                    {riscosPorArea.map((item, index) => (
                        <option key={index} value={item.id}>{item.risk}</option>
                    ))}
                </select>
            </td>
            <td>
                <select
                    value={obj.impact_area}
                    name='impact_area'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.impact_area = el)}
                >
                    <option value="" defaultValue>Area of impact</option>
                    <option value='scope'>Scope</option>
                    <option value='schedule'>Schedule</option>
                    <option value='resources'>Resources</option>
                    <option value='quality'>Quality</option>
                    <option value='reputation'>Reputation</option>
                </select>
            </td>
            <td style={{ width: '3rem' }}>
                <input
                    name="score"
                    onChange={(e) => handleChange(e, true)}
                    style={{ width: '3rem' }}
                    value={obj.score}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.score = el)}
                />
            </td>
            <td className={styles.impactoTdDescricao}>
                <textarea
                    type='text'
                    name="description"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.description}
                    placeholder="Description"
                    ref={el => (camposRef.current.description = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isEditor}>Add new</button>
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