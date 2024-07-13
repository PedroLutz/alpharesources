import React, { useEffect, useState, useRef } from "react";
import styles from '../../styles/modules/wbs.module.css';

const BlocoInputs = ({ tipo, obj, objSetter, funcao, checkDados, area }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const camposRef = useRef({
        item: null,
        area: null
    });

    useEffect(() => {
        if(area){
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
        var areaValor, key;
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
            setEmptyFields(camposVazios);
            checkDados && checkDados('inputsVazios');
            return true;
        }
    }

    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            if (!isInvalido) {
                if(area){
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

    if (tipo === 'cadastro') {
        return (
            <div className={styles.wbsArea}>
                <h3>NEW</h3>
                <h3><input placeholder="Area"
                    value={obj.area}
                    name='area'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.area = el)} /></h3>
                <div className={styles.wbsItems}>
                    <div className={styles.wbsItem}>
                        <input placeholder='Item'
                            value={obj.item}
                            name='item'
                            onChange={(e) => handleChange(e, objSetter, obj)}
                            ref={el => (camposRef.current.item = el)} />
                    </div>
                    <div>
                        <button onClick={(e) => handleSubmit(e)}>Add new</button>
                    </div>
                </div>
            </div>
        )
    } else if(tipo === 'updateArea') {
        return (
            <div>
                <div className={styles.wbsItem}>
                    <input placeholder='Item'
                        value={obj[`novo${area}`]?.item || ''}
                        name='item'
                        data-area={area}
                        onChange={(e) => handleChange(e, objSetter, obj)}
                        ref={el => (camposRef.current.item = el)} />
                </div>
                <div>
                    <button onClick={(e) => handleSubmit(e)}>Add new</button>
                </div>
            </div>
        )
    } else if(tipo === 'update') {
        return(
            <React.Fragment>
                <input value={obj.item}
                name='item'
                onChange={(e) => handleChange(e, objSetter, obj)}
                ref={el => (camposRef.current.item = el)}/>
                <button onClick={handleSubmit}>O</button>
                </React.Fragment>
            
            
        )
    }
}

export default BlocoInputs;