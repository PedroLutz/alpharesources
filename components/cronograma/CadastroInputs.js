import React, { useEffect, useState, useRef } from "react";
import { fetchData } from "../../functions/crud";
import styles from '../../styles/modules/cronograma.module.css';

const CadastroInputs = ({ tipo, obj, objSetter, funcao, checkDados, gantt }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState({ notDp: [], dp: [] });
    const camposRef = useRef({
        item: null,
        area: null,
        inicio: null,
        termino: null,
        dp_item: null,
        dp_area: null,
        situacao: null,
    });

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => !value);
        return [emptyFields.length > 2, emptyFields.map(([key]) => key)];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const checkIfUsed = async (item) => {
        var found;
        await fetch(`/api/cronograma/checks/isUsed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ area: item.area, item: item.item }),
        })

            .then(response => response.json()).then(data => { found = data.found });
        return found;
    }

    const checkDpUsed = async (item) => {
        var found;
        await fetch(`/api/cronograma/checks/dpIsUsed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dp_area: item.dp_area, dp_item: item.dp_item }),
        })

            .then(response => response.json()).then(data => { found = data.found });
        return found;
    }

    const checkDpOkay = async (item) => {
        var found;
        console.log(item);
        if(item.inicio === '' && item.termino === ''){
            return true;
        }
        await fetch(`/api/cronograma/checks/dpIsOkay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dp_area: item.dp_area, dp_item: item.dp_item, inicio: item.inicio }),
        })

            .then(response => response.json()).then(data => { found = data.found });
        return found;
    }

    const validaDados = async () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);
        var objEnviado = obj;
        if(obj.dp_area == undefined && obj.dp_item == undefined){
            objEnviado = {
                ...obj,
                dp_area: '',
                dp_item: ''
            }
        }
        if(obj.inicio === "1970-01-01" && obj.termino === "1970-01-01"){
            objEnviado = {
                ...obj,
                inicio: '',
                termino: ''
            }
        }
        const isUsed = await checkIfUsed(objEnviado);
        const dpIsUsed = await checkDpUsed(objEnviado);
        const dpIsOkay = await checkDpOkay(objEnviado);
        const datasNotOk = obj.inicio > obj.termino;
        if (objEnviado.dp_area !== '' || objEnviado.dp_item !== '') {
            if (!dpIsUsed) {
                checkDados('dpNotUsed');
                console.log(true)
                return true;
            }
            if (!dpIsOkay) {
                checkDados('dpNotOkay');
                console.log(true)
                return true;
            }
        }
        if (datasNotOk) {
            checkDados('datasErradas');
            return true;
        }
        if (isUsed) {
            checkDados('dadosUsados');
            console.log(true)
            return true;
        }
        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });
            setEmptyFields(camposVazios);
            checkDados('inputsVazios');
            return true;
        }
        if (obj.dp_area && !obj.dp_item) {
            checkDados('depFaltando')
            return true;
        }
    }

    const handleAreaChange = (e, isDp) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS
            .filter(item => item.area === areaSelecionada).map(item => item.item);
        if (!isDp) {
            setItensPorArea({ ...itensPorArea, notDp: itensDaArea });
        } else {
            setItensPorArea({ ...itensPorArea, dp: itensDaArea });
        }
        handleChange(e);
    };

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };

    useEffect(() => {
        fetchElementos();
    }, []);

    useEffect(() => {
        if (obj.dp_area) {
            const itensDaArea = elementosWBS
                .filter(item => item.area === obj.dp_area)
                .map(item => item.item);
            setItensPorArea({ ...itensPorArea, dp: itensDaArea });
        }
    }, [obj, elementosWBS]);

    useEffect(() => {
        if (obj.dp_area == '') {
            objSetter({
                ...obj,
                dp_item: ''
            })
        }
    }, [obj.dp_area]);

    useEffect(() => {
        if (tipo == 'cadastro') {
            objSetter({
                ...obj,
                item: ''
            })
        }
    }, [obj.area]);

    const handleSubmit = async (e) => {
        const isInvalido = await validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            !isInvalido && funcao(e);
        }
    };

    return (
        <React.Fragment>
            {tipo === 'cadastro' && (
                <React.Fragment>
                    <td>
                        <select
                            name="area"
                            onChange={(e) => handleAreaChange(e, false)}
                            value={obj.area}
                            ref={el => (camposRef.current.area = el)}
                        >
                            <option value="" disabled>Area</option>
                            {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                                <option key={index} value={area}>{area}</option>
                            ))};
                        </select>
                    </td>
                    <td>
                        <select
                            name="item"
                            onChange={handleChange}
                            value={obj.item}
                            ref={el => (camposRef.current.item = el)}
                        >
                            <option value="" disabled>Item</option>
                            {itensPorArea.notDp.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </td>
                </React.Fragment>
            )}
            <td>
                <input
                    type="date"
                    name="inicio"
                    onChange={handleChange}
                    value={obj.inicio}
                    ref={el => (camposRef.current.inicio = el)}
                />
            </td>
            <td>
                <input
                    type="date"
                    name="termino"
                    onChange={handleChange}
                    value={obj.termino}
                    ref={el => (camposRef.current.termino = el)}
                />
            </td>
            <td>
                <select
                    name="dp_area"
                    onChange={(e) => handleAreaChange(e, true)}
                    value={obj.dp_area}
                    ref={el => (camposRef.current.dp_area = el)}
                >
                    <option value="">None</option>
                    {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                        <option key={index} value={area}>{area}</option>
                    ))};
                </select>
            </td>
            <td>
                <select
                    name="dp_item"
                    onChange={handleChange}
                    value={obj.dp_item}
                    ref={el => (camposRef.current.dp_item = el)}
                >
                    <option value="">None</option>
                    {itensPorArea.dp.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </td>
            {gantt && (
                <td>
                    <select
                        name="situacao"
                        onChange={handleChange}
                        value={obj.situacao}
                        ref={el => (camposRef.current.situacao = el)}
                    >
                        <option value="iniciar">Starting</option>
                        <option value="em andamento">Executing</option>
                        <option value="concluida">Completed</option>
                    </select>
                </td>
            )}
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button className={styles.botaoCadastro} onClick={(e) => handleSubmit(e)}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcao.funcao2}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </React.Fragment>
    )
}

export default CadastroInputs;