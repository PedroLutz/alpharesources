import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { handleFetch } from '../../../../functions/crud_s';
import styles from '../../../../styles/modules/responsabilidades.module.css'
import useAuth from '../../../../hooks/useAuth';

const CadastroTabela = ({ obj, objSetter, tipo, funcoes, setExibirModal, isEditor, loaded }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([])
    const [itensPorArea, setItensPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [areas, setAreas] = useState([]);
    const { token } = useAuth();

    const camposRef = useRef({
        area: null,
        item: null,
        responsabilidades: null
    });

    const atualizarItensPorArea = (area, setter) => {
        const itensDaArea = elementosWBS.filter(item => item.wbs_area.id == area
            && funcoes?.checkItemDisponivel(item.id));
        setter(itensDaArea);
    }

    useEffect(() => {
        if (areaSelecionada != '') {
            atualizarItensPorArea(areaSelecionada, setItensPorArea);
        }
    }, [areaSelecionada, elementosWBS]);

    //useEffect que roda apenas na primeira execucao
    useEffect(() => {
        fetchElementos();
    }, []);

    useEffect(() => {
        if (loaded == true) {
            setAreas([...new Map(
                elementosWBS
                    .filter(item => funcoes?.checkAreaDisponivel(item.wbs_area.id, item.id) )
                    .map(item => [
                        item.wbs_area.id,
                        { id: item.wbs_area.id, name: item.wbs_area.name }])
            ).values()
            ]);
            setItensPorArea([]);
        }
    }, [loaded, elementosWBS]);


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

    //funcao para buscar os elementos da WBS para inserção nos selects
    const fetchElementos = async () => {
        var elementos;
        try {
            const data = await handleFetch({
                table: 'wbs_item',
                query: 'with_areas',
                token
            })
            elementos = data?.data ?? [];
        } finally {
            setAreas([...new Map(
                elementos
                    .filter(item => funcoes?.checkAreaDisponivel(item.wbs_area.id, item.id))
                    .map(item => [
                        item.wbs_area.id,
                        { id: item.wbs_area.id, name: item.wbs_area.name }])
            ).values()
            ]);
            setElementosWBS(elementos);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
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

    const handleSubmit = async () => {
        const isInvalido = validaDados();
        if (isInvalido == true) return;
        if(await funcoes?.enviar()){
            setAreaSelecionada('');
            setItensPorArea([]);
        }
    };

    const fetchNomesMembros = async () => {
        const data = await handleFetch({
            table: "member",
            query: 'names',
            token
        });
        setNomesMembros(data.data);
    };
   

    useEffect(() => {
        fetchNomesMembros();
        fetchElementos();
    }, []);

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