import { useEffect, useState, useRef } from "react";
import React from "react";
import { handleFetch } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import styles from '../../../../../styles/modules/risco.module.css'
import { useImpacto } from "../data/ImpactoContext";

const Inputs = ({ obj, objSetter, funcoes, tipo, setExibirModal, seeArea, backgroundColor }) => {
    const [riscosPorArea, setRiscosPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const {impactos, riscos, areasWBS} = useImpacto();
    const camposRef = useRef({
        risk_id: null,
        impact_area: null,
        score: null,
        description: null
    })
    const { token } = useAuth();
    const { isEditor } = usePerm();

    const isImpactoCadastrado = (risco, areaImpacto) => {
        return impactos.some((i) => i.risk?.id == risco
            && i.impact_area.trim().toLowerCase() === areaImpacto.trim().toLowerCase());
    }

    useEffect(() => {
            if(tipo == "update"){
                setRiscosPorArea(riscos)
            }
        }, [obj?.risk_id])


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
        if (isImpactoCadastrado(obj.risk_id, obj.impact_area) && tipo != "update") {
            camposRef.current.impact_area.classList.add('campo-vazio');
            setExibirModal('impactoRepetido');
            return false;
        }
        if (obj.score < 0) {
            camposRef.current.score.classList.add('campo-vazio');
            setExibirModal('scoreNegativo');
            return false;
        }
        if (obj.score > 5) {
            camposRef.current.score.classList.add('campo-vazio');
            setExibirModal('maiorQueCinco');
            return false;
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
        if (!isValid == true) return;
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
            <td className={styles.impactoTdRisco}>
                <div>
                    <select
                        name="area"
                        onChange={handleAreaChange}
                        value={areaSelecionada}
                    >
                        <option value="" defaultValue>Area</option>
                        {areasWBS.map((area, index) => (
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

export default Inputs;