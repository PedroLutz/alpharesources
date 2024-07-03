import React, { useState, useRef, useEffect } from 'react';
import { fetchData } from '../../../functions/crud';

const CadastroTabela = ({ obj, objSetter, tipo, funcao, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const camposRef = useRef({
        plano: null,
        area: null,
        item: null,
        recurso: null,
        uso: null,
        tipo_a: null,
        valor_a: null,
        plano_a: null,
        data_inicial: null,
        data_esperada: null,
        data_limite: null,
        plano_b: null,
        tipo_b: null,
        valor_b: null
    });

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get');
        setElementosWBS(data.elementos);
    };

    useEffect(() => {
        fetchElementos();
    }, []);

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

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => !value);
        return [emptyFields.length > 1, emptyFields.map(([key]) => key)];
    };

    const handleChange = (e, setter, obj) => {
        const { name, value } = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        setter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        if (obj.valor_a < 0 || obj.valor_b < 0) {
            checkDados('valorNegativo');
            obj.valor_a < 0 && camposRef.current['valor_a'].classList.add('campo-vazio');
            obj.valor_b < 0 && camposRef.current['valor_b'].classList.add('campo-vazio');
            return true;
        }
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
        if (obj.data_inicial > obj.data_esperada || obj.data_inicial > obj.data_limite) {
            checkDados('datasErradas');
            let campos = ['data_inicial'];
            obj.data_inicial > obj.data_esperada && campos.push('data_esperada');
            obj.data_inicial > obj.data_limite && campos.push('data_limite');
            campos.forEach((campo) => {
                camposRef.current[campo].classList.add('campo-vazio');
            });
            return true;
        }
    }

    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
            return;
        } else {
            !isInvalido && funcao(e);
        }
    };

    return (
        <tr className='linha-cadastro'>
            <td>
                <select
                    name="area"
                    onChange={handleAreaChange}
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
                    value={obj.item}
                    name='item'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.item = el)}

                >
                    <option value="" disabled>Item</option>
                    {itensPorArea.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </td>
            <td>
                <input type='text'
                    value={obj.recurso}
                    name='recurso'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    min="0"
                    ref={el => (camposRef.current.recurso = el)} />
            </td>
            <td>
                <input type='text'
                    value={obj.uso}
                    name='uso'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    min="0"
                    ref={el => (camposRef.current.uso = el)} />
            </td>
            <td>
                <input
                    type="text"
                    value={obj.plano_a}
                    name='plano_a'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.plano_a = el)} />
            </td>
            <td>
                <select
                    value={obj.tipo_a}
                    name='tipo_a'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.tipo_a = el)}
                >
                    <option value="" disabled>Type</option>
                    <option value="Service">Service</option>
                    <option value="Product">Product</option>
                </select>
            </td>
            <td>
                <input type='number'
                    value={obj.valor_a}
                    name='valor_a'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    min="0"
                    ref={el => (camposRef.current.valor_a = el)} />
            </td>
            <td>
                <input
                    value={obj.data_inicial}
                    type="date"
                    name='data_inicial'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.data_inicial = el)} />
            </td>
            <td>
                <input
                    value={obj.data_esperada}
                    type="date"
                    name='data_esperada'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.data_esperada = el)} />
            </td>
            <td>
                <input
                    value={obj.data_limite}
                    type="date"
                    name='data_limite'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.data_limite = el)} />
            </td>
            <td>
                <input
                    type="text"
                    value={obj.plano_b}
                    name='plano_b'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.plano_b = el)} />
            </td>
            <td>
                <select
                    value={obj.tipo_b}
                    name='tipo_b'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.tipo_b = el)}
                >
                    <option value="" disabled>Type</option>
                    <option value="Service">Service</option>
                    <option value="Product">Product</option>
                </select>
            </td>
            <td>
                <input type='number'
                    value={obj.valor_b}
                    name='valor_b'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    min="0"
                    ref={el => (camposRef.current.valor_b = el)} />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)}>Add new</button>
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

export default CadastroTabela;