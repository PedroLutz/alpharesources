import React, { useState, useRef, useEffect } from 'react';
import styles from '../../../../../styles/modules/responsabilidades.module.css'
import usePerm from '../../../../../hooks/usePerm';
import { useRaci } from '../data/RaciContext';

const CadastroTabela = ({ obj, objSetter, tipo, funcoes, setExibirModal }) => {
    const {areasSet, itensSet, nomesMembros, elementosWbs} = useRaci();
    const [itensPorArea, setItensPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [areas, setAreas] = useState([]);
    const {isEditor} = usePerm();

    const camposRef = useRef({
        area: null,
        item: null,
        responsabilidades: null
    });

    const checkItemDisponivel = (item_id) => {
        if (itensSet.size == 0) {
            return true;
        }

        return !itensSet.has(item_id);
    }

    const checkAreaDisponivel = (area_id, item_id) => {
        if (areasSet.size == 0) {
            return true;
        }

        if (areasSet.has(area_id)) {
            return checkItemDisponivel(item_id);
        }

        return true;
    }

    const atualizarItensPorArea = (area, setter) => {
        const itensDaArea = elementosWbs.filter(item => item.wbs_area.id == area
            && checkItemDisponivel(item.id));
        setter(itensDaArea);
    }

    useEffect(() => {
        if (areaSelecionada != '') {
            atualizarItensPorArea(areaSelecionada, setItensPorArea);
        }
    }, [areaSelecionada, elementosWbs]);

    useEffect(() => {
            setAreas([...new Map(
                elementosWbs
                    .filter(item => checkAreaDisponivel(item.wbs_area.id, item.id) )
                    .map(item => [
                        item.wbs_area.id,
                        { id: item.wbs_area.id, name: item.wbs_area.name }])
            ).values()
            ]);
            setItensPorArea([]);
        
    }, [ elementosWbs, itensSet, areasSet]);


    //so executa quando o tipo for cadastro pq a atualizacao n altera nem a area nem o item
    //ent n pode mexer no obj
    useEffect(() => {
        if (tipo == 'cadastro') {
            objSetter({
                ...obj,
                item_id: ''
            })
        }
    }, [areaSelecionada]);

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        objSetter({ ...obj, item_id: "" });
        atualizarItensPorArea(areaSelecionada, setItensPorArea);
        setAreaSelecionada(areaSelecionada);
        camposRef.current.area.classList.remove('campo-vazio');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        const camposVazios = Object.keys(obj)
        .filter(key => obj[key] === null || obj[key] === "");

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');   
            });
            setExibirModal('inputsVazios');
            return false;
        }
        return true;
    }

    const handleSubmit = async () => {
        const isValid = validaDados();
        if (!isValid) return;
        if(await funcoes?.enviar()){
            setAreaSelecionada('');
            setItensPorArea([]);
        }
    };

    return (
        <React.Fragment>
            {tipo !== 'update' && (
                <td className={styles.raciTdArea}>
                    <select
                        name="area"
                        onChange={(e) => handleAreaChange(e, false)}
                        value={areaSelecionada || ''}
                        ref={el => (camposRef.current.area = el)}
                    >
                        <option value="" defaultValue>Area</option>
                        {areas.map((area, index) => (
                            <option key={index} value={area.id}>{area.name}</option>
                        ))}
                    </select>
                </td>
            )}
            {tipo !== 'update' && (
                <td className={styles.raciTdItem}>
                    <select
                        name="item_id"
                        onChange={handleChange}
                        value={obj.item_id || ''}
                        ref={el => (camposRef.current.item = el)}
                    >
                        <option value="" defaultValue>Item</option>
                        {itensPorArea.map((item, index) => (
                            <option key={index} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </td>
            )}
            {nomesMembros.map((membro, index) => (
                <td key={index} className="mini-input column">
                    <select
                        id={`input${membro.id}`}
                        name={`input${membro.id}`}
                        onChange={handleChange}
                        value={obj[`input${membro.id}`]}
                        ref={el => (camposRef.current[`input${membro.id}`] = el)}
                    >
                        <option value="" defaultValue>RACI</option>
                        <option value="responsible">R</option>
                        <option value="accountable">A</option>
                        <option value="consulted">C</option>
                        <option value="informated">I</option>
                    </select>
                </td>
            ))}
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isEditor}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </React.Fragment>
    )
}

export default CadastroTabela;