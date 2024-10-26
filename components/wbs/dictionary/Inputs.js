import React, { useState, useRef, useEffect, useContext } from 'react';
import { fetchData } from '../../../functions/crud';
import { AuthContext } from '../../../contexts/AuthContext';

const Inputs = ({ obj, objSetter, tipo, funcao, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const camposRef = useRef({
        area: null,
        item: null,
        descricao: null,
        criterio: null,
        verificacao: null,
        timing: null,
        responsavel: null
    });
    const {isAdmin} = useContext(AuthContext)

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
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

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
    
        objSetter({
            ...obj,
            item: ''
        });
    }, [obj.area]);
    
    const isFirstRender = useRef(true);

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
        setItensPorArea(itensDaArea);

        handleChange(e, objSetter, obj);
    };

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(obj).filter(([key, value]) => !value);
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
                    <option value="" disabled>Item</option>
                    {itensPorArea.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                    <option value="Others">Others</option>
                </select>
            </td>
            <td>
                <input type='text'
                    value={obj.descricao}
                    name='descricao'
                    placeholder='Description + Purpose'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    min="0"
                    ref={el => (camposRef.current.descricao = el)} />
            </td>
            <td>
                <input type='text'
                    value={obj.criterio}
                    name='criterio'
                    placeholder='Acceptance criteria'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    min="0"
                    ref={el => (camposRef.current.criterio = el)} />
            </td>
            <td>
                <input
                    type="text"
                    value={obj.verificacao}
                    name='verificacao'
                    placeholder='Verification'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.verificacao = el)} />
            </td>
            <td>
                <input
                    type="text"
                    value={obj.timing}
                    name='timing'
                    placeholder='Timing'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.timing = el)} />
            </td>
            <td>
                <input
                    type="text"
                    value={obj.responsavel}
                    name='responsavel'
                    placeholder='Responsible'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.responsavel = el)} />
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

export default Inputs;