import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/custoBeneficio.module.css'
import Inputs from "./Inputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        identificacao: "",
        descricao: "",
        custo: "",
        escala_custo: "",
        impacto: "",
        urgencia: "",
        diferencial: "",
        areas_afetadas: "",
        explicacao: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [custoBeneficios, setCustoBeneficios] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const {isAdmin} = useContext(AuthContext)

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'financas/custoBeneficio',
            dados: novoSubmit
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
        setReload(true);
    };

    const handleUpdateClick = (item) => {
        setConfirmUpdateItem(item)
        setNovosDados({
            ...item
        });
    };

    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            const updatedCustoBeneficios = custoBeneficios.map(item =>
                item._id === updatedItem._id ? { ...updatedItem } : item
            );
            setCustoBeneficios(updatedCustoBeneficios);
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'financas/custoBeneficio/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setCustoBeneficios(custoBeneficios);
                setConfirmUpdateItem(confirmUpdateItem)
                console.error("Update failed:", error);
            }
            setLoading(false)
        }
    };

    const handleConfirmDelete = () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = handleDelete({
                    route: 'financas/custoBeneficio',
                    item: confirmDeleteItem,
                    fetchDados: fetchCustoBeneficios
                });
            } finally {
                setExibirModal(`deleteSuccess-${getDeleteSuccess}`)
            }
        }
        if (getDeleteSuccess) {
            setExibirModal(`deleteSuccess`)
        } else {
            setExibirModal(`deleteFail`)
        }
        setConfirmDeleteItem(null);
    };

    const fetchCustoBeneficios = async () => {
        try {
            const data = await fetchData('financas/custoBeneficio/get/all');
            setCustoBeneficios(data.custoBeneficios);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setReload(false);
        fetchCustoBeneficios();
    }, [reload]);

    const checkDados = (tipo) => {
        setExibirModal(tipo); return;
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!'
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2>Cost-Benefit Analysis</h2>
            
            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {confirmDeleteItem && (
                <Modal objeto={{
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.identificacao}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabela_container}>
                <div className={styles.tabela_wrapper}>
                    <table className={styles.tabela}>
                        <thead>
                            <tr>
                                <th>Identification</th>
                                <th>Description</th>
                                <th>Cost</th>
                                <th>Cost Ranking</th>
                                <th>Impact</th>
                                <th>Urgency</th>
                                <th>Competitive Edge</th>
                                <th>Affected Areas</th>
                                <th>Benefit average</th>
                                <th>Cost-Benefit index</th>
                                <th>Explanation</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            
                            {custoBeneficios.map((custoBeneficio, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === custoBeneficio._id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => linhaVisivel === custoBeneficio._id ? setLinhaVisivel() : setLinhaVisivel(custoBeneficio._id)
                                            }}
                                            checkDados={checkDados}
                                        />
                                    ) : (
                                        <tr>
                                            <td>{custoBeneficio.identificacao}</td>
                                            <td>{custoBeneficio.descricao}</td>
                                            <td>R${parseFloat(custoBeneficio.custo).toFixed(2)}</td>
                                            <td>{custoBeneficio.escala_custo}</td>
                                            <td>{custoBeneficio.impacto}</td>
                                            <td>{custoBeneficio.urgencia}</td>
                                            <td>{custoBeneficio.diferencial}</td>
                                            <td>{custoBeneficio.areas_afetadas}</td>
                                            <td>{
                                            parseFloat((custoBeneficio.areas_afetadas 
                                            + custoBeneficio.impacto 
                                            + custoBeneficio.urgencia 
                                            + custoBeneficio.diferencial)
                                            /5).toFixed(2)}</td>
                                            <td>{
                                            parseFloat(((custoBeneficio.areas_afetadas + custoBeneficio.impacto 
                                            + custoBeneficio.urgencia + custoBeneficio.diferencial)
                                            /5)/custoBeneficio.escala_custo).toFixed(2)}</td>
                                            <td>{custoBeneficio.explicacao}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(custoBeneficio)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(custoBeneficio._id); handleUpdateClick(custoBeneficio)
                                                }
                                                } disabled={!isAdmin}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <Inputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcao={enviar}
                                checkDados={checkDados}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default Tabela;
