import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { handleFetch } from "../../../../functions/crud_s";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import styles from '../../../../styles/modules/risco.module.css'

const InputPlanos = ({ obj, objSetter, funcoes, tipo, setExibirModal, seeArea }) => {
    const { token } = useAuth();
    const { isEditor } = usePerm();
    const [riscos, setRiscos] = useState([])
    const [riscosPorArea, setRiscosPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [areas, setAreas] = useState([]);
    const [estrategias, setEstrategias] = useState([]);
    const camposRef = useRef({
        risco: null,
        estrategia: null,
        detalhamento: null
    })

    const fetchRiscos = async () => {
        const data = await handleFetch({
            table: 'risk',
            query: 'risks_and_areas',
            token
        })
        setRiscos(data.data);
        console.log(data.data)
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

    useEffect(() => {
        if (obj.risk_id) {
            generateEstrategias();
        }
    }, [obj.risk_id, riscos]);

    const generateEstrategias = () => {
        if (!obj.risk_id) {
            return;
        }
        const riscoEncontrado = riscos.find(o => o.id == obj.risk_id);
        
        if (!riscoEncontrado) {
            return;
        }
        const ehAmeaca = riscoEncontrado.is_negative;
        if (ehAmeaca) {
            setEstrategias(["avoid", "mitigate", "transfer", "accept"]);
            return;
        } else {
            setEstrategias(["exploit", "enhance", "share", "ignore"]);
            return;
        }
    }

    function capitalizeFirstLetter(str) {
        if (typeof str !== 'string' || str.length === 0) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

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
        if (isInvalido == true) return;
        funcoes?.enviar();
        setAreaSelecionada('');
    }

    return (
        <tr>
            {seeArea && (
                <React.Fragment>
                    <td>-</td>
                    <td>-</td>
                </React.Fragment>
            )}
            <td className={styles.planoTdRisk}>
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
            <td className={styles.planoTdStrategy}>
                <select
                    name="strategy"
                    onChange={handleChange}
                    value={obj.strategy}
                    ref={el => (camposRef.current.strategy = el)}
                >
                    <option defaultValue value="">Select</option>
                    {estrategias.map((item, index) => (
                        <option key={index} value={item}>{capitalizeFirstLetter(item)}</option>
                    ))}
                </select>
            </td>
            <td className={styles.planoTdResponse}>
                <textarea
                    name="details"
                    onChange={handleChange}
                    value={obj.details}
                    ref={el => (camposRef.current.details = el)}
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