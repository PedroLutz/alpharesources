import React, { useEffect, useState, useRef } from "react";
import styles from '../../styles/modules/wbs.module.css';

const BlocoInputs = ({ tipo, obj, objSetter, funcao, checkDados, area }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const camposRef = useRef({
        item: null,
        area: null
    });

    useEffect(() => {
        if (area) {
            objSetter({
                [`novo${area}`]: { area: area, item: '' }
            })
        }
    }, [])

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => !value);
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    const handleChange = (e, setter, obj) => {
        const { name, value } = e.target;
        var key;
        if (area) { areaValor = e.target.getAttribute('data-area'); key = `novo${area}` };
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        if (!area) {
            setter({
                ...obj,
                [name]: value,
            });
        } else {
            setter(prevState => ({
                ...prevState,
                [key]: {
                    ...prevState[key],
                    [name]: value
                }
            }));
        }

        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);

        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });

            checkDados && checkDados('inputsVazios');
            return true;
        }

        if (tipo === 'cadastroItem' && area && !obj[`novo${area}`]?.item) {
            checkDados && checkDados('inputsVazios');
            return true;
        }

        return false;
    };


    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            if (!isInvalido) {
                if (area) {
                    await funcao(e, area);
                    var areaValor, key;
                    areaValor = e.target.getAttribute('data-area'); key = `novo${area}`;
                    objSetter(prevState => ({
                        ...prevState,
                        [key]: {
                            ...prevState[key],
                            item: ''
                        }
                    }));

                } else {
                    funcao(e);
                }
            }
        }
    }

    if (tipo === 'cadastroArea') {
        return (
            <div className={`${styles.wbsArea} ${styles.wbsAreaCadastro}`}>
                <h3>Add new area</h3>
                <input placeholder="Area"
                    value={obj.area}
                    name='area'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.area = el)} />
                <input placeholder='Item'
                    value={obj.item}
                    name='item'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.item = el)} />
                <button onClick={(e) => handleSubmit(e)}>Add new</button>
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
                        onChange={(e) => handleChange(e, objSetter, obj)}
                        ref={el => (camposRef.current.item = el)} />
                        <button onClick={(e) => handleSubmit(e)}>➕</button>
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
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.item = el)} />
                <button onClick={handleSubmit}>✔️</button>
                <button onClick={funcao.funcao2}>✖️</button>
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
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.area = el)} />
                <button onClick={handleSubmit}>✔️</button>
                <button onClick={funcao.funcao2}>✖️</button>
                </div>
                
            </React.Fragment>
        )
    }
}

export default BlocoInputs;