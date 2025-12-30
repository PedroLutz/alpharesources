import { useEffect, useState, useRef } from "react";
import React from "react";
import { handleFetch } from "../../../../functions/crud_s";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import styles from '../../../../styles/modules/risco.module.css'

const InputPlanos = ({ obj, objSetter, funcoes, tipo, setExibirModal, seeArea, backgroundColor }) => {
    const { token } = useAuth();
    const { isEditor } = usePerm();

    const [riscos, setRiscos] = useState([])
    const [riscosPorArea, setRiscosPorArea] = useState([]);
    const [areas, setAreas] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const camposRef = useRef({
        risk_id: null,
        occurrence: null,
        impact: null,
        action: null,
        urgency: null,
        financial_impact: null,
        schedule_impact: null
    })

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
            todosOsRiscos.push({id: risco.id, risk: risco.risk})
            if(risco?.wbs_item) {
                if(!areas.some(a=> a.id == risco?.wbs_item?.wbs_area?.id)) 
                    areas.push({id: risco?.wbs_item?.wbs_area?.id ,name: risco?.wbs_item?.wbs_area?.name});
            }
        })
        setAreas(areas);
        setRiscosPorArea(todosOsRiscos);
    };


    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
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
                if(areaSelect == -1) return item?.wbs_item == undefined;
                if(areaSelect == "") return true;
                return item?.wbs_item?.wbs_area?.id == areaSelect}
        ).map(item => ({id: item.id, risk: item.risk}));
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
        if(funcoes?.isRiscoCadastrado?.(obj?.risk_id) ?? false){
            camposRef.current.risk_id.classList.add('campo-vazio');
            setExibirModal('riscoRepetido');
            return false;
        }
        const campos = { occurrence: obj.occurrence, impact: obj.impact, urgency: obj.urgency, action: obj.action };

        for (const [key, value] of Object.entries(campos)) {
            if (value < 0) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('valorNegativo');
                return false;
            }
            if (value > 5) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('maiorQueCinco');
                return false;
            }
        }
        
        const camposVazios = Object.keys(obj)
            .filter(key => obj[key] === null || obj[key] === "")

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return false;
        }

        return true;
    }

    const handleSubmit = () => {
        const isValid = validaDados();
        if(!isValid) return;
        funcoes?.enviar();
        setAreaSelecionada('');
    }

    return (
        <tr style={{backgroundColor}}>
            {seeArea && (
                <React.Fragment>
                    <td>-</td>
                    <td>-</td>
                </React.Fragment>
            )}
            <td className={styles.analiseRiskTd}>
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
            <td className={styles.analiseOcurrenceTd}>
                <input
                    name="occurrence"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.occurrence}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.occurrence = el)}
                />
            </td>
            <td>
                <input
                    name="impact"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.impact}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.impact = el)}
                />
            </td>
            <td>
                <input
                    name="action"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.action}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.action = el)}
                />
            </td>
            <td>
                <input
                    name="urgency"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.urgency}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.urgency = el)}
                />
            </td>
            <td>-</td>
            <td className={styles.analiseFinancialImpactTd}>
                <input
                    name="financial_impact"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.financial_impact}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.financial_impact = el)}
                />
            </td>
            <td>-</td>
            <td>
                <input
                    name="schedule_impact"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.schedule_impact}
                    min={1}
                    max={5}
                    ref={el => (camposRef.current.schedule_impact = el)}
                />
            </td>
            <td>-</td>
            <td className={tipo === 'update' && 'botoes_acoes'}>
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