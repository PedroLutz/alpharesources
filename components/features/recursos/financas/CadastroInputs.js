import React, { useState, useRef, useEffect } from 'react';
import styles from '../../../../styles/modules/financas.module.css'
import { handleFetch } from "../../../../functions/crud_s";
import useAuth from "../../../../hooks/useAuth";
import usePerm from '../../../../hooks/usePerm';

const CadastroTabela = ({ obj, objSetter, tipo, funcoes, setExibirModal }) => {
    const [areas, setAreas] = useState([]);
    const { isEditor } = usePerm();
    const camposRef = useRef({
        type: null,
        description: null,
        value: null,
        date: null,
        area_id: null,
        origin: null,
        destination: null
    })
    const { token } = useAuth();

    //funcao que busca os elementos da WBS
    const fetchElementos = async () => {
        const data = await handleFetch({
            table: 'wbs_area',
            query: 'all',
            token
        })
        setAreas(data.data);
    };


    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchElementos();
    }, []);


    //funcao que passa os dados dos inputs pro formulario
    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if (isNumber) {
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
        if (obj.value < 0) {
            camposRef.current['value'].classList.add('campo-vazio');
            setExibirModal('valorNegativo')
            return false;
        }
        const camposVazios = Object.keys(obj).filter(
            key => obj[key] === null || obj[key] === ""
        );

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                    camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return false;
        }

        return true;
    }

    //funcao que chama as funcoes de submit de acordo com o tipo de funcao, e apenas se os dados forem validos
    const handleSubmit = async () => {
        const isValid = validaDados();
        if (!isValid) return;
        funcoes?.enviar();
    }

    return (
        <tr className='linha-cadastro'>
            <td className={styles.tdTipo}>
                <select
                    value={obj.type}
                    name='type'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.type = el)}
                >
                    <option value="" defaultValue>Type</option>
                    <option value='income'>Income</option>
                    <option value='cost'>Cost</option>
                    <option value='exchange'>Exchange</option>
                </select>
            </td>
            <td className={styles.tdDescricao}>
                <input
                    value={obj.description}
                    name='description'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.description = el)} />
            </td>
            <td className={styles.tdValor}>
                <input
                    value={obj.value}
                    name='value'
                    onChange={(e) => handleChange(e, true)}
                    min="0"
                    ref={el => (camposRef.current.value = el)} />
            </td>
            <td className={styles.tdData}>
                <input type="date"
                    value={obj.date}
                    name='date'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.date = el)} />
            </td>
            <td className={styles.tdArea}>
                <select
                    name="area_id"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.area_id}
                    ref={el => (camposRef.current.area_id = el)}

                >
                    <option value="" defaultValue>Area</option>
                    {areas.map((area, _) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                    ))};
                    <option value={-1}>Others</option>
                </select>
            </td>
            <td className={styles.tdOrigem}>
                <input
                    value={obj.origin}
                    name='origin'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.origin = el)} />
            </td>
            <td className={styles.tdDestino}>
                <input
                    value={obj.destination}
                    name='destination'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.destination = el)} />
            </td>
            <td>-</td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)} disabled={!isEditor}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit} disabled={!isEditor}>✔️</button>
                        <button onClick={funcoes?.cancelar} disabled={!isEditor}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default CadastroTabela;