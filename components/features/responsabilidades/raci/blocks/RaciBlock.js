import { useState } from "react";
import CadastroTabela from "../forms/CadastroInputs";
import { useRaci } from "../data/RaciContext";
import usePerm from "../../../../../hooks/usePerm";
import { getTextColor } from "../../../../../functions/colors";
import { useEffect } from "react";
import styles from '../../../../../styles/modules/responsabilidades.module.css'
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import { calculateRowSpan } from "../../../../../functions/general";

const RaciBlock = ({ item, index, setExibirModal, setConfirmDeleteItem, verOpcoes }) => {
    const [novosDados, setNovosDados] = useState({});
    const [velhosDados, setVelhosDados] = useState({});
    const { nomesMembros, itensRaci, setIsLoading, inputToMember, fetchData } = useRaci();
    const { isEditor } = usePerm();
    const {user, token} = useAuth();
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);

    const raciByMemberId = new Map()
    item.raci?.forEach(r => {
        raciByMemberId.set(r.member_id, r)
    })

    useEffect(() => {
        const obj = { item_id: item.item_id };
        item?.raci?.forEach((r) => {
            obj["input" + r.member_id] = r.responsibility;
        })
        setNovosDados(obj);
        setVelhosDados(item);
    }, [item])

    const isValid = () => {
        if (!Object.values(novosDados).some(v => v == "accountable")) {
            setExibirModal('semAprovador');
            return false;
        }
        if (!Object.values(novosDados).some(v => v == "responsible")) {
            setExibirModal('semResponsavel');
            return false;
        }
        if (Object.values(novosDados).reduce((acc, cur) => {
            if (cur == 'accountable') acc++;
            return acc;
        }, 0) > 1) {
            setExibirModal('muitoAprovador');
            return false;
        }
        return true;
    }

    const enviar = async () => {
        if (!isValid()) return;
        setIsLoading(true);
        const functions = [];
        for (const key in novosDados) {
            if (key != 'item_id' && key != 'id') {
                const responsibility = novosDados[key];
                const member_id = inputToMember[key];
                const dadoOriginal = velhosDados?.raci?.find(i => i.member_id == member_id) ?? undefined;
                if (dadoOriginal !== undefined && dadoOriginal?.responsibility != responsibility) {
                    functions.push(handleReq({
                        table: 'raci_item',
                        route: 'update',
                        token,
                        data: { id: dadoOriginal.id, item_id: novosDados.item_id, member_id, responsibility, user_id: user.id },
                    }));
                } else {
                    functions.push(handleReq({
                        table: 'raci_item',
                        route: 'create',
                        token,
                        data: { item_id: novosDados.item_id, member_id, responsibility, user_id: user.id },
                    }));
                }
            }
        }
        await Promise.all(functions);
        setIsLoading(false);
        await fetchData();
        setIsBeingUpdated(false);
    };

    return (
        <tr key={index} style={{ backgroundColor: item?.area_color, color: getTextColor(item?.area_color) }}>
            {index === 0 || itensRaci[index - 1].area_name !== item?.area_name ? (
                <td rowSpan={calculateRowSpan(itensRaci, item.area_name, index, "area_name")}
                    className={styles.raciTdArea}>{item?.area_name}</td>
            ) : null}
            <td className={styles.raciTdItem}>{item.item_name}</td>
            {isBeingUpdated ? (
                <>
                    <CadastroTabela
                        obj={novosDados}
                        objSetter={setNovosDados}
                        funcoes={{
                            enviar,
                            cancelar: () => setIsBeingUpdated(false),
                        }}
                        setExibirModal={setExibirModal}
                        tipo='update' />
                </>
            ) : (
                <>
                    {nomesMembros.map((membro, _) => {
                        const raci = raciByMemberId.get(membro.id)
                        return (
                            <td key={membro.id}>
                                {raci?.responsibility?.[0]?.toUpperCase() ?? "-"}
                            </td>
                        )
                    })}
                    {verOpcoes && (
                        <td className="botoes_acoes lastMaior">
                            <button type="button"
                                onClick={() => setConfirmDeleteItem(item)}
                                disabled={!isEditor}>❌</button>
                            <button onClick={() => {
                                setIsBeingUpdated(true);
                            }} disabled={!isEditor}>⚙️</button>

                        </td>
                    )}

                </>
            )
            }
        </tr>
    )
};

export default RaciBlock;