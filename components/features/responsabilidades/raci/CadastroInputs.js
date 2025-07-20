import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { fetchData } from '../../../../functions/crud';
import { AuthContext } from '../../../../contexts/AuthContext';
import styles from '../../../../styles/modules/responsabilidades.module.css'

const CadastroTabela = ({ obj, objSetter, tipo, funcoes, setExibirModal }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([])
    const [itensPorArea, setItensPorArea] = useState([]);
    const camposRef = useRef({
        area: null,
        item: null,
        responsabilidades: null
    });
    const {isAdmin} = useContext(AuthContext)

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };

    useEffect(() => {
        if(tipo === 'cadastro'){
            objSetter({
                ...obj,
                item: ''
            });
        }
    }, [obj.area]);


    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
        setItensPorArea(itensDaArea);

        handleChange(e);
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
        if(isInvalido == true) return;
        funcoes?.enviar();
    };

    const fetchNomesMembros = async () => {
        const data = await fetchData('responsabilidades/membros/get/nomes');
        setNomesMembros(data.nomes);
    };

    const getCleanName = (str) => {
        const removeAccents = (str) => {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };
        return removeAccents(str.split(" ").join(""));
    };

    const inputNames = useMemo(() => {
        const firstNames = new Map();
        const fullNames = [];
        const inputNames = [];

        nomesMembros.forEach((membro) => {
            const nomeCompleto = membro.nome;
            const firstName = nomeCompleto.split(' ')[0];
            const lastName = nomeCompleto.split(' ')[1];
            const corrigirNomeCompleto = () => {
                let index = fullNames.findIndex(x => x.includes(firstName));
                let otherLastName = fullNames[index].split(' ')[1];
                inputNames[index] = `${firstName} ${otherLastName}`;
            };

            if (firstNames.has(firstName)) {
                const existingHeader = firstNames.get(firstName);
                inputNames.push(`${existingHeader} ${lastName}`);
                fullNames.push(`${firstName} ${lastName}`);
                corrigirNomeCompleto();
            } else {
                firstNames.set(firstName, nomeCompleto.split(' ')[0]);
                inputNames.push(firstName);
                fullNames.push(`${firstName} ${lastName}`);
            };
        });
        return inputNames;
    }, [nomesMembros]);

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
                        onChange={handleAreaChange}
                        value={obj.area}
                        ref={el => (camposRef.current.area = el)}

                    >
                        <option value="" defaultValue>Area</option>
                        {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                            <option key={index} value={area}>{area}</option>
                        ))};
                    </select>
                </td>
            )}
            {tipo !== 'update' && (
                <td className={styles.raciTdItem}>
                    <select
                        value={obj.item}
                        name='item'
                        onChange={handleChange}
                        ref={el => (camposRef.current.item = el)}
                    >
                        <option value="" defaultValue>Item</option>
                        {itensPorArea.map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </td>
            )}
            {inputNames.map((membro, index) => (
                <td key={index} className="mini-input column">
                    <select
                        id={"input" + getCleanName(membro)}
                        name={"input" + getCleanName(membro)}
                        onChange={handleChange}
                        value={obj["input" + getCleanName(membro)]}
                        ref={el => (camposRef.current["input" + getCleanName(membro)] = el)}
                    >
                        <option value="" defaultValue>RACI</option>
                        <option value="R">R</option>
                        <option value="A">A</option>
                        <option value="C">C</option>
                        <option value="I">I</option>
                    </select>
                </td>
            ))}
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isAdmin}>Add new</button>
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