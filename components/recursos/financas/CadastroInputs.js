import React, { useState, useRef, useEffect } from 'react';
import { fetchData } from '../../../functions/crud';

const CadastroTabela = ({ obj, objSetter, tipo, funcao, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const camposRef = useRef({
        tipo: null,
        descricao: null,
        valor: null,
        data: null,
        area: null,
        origem: null,
        destino: null
    })

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => !value);
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };

    useEffect(() => {
        fetchElementos();
    }, []);

    const handleChange = (e, setter, obj) => {
        const {name, value} = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        setter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        if(obj.valor < 0){
            camposRef.current['valor'].classList.add('campo-vazio');
            checkDados('valorNegativo')
            return true;
        }
        const [isEmpty, camposVazios] = isFormVazio(obj);
        console.log(obj)
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
        if(funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            !isInvalido && funcao(e);
        }
    }

    return (
        <tr className='linha-cadastro'>
            <td>
                <select
                    value={obj.tipo}
                    name='tipo'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.tipo = el)}
                >
                    <option value="" disabled>Type</option>
                    <option value='Income'>Income</option>
                    <option value='Expense'>Cost</option>
                    <option value='Exchange'>Exchange</option>
                </select>
            </td>
            <td>
                <input
                    value={obj.descricao}
                    name='descricao'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.descricao = el)}/>
            </td>
            <td>
                <input type='number'
                    value={obj.valor}
                    name='valor'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    min = "0"
                    ref={el => (camposRef.current.valor = el)} />
            </td>
            <td>
                <input type="date"
                    value={obj.data}
                    name='data'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.data = el)} />
            </td>
            <td>
                <select
                        name="area"
                        onChange={(e) => handleChange(e, objSetter, obj)}
                        value={obj.area}
                        ref={el => (camposRef.current.area = el)}

                    >
                        <option value="" disabled>Area</option>
                        {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                            <option key={index} value={area}>{area}</option>
                        ))};
                        <option value="Travel">Travel</option>
                        <option value="Others">Others</option>
                    </select>
            </td>
            <td>
                <input
                    value={obj.origem}
                    name='origem'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.origem = el)} />
            </td>
            <td>
                <input
                    value={obj.destino}
                    name='destino'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.destino = el)} />
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