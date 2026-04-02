import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import { useHabilidade } from "../data/HabilidadeContext";
import styles from '../../../../../styles/modules/responsabilidades.module.css'
import { useEffect } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import Inputs from "../forms/Inputs";

const HabilidadeBlock = ({ habilidade, setExibirModal, setConfirmDeleteItem, index }) => {
    const { token } = useAuth();
    const { isEditor } = usePerm();
    const { habilidades, setIsLoading, fetchData } = useHabilidade();
    const [novosDados, setNovosDados] = useState(habilidade);
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);

    useEffect(() => {
        setNovosDados(habilidade);
    }, [])

    const handleUpdateItem = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: "skill",
                route: 'update',
                token,
                data: {
                    id: novosDados.id,
                    role_id: novosDados.role_id,
                    skill: novosDados.skill,
                    cur_level: novosDados.cur_level,
                    min_level: novosDados.min_level,
                    action: novosDados.action
                },
                fetchData
            })
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsLoading(false);
        setIsBeingUpdated(false);
    };

    const compareArraysOfObjects = (arr1, arr2) => {
        function compareObjects(o1, o2) {
            const keys1 = Object.keys(o1);
            const keys2 = Object.keys(o2);

            if (keys1.length != keys2.length) return false;

            return keys1.every(key => o1[key] === o2[key]);
        }

        if (arr1.length !== arr2.length) return false;
        return arr1.every((value, i) => compareObjects(value, arr2[i]));
    }

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < habilidades.length; i++) {

            let comparedData = habilidades[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], habilidades[i]);
            }

            let comparison = comparedData === currentArea;
            if (parametro === 'role.wbs_area') comparison = compareArraysOfObjects(comparedData, currentArea);
            if (comparison) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    const shouldMergeArea = index === 0 || !compareArraysOfObjects(habilidades[index - 1].role?.wbs_area, habilidade.role?.wbs_area);
    const shouldMergeRole = index === 0 || habilidades[index - 1].role?.role !== habilidade?.role?.role;
    const shouldMergeMember = index === 0 || habilidades[index - 1]?.role?.member?.name !== habilidade?.role?.member?.name;

    return (
        <tr>
            {shouldMergeArea ? (
                <td rowSpan={calculateRowSpan(habilidade?.role?.wbs_area, index, 'role.wbs_area')}
                >{habilidade?.role?.wbs_area?.reduce((acc, cur) => {
                    if (acc == "") return acc + cur.name;
                    return acc + ", " + cur.name;
                }, "")}</td>
            ) : null}

            {shouldMergeRole ? (
                <td rowSpan={calculateRowSpan(habilidade?.role?.role, index, 'role.role')}
                >{habilidade?.role?.role}</td>
            ) : null}

            {shouldMergeMember ? (
                <td rowSpan={calculateRowSpan(habilidade?.role?.member?.name, index, 'role.member.name')}
                >{habilidade?.role?.member?.name}</td>
            ) : null}

            {isBeingUpdated ? (
                <Inputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar: handleUpdateItem,
                        cancelar: () => setIsBeingUpdated(false)
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <>
                    <td>{habilidade.skill}</td>
                    <td>{habilidade.cur_level}</td>
                    <td>{habilidade.min_level}</td>
                    <td className={styles.habilidadeTdAcao}>{habilidade.action}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(habilidade)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingUpdated(true)
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </>
            )}
        </tr>
    )
};

export default HabilidadeBlock;