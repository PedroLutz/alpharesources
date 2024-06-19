import React, { useState, useRef } from 'react';

const CadastroTabela = ({ obj, objSetter, tipo, funcao, dadosVazios }) => {
    const [emptyFields, setEmptyFields] = useState([]);
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
    })

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => !value);
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

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

    const handleSubmit = async (e) => {
        if(obj.valor < 0){
            camposRef.current['valor'].classList.add('campo-vazio');
            return;
        }
        const [isEmpty, camposVazios] = isFormVazio(obj);
        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
              });
            setEmptyFields(camposVazios);
            dadosVazios(true);
            return;
        }
        funcao(e);
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
                    value={obj.area}
                    name='area'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.area = el)}
                >
                    <option value="" disabled>Area</option>
                    <option value="3D printing">3D printing</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Extras">Extras</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Machining">Machining</option>
                    <option value="Painting">Painting</option>
                    <option value="Pit Display">Pit Display</option>
                    <option value="Portfolios">Portfolios</option>
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="Traveling">Traveling</option>
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
                        <button onClick={funcao.funcao1}>✔️</button>
                        <button onClick={funcao.funcao2}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default CadastroTabela;