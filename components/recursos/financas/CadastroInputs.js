import React, { useState, useRef, useEffect, useContext } from 'react';
import { fetchData } from '../../../functions/crud';
import { AuthContext } from '../../../contexts/AuthContext';

const CadastroTabela = ({ obj, objSetter, tipo, funcao, setExibirModal }) => {
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
    const { isAdmin } = useContext(AuthContext);


    //funcao que retorna a quantidade de campos vazios e o nome dos campos vazios
    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => value === null || value === "");
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };


    //funcao que busca os elementos da WBS
    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };


    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchElementos();
    }, []);


    //funcao que passa os dados dos inputs pro formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };


    //funcao que valida os dados do formulario de acordo com varias especificacoes
    const validaDados = () => {
        if (obj.valor < 0) {
            camposRef.current['valor'].classList.add('campo-vazio');
            setExibirModal('valorNegativo')
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
            setExibirModal('inputsVazios');
            return true;
        }
    }

    //funcao que chama as funcoes de submit de acordo com o tipo de funcao, e apenas se os dados forem validos
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
            <td>
                <select
                    value={obj.tipo}
                    name='tipo'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.tipo = el)}
                >
                    <option value="" defaultValue>Type</option>
                    <option value='Income'>Income</option>
                    <option value='Expense'>Cost</option>
                    <option value='Exchange'>Exchange</option>
                </select>
            </td>
            <td>
                <input
                    value={obj.descricao}
                    name='descricao'
                    onChange={handleChange}
                    ref={el => (camposRef.current.descricao = el)} />
            </td>
            <td>
                <input type='number'
                    value={obj.valor}
                    name='valor'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.valor = el)} />
            </td>
            <td>
                <input type="date"
                    value={obj.data}
                    name='data'
                    onChange={handleChange}
                    ref={el => (camposRef.current.data = el)} />
            </td>
            <td>
                <select
                    name="area"
                    onChange={handleChange}
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
                <input
                    value={obj.origem}
                    name='origem'
                    onChange={handleChange}
                    ref={el => (camposRef.current.origem = el)} />
            </td>
            <td>
                <input
                    value={obj.destino}
                    name='destino'
                    onChange={handleChange}
                    ref={el => (camposRef.current.destino = el)} />
            </td>
            <td>-</td>
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

export default CadastroTabela;