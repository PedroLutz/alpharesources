import styles from "../../../styles/modules/wbs_n.module.css"
import { useRef, useState, useEffect } from "react";

const InputContainer = ({ op, functions, isNew, obj, objSetter, setShowModal, area_id, style }) => {
    const camposItemVazios = {
        area_id: area_id || '',
        name: ''
    };
    const [newItem, setNewItem] = useState(camposItemVazios);

    const camposRef = useRef({
        name: null,
        color: null
    });

    useEffect(() => {
        if (area_id) {
            if(op == 'item' && isNew == true){
                setNewItem({
                    ...newItem,
                    area_id
                })
            } else {
                objSetter({
                    ...obj,
                    area_id
                })
            }
        }
    }, [area_id])

    const handleChange = (e, obj, objSetter) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value
        })
        e.target.classList.remove('campo-vazio');
    }

    if(isNew == true && op == 'item'){
        return (
        <div className={styles.block} style={style}>
            <div className={styles.new_inputs}>
                <input
                    name="name"
                    value={newItem.name}
                    onChange={(e) => handleChange(e, newItem, setNewItem)}
                    placeholder="New item"
                    ref={el => (camposRef.current.name = el)}
                />
            </div>
            <div className={styles.action_buttons}>
                <button onClick={() => {
                    functions?.submit(newItem);
                    setNewItem(camposItemVazios)
                    }}>✔️</button>
            </div>
        </div>
        )
    }

    return (
        <div className={styles.block} style={style}>
            <div className={styles.new_inputs}>
                <input
                    name="name"
                    value={obj.name}
                    onChange={(e) => handleChange(e, obj, objSetter)}
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
                            onChange={(e) => handleChange(e, obj, objSetter)}
                            ref={el => (camposRef.current.color = el)}
                        />
                    </div>
                )}
            </div>
            <div className={styles.action_buttons}>
                <button onClick={() => {
                    functions?.submit(); 
                    functions?.hide && functions?.hide()}}>✔️</button>
                {isNew == false &&
                    <button onClick={functions?.hide}>✖️</button>
                }
            </div>
        </div>
    )

}

export default InputContainer;