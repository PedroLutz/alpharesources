import React, { useEffect, useRef, useContext } from "react";
import styles from '../../styles/modules/wbs.module.css';
import { AuthContext } from "../../contexts/AuthContext";

const BlocoInputs = ({ tipo, obj, objSetter, funcoes, setExibirModal, area, isNameUsed }) => {
    const camposRef = useRef({
        cor: null,
        item: null,
        area: null
    });
    const { isAdmin } = useContext(AuthContext)

    //esse useEffect executa todo re-render
    useEffect(() => {
        if (area) {
            objSetter({
                [`novo${area}`]: { area: area, item: '' }
            })
        }
    }, [])

    //essa funcao trata as mudancas especificamente em cores
    const handleChangeCor = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value
        })
    }

    //essa funcao trata das mudancas em area e item, tratando de forma diferente se
    //o componente foi chamado para uma area ou um item
    const handleChange = (e) => {
        const { name, value } = e.target;
        var key;
        if (area) key = `novo${area}`;
        if (!area) {
            objSetter({
                ...obj,
                [name]: value,
            });
        } else {
            objSetter(prevState => ({
                ...prevState,
                [key]: {
                    ...prevState[key],
                    [name]: value
                }
            }));
        }
        e.target.classList.remove('campo-vazio');
    };

    //essa funcao verifica os casos de invalidez, e se algum deles for verdadeiro,
    //chama a funcao setExibirModal para levantar um modal avisando o problema
    const validaDados = () => {
        const nomeUsado = isNameUsed(obj);
        if (nomeUsado) {
            setExibirModal && setExibirModal('nomeRepetido')
            return true
        };

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

        if (tipo === 'cadastroItem' && area && !obj[`novo${area}`]?.item) {
            setExibirModal && setExibirModal('inputsVazios');
            return true;
        }

        return false;
    };

    const handleSubmit = async () => {
        const isInvalido = tipo === 'updateCor' ? false : validaDados();
        if (isInvalido) return;
        if (area) {
            const key = `novo${area}`;
            objSetter(prevState => ({
                ...prevState,
                [key]: {
                    ...prevState[key],
                    item: ''
                }
            }));
        }
        await funcoes?.enviar(area);
    }

    if (tipo === 'cadastroArea') {
        return (
            <div className={`${styles.wbsArea} ${styles.wbsAreaCadastro}`}>
                <h3>Add new area</h3>

                <input placeholder="Area"
                    value={obj.area}
                    name='area'
                    onChange={handleChange}
                    ref={el => (camposRef.current.area = el)} />

                <input placeholder='Item'
                    value={obj.item}
                    name='item'
                    onChange={handleChange}
                    ref={el => (camposRef.current.item = el)} />

                <input
                    type='color'
                    value={obj.cor}
                    name='cor'
                    style={{ width: '11.5rem', backgroundColor: 'transparent' }}
                    onChange={handleChange}
                    ref={el => (camposRef.current.cor = el)} />

                <button onClick={handleSubmit} disabled={!isAdmin}>Add new</button>
            </div>
        )
    }
    if (tipo === 'cadastroItem') {
        return (
            <div>
                <div className={styles.wbsItem}>
                    <input placeholder='Item'
                        value={obj[`novo${area}`]?.item || ''}
                        name='item'
                        data-area={area}
                        onChange={handleChange}
                        ref={el => (camposRef.current.item = el)} />
                    <button onClick={handleSubmit} disabled={!isAdmin}>➕</button>
                </div>
            </div>
        )
    }
    if (tipo === 'updateItem') {
        return (
            <React.Fragment>
                <div className={styles.editItem}>
                    <input value={obj.item}
                        name='item'
                        onChange={handleChange}
                        ref={el => (camposRef.current.item = el)} />

                    <button onClick={handleSubmit}>✔️</button>
                    <button onClick={funcoes?.cancelar}>✖️</button>
                </div>
            </React.Fragment>
        )
    }
    if (tipo === 'updateArea') {
        return (
            <React.Fragment>
                <div className={styles.editArea}>
                    <input value={obj.area}
                        name='area'
                        onChange={handleChange}
                        ref={el => (camposRef.current.area = el)} />
                    <button onClick={handleSubmit}>✔️</button>
                    <button onClick={funcoes?.cancelar}>✖️</button>
                </div>
            </React.Fragment>
        )
    }
    if (tipo === 'updateCor') {
        return (
            <React.Fragment>
                <div className={styles.editArea}>
                    <input value={obj.cor}
                        type='color'
                        name='cor'
                        onChange={handleChangeCor}
                        ref={el => (camposRef.current.cor = el)} />
                    <button onClick={handleSubmit}>✔️</button>
                    <button onClick={funcoes?.cancelar}>✖️</button>
                </div>
            </React.Fragment>
        )
    }
}

export default BlocoInputs;