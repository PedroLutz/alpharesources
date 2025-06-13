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
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [custoBeneficios, setCustoBeneficios] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext)


    //funcao que envia os dados de novoSubmit para cadastro
    const enviar = async () => {
        await handleSubmit({
            route: 'financas/custoBeneficio',
            dados: novoSubmit,
            fetchDados: fetchCustoBeneficios
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    //funcao que trata os dados e os envia para atualizacao
    const handleUpdateItem = async () => {
        setLoading(true);
        delete novosDados.mediaBeneficios;
        try {
            await handleUpdate({
                route: 'financas/custoBeneficio/update?id',
                dados: novosDados,
                fetchDados: fetchCustoBeneficios
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLoading(false);
        setLinhaVisivel();
        setNovosDados(camposVazios);
    };

    //funcao que envia o id para ser deletado
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'financas/custoBeneficio',
                    item: confirmDeleteItem,
                    fetchDados: fetchCustoBeneficios
                });
            } finally {
                if(getDeleteSuccess){
                    setExibirModal(`deleteSuccess`)
                } else {
                    setExibirModal(`deleteFail`)
                }
            }
        }
        setConfirmDeleteItem(null);
    };


    //funcao que busca os dados
    const fetchCustoBeneficios = async () => {
        try {
            const data = await fetchData('financas/custoBeneficio/get/all');
            data.custoBeneficios.forEach((cb) => {
                cb.mediaBeneficios = parseFloat((cb.areas_afetadas
                    + cb.impacto
                    + cb.urgencia
                    + cb.diferencial)
                    / 5).toFixed(2)
            })
            setCustoBeneficios(data.custoBeneficios);
        } finally {
            setLoading(false);
        }
    };

    //useEffect que so executa no primeiro render
    useEffect(() => {
        fetchCustoBeneficios();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!'
    };

    const getCustosBeneficios = (cus, ben) => {
        let custoBen = []
        if (custoBeneficios) {
            custoBeneficios.forEach((cb) => {
                if (cb.escala_custo === cus && cb.mediaBeneficios > ben - 1 && cb.mediaBeneficios <= ben) {
                    custoBen.push(cb.identificacao)
                }
            })
        }
        return (
            <ul>
                {custoBen.map((identificacao, index) => (
                    <li key={index} style={{ fontSize: '0.65rem', textAlign: 'left' }}>{identificacao}</li>
                ))}
            </ul>
        );
    }

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
                                            funcoes={{
                                                enviar: () => handleUpdateItem(),
                                                cancelar: () => linhaVisivel === custoBeneficio._id ? setLinhaVisivel() : setLinhaVisivel(custoBeneficio._id)
                                            }}
                                            setExibirModal={setExibirModal}
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
                                                    / 5).toFixed(2)}</td>
                                            <td>{
                                                parseFloat(((custoBeneficio.areas_afetadas + custoBeneficio.impacto
                                                    + custoBeneficio.urgencia + custoBeneficio.diferencial)
                                                    / 5) / custoBeneficio.escala_custo).toFixed(2)}</td>
                                            <td>{custoBeneficio.explicacao}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(custoBeneficio)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(custoBeneficio._id); setNovosDados(custoBeneficio);
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
                                funcoes={{
                                    enviar: () => enviar()
                                }}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.tabela_container} style={{ marginTop: '3rem' }}>
                <h2>Cost-Benefit Matrix</h2>
                <p>Benefit average</p>
                <div className={styles.tabela_wrapper}>
                    <table className={styles.tabela} style={{ width: '75rem' }}>
                        <thead>
                            <tr>
                                <th style={{ border: 'transparent', backgroundColor: 'transparent', width: '1rem' }}></th>
                                <th style={{ border: 'transparent', backgroundColor: 'transparent', width: '1rem' }}></th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                            </tr>
                        </thead>
                        <tbody >
                            <tr>
                                <td rowSpan={5} style={{
                                    border: 'transparent',
                                    backgroundColor: 'transparent', width: '1rem', writingMode: "sideways-lr", margin: '0rem', fontSize: '1rem'
                                }}>Cost ranking</td>
                                <th>5</th>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(5, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(5, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getCustosBeneficios(5, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getCustosBeneficios(5, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getCustosBeneficios(5, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>4</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(4, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(4, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(4, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getCustosBeneficios(4, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getCustosBeneficios(4, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>3</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(3, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(3, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(3, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getCustosBeneficios(3, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getCustosBeneficios(3, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>2</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(2, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(2, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(2, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(2, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getCustosBeneficios(2, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>1</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(1, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(1, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(1, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(1, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(1, 5) || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
};

export default Tabela;