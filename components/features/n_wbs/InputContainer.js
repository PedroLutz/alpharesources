import styles from "../../../styles/modules/wbs_n.module.css"
import { useRef, useState, useEffect } from "react";

const InputContainer = ({ op, functions, isNew, obj, objSetter, setShowModal, area_id }) => {
    const camposRef = useRef({
        name: null,
        color: null
    });

    useEffect(() => {
        if(area_id){
            objSetter({
                ...obj,
                area_id
            })
        }
    }, [area_id])

    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value
        })
        e.target.classList.remove('campo-vazio');
    }

    return (
        <div className={styles.block}>
            <div className={styles.new_inputs}>
                <input
                    name="name"
                    value={obj.name}
                    onChange={handleChange}
                    placeholder={`New ${op == 'area' ? 'area' : 'item'}`}
                    ref={el => (camposRef.current.name = el)}
                />
                {op == 'area' && (
                    <div className={styles.new_inputs_color}>
                        <label>Color: </label>
                        <input
                            name="color"
                            value={obj.color}
                            type="color" 
                            onChange={handleChange}
                            ref={el => (camposRef.current.color = el)}
                        />
                    </div>
                )}

            </div>
            <div className={styles.action_buttons}>
                <button onClick={functions?.submit}>✔️</button>
                {isNew == false &&
                    <button onClick={functions?.cancel}>✖️</button>
                }
            </div>
        </div>
    )

}

export default InputContainer;