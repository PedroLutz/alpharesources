import styles from "../../../styles/modules/wbs.module.css"
import { useRef, useState, useEffect } from "react";

const InputContainer = ({ op, functions, isNew, obj, objSetter, setExibirModal, area_id, style, disabled }) => {
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

    const handleSubmit = (isItem) => {
        const usedObj = op == 'item' && isNew == true ? newItem : obj;

        const camposConsiderados = {...usedObj};
        delete camposConsiderados.id;
        const camposVazios = Object.entries(camposConsiderados)
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

        let submitSuccess;

        if(isItem) submitSuccess = functions?.submit(newItem);
        else submitSuccess = functions?.submit();

        if(!submitSuccess){
            camposRef.current.name.classList.add('campo-vazio');
            return;
        }

        if(functions?.hide) functions?.hide();
        if(isItem) setNewItem(camposItemVazios);
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
                <button onClick={() => handleSubmit(true)} disabled={disabled}>✔️</button>
            </div>
        </div>
        )
    }

    return (
        <div className={styles.block} style={{...style, backgroundColor: obj.color}}>
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
                            value={obj.color || '#FFFFFF'}
                            type="color"
                            onChange={(e) => handleChange(e, obj, objSetter)}
                            ref={el => (camposRef.current.color = el)}
                        />
                    </div>
                )}
            </div>
            <div className={styles.action_buttons}>
                <button onClick={handleSubmit} disabled={disabled}>✔️</button>
                {isNew == false &&
                    <button onClick={functions?.hide}>✖️</button>
                }
            </div>
        </div>
    )

}

export default InputContainer;