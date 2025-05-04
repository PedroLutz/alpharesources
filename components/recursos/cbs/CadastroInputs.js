import React, { useState, useRef, useEffect, useContext } from 'react';
import { fetchData } from '../../../functions/crud';
import { AuthContext } from '../../../contexts/AuthContext';
import styles from '../../../styles/modules/cbs.module.css'

const CadastroInputs = ({ obj, objSetter, tipo, funcao, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const camposRef = useRef({
        codigo: null,
        area: null,
        item: null,
        custo_ideal: null,
        custo_essencial: null,
        custo_real: null
    })
    const { isAdmin } = useContext(AuthContext);
    const [itensPorArea, setItensPorArea] = useState([]);

    const isFormVazio = (form) => {
        const camposConsiderados = {
            codigo: form.codigo,
            area: form.area,
            item: form.item,
            custo_ideal: form.custo_ideal,
            custo_essencial: form.custo_essencial
        }
        const emptyFields = Object.entries(camposConsiderados).filter(([key, value]) => value === null || value === "");
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };

    useEffect(() => {
        if (obj.area) {
            const itensDaArea = elementosWBS.filter(item => item.area === obj.area).map(item => item.item);
            setItensPorArea(itensDaArea);
        }
    }, [obj.area, elementosWBS]);

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
        setItensPorArea(itensDaArea);

        handleChange(e, objSetter, obj);
    };

    useEffect(() => {
        fetchElementos();
    }, []);

    const handleChange = (e, setter, obj) => {
        const { name, value } = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        setter({
            ...obj,
            [name]: value,
        });
        if(name === 'custo_ideal' || name === 'custo_real' || name === 'custo_essencial'){
            setter({
                ...obj,
                [name]: value.replace(/[^0-9]/g, ''),
            });
        }
        if(name === 'codigo'){
            setter({
                ...obj,
                [name]: value.replace(/[^0-9.]/g, ''),
            });
        }
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);
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
    }

    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            !isInvalido && funcao(e);
        }
    }

    return (
        <tr className='linha-cadastro'>
            <td className={styles.td_code}>
                <input
                    value={obj.codigo}
                    name='codigo'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.descricao = el)} />
            </td>
            <td>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={obj.area}
                    ref={el => (camposRef.current.area = el)}
                >
                    <option value="" defaultValue>Area</option>
                    {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                        <option key={index} value={area}>{area}</option>
                    ))};
                    <option value="Others">Others</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.item}
                    name='item'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.item = el)}
                >
                    <option value="" defaultValue>Item</option>
                    {itensPorArea.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                    <option value="Others">Others</option>
                </select>
            </td>
            <td className={styles.td_custos}>
                <input
                    value={obj.custo_ideal}
                    name='custo_ideal'
                    min="0"
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.custo_ideal = el)} />
            </td>
            <td className={styles.td_custos}>
                <input
                    value={obj.custo_essencial}
                    name='custo_essencial'
                    min="0"
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.custo_essencial = el)} />
            </td>
            <td className={styles.td_custos}>
                -
            </td>
            <td className={styles.td_custos}>
                <input
                    value={obj.custo_real}
                    name='custo_real'
                    min="0"
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.custo_real = el)} />
            </td>
            <td>
                -
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)} disabled={!isAdmin}>Add new</button>
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

export default CadastroInputs;