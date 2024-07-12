import { useEffect, useState, useRef } from "react";
import styles from '../../styles/modules/wbs.module.css';

const BlocoInputs = ({tipo, obj, objSetter, funcao}) => {
    const camposRef = useRef({
        item: null,
        area: null
    });

    const handleChange = (e, setter, obj) => {
        const {name, value} = e.target;
        // const index = emptyFields.indexOf(name);
        // index > -1 && emptyFields.splice(index, 1);
        setter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const handleSubmit = async (e) => {
        // const isInvalido = validaDados();
        if(funcao.funcao1) {
            funcao.funcao1();
        } else {
            funcao(e);
        }
    }

    if(tipo != 'update'){
        return (
            <div className={styles.wbsArea}>
                    <h3><input placeholder="Area"
                    value={obj.area}
                    name='area'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.area = el)}/></h3>
                <div className={styles.wbsItems}>
                    <div className={styles.wbsItem}>
                        <input placeholder='Item'
                        value={obj.item}
                        name='item'
                        onChange={(e) => handleChange(e, objSetter, obj)}
                        ref={el => (camposRef.current.item = el)}/>
                    </div>
                    <div>
                        <button onClick={(e) => handleSubmit(e)}>Add new</button>
                    </div>
                </div>
            </div>
        )
    } else {
        return(
        <div>
            <div className={styles.wbsItem}>
                        <input placeholder='New item'/>
                    </div>
                    <div>
                        <button>Add new</button>
                    </div>
        </div>
        )
    }
}

export default BlocoInputs;