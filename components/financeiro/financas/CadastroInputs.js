import React from 'react';

const CadastroTabela = ({obj, objSetter, enviar}) => {

    const handleChange = (e, setter, obj) => {
        setter({
          ...obj,
          [e.target.name]: e.target.value,
        });
      };

    return (
        <tr className='linha-cadastro'>
            <td>
                <select style={{ width: '110px' }}
                    value={obj.tipo}
                    name='tipo'
                    onChange={(e) => handleChange(e, objSetter, obj)}>
                    <option value="" disabled>Type</option>
                    <option value='Income'>Income</option>
                    <option value='Expense'>Cost</option>
                    <option value='Exchange'>Exchange</option>
                </select>
            </td>
            <td>
                <input
                    style={{ width: '100px' }}
                    value={obj.descricao}
                    name='descricao'
                    onChange={(e) => handleChange(e, objSetter, obj)} />
            </td>
            <td>
                <input type='number'
                    style={{ width: '100px' }}
                    value={obj.valor}
                    name='valor'
                    onChange={(e) => handleChange(e, objSetter, obj)} />
            </td>
            <td>
                <input type="date"
                    style={{ width: '105px' }}
                    value={obj.data}
                    name='data'
                    onChange={(e) => handleChange(e, objSetter, obj)} />
            </td>
            <td>
                <select style={{ width: '150px' }}
                    value={obj.area}
                    name='area'
                    onChange={(e) => handleChange(e, objSetter, obj)}
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
                <input style={{ width: '100px' }}
                    value={obj.origem}
                    name='origem'
                    onChange={(e) => handleChange(e, objSetter, obj)} />
            </td>
            <td>
                <input style={{ width: '100px' }}
                    value={obj.destino}
                    name='destino'
                    onChange={(e) => handleChange(e, objSetter, obj)} />
            </td>
            <td>
                <button className='botao-padrao' onClick={enviar}>Add new</button>
            </td>
        </tr>
    )
}

export default CadastroTabela;