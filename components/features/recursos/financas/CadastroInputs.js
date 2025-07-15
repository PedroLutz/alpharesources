import React, { useState, useRef, useEffect, useContext } from 'react';
import styles from '../../../../styles/modules/financas.module.css'
import { fetchData } from '../../../../functions/crud';
import { AuthContext } from '../../../../contexts/AuthContext';

const CadastroTabela = ({ obj, objSetter, tipo, funcoes, setExibirModal }) => {
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
    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if(isNumber){
            value = value.replace(/[^0-9.]/g, '');
        }
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

    //funcao que chama as funcoes de submit de acordo com o tipo de funcao, e apenas se os dados forem validos
    const handleSubmit = async () => {
        const isInvalido = validaDados();
        if(isInvalido) return;
        funcoes?.enviar();
    }

    return (
        <tr className='linha-cadastro'>
            <td id={styles.tdTipo}>
                <select
                    value={obj.tipo}
                    name='tipo'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.tipo = el)}
                >
                    <option value="" defaultValue>Type</option>
                    <option value='Income'>Income</option>
                    <option value='Expense'>Cost</option>
                    <option value='Exchange'>Exchange</option>
                </select>
            </td>
            <td id={styles.tdDescricao}>
                <input
                    value={obj.descricao}
                    name='descricao'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.descricao = el)} />
            </td>
            <td id={styles.tdValor}>
                <input
                    value={obj.valor}
                    name='valor'
                    onChange={(e) => handleChange(e, true)}
                    min="0"
                    ref={el => (camposRef.current.valor = el)} />
            </td>
            <td id={styles.tdData}>
                <input type="date"
                    value={obj.data}
                    name='data'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.data = el)} />
            </td>
            <td id={styles.tdArea}>
                <select
                    name="area"
                    onChange={(e) => handleChange(e, false)}
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
            <td id={styles.tdOrigem}>
                <input
                    value={obj.origem}
                    name='origem'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.origem = el)} />
            </td>
            <td id={styles.tdDestino}>
                <input
                    value={obj.destino}
                    name='destino'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.destino = el)} />
            </td>
            <td>-</td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)} disabled={!isAdmin}>Add new</button>
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

export default CadastroTabela;