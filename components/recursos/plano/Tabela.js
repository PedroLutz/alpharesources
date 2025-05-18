import React, { useEffect, useState, useContext} from "react"
import CadastroInputs from "./CadastroInputs";
import styles from '../../../styles/modules/planoAquisicao.module.css'
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm, jsDateToEuDate, euDateToIsoDate } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext"; 

const PlanoAquisicao = () => {
    const camposVazios = {
        area: "",
        ehEssencial: '',
        recurso: "",
        metodo_a: "",
        plano_a: "",
        detalhes_a: "",
        valor_a: "",
        data_esperada: "",
        data_limite: "",
        metodo_b: "",
        plano_b: "",
        detalhes_b: "",
        valor_b: "",
        plano_real: "",
        data_real: "",
        valor_real: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [planos, setPlanos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const {isAdmin} = useContext(AuthContext)


    //funcao que envia os dados do novoSubmit para cadastro no banco
    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'recursos/planoAquisicao',
            dados: novoSubmit
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
        await fetchPlanos();
        setReload(true);
    };

    
    //funcao que recebe o item, insere em confirmUpdateItem e insere os dados corretamente em novosDados
    const handleUpdateClick = (item) => {
        setConfirmUpdateItem(item)
        setNovosDados({
            ...item,
            data_esperada: euDateToIsoDate(item.data_esperada),
            data_limite: euDateToIsoDate(item.data_limite),
            data_real: euDateToIsoDate(item.data_real)
        });
    };


    //dado que busca e trata os dados dos planos
    const fetchPlanos = async () => {
        try {
            const data = await fetchData('recursos/planoAquisicao/get/all');
            data.planos.forEach((item) => {
                const dataEsperada = new Date(item.data_esperada);
                const dataLimite = new Date(item.data_limite);
                const dataReal = new Date(item.data_real);
                if(item.data_real){
                    item.data_diferenca = [`Expected: ${(dataReal - dataEsperada)/ (1000 * 60 * 60 * 24)} days`,
                                            `Critical: ${(dataReal - dataLimite)/ (1000 * 60 * 60 * 24)} days`]
                } else {
                    item.data_diferenca = `-`
                }
                if(item.plano_real){
                    item.valor_diferenca = [`Plan A: R$${Number(item.valor_real - item.valor_a).toFixed(2)}`,
                                            `Plan B: R$${Number(item.valor_real - item.valor_b).toFixed(2)}`]
                } else {
                    item.valor_diferenca = `-`
                }
                item.data_esperada = jsDateToEuDate(item.data_esperada);
                item.data_limite = jsDateToEuDate(item.data_limite);
                item.data_real = jsDateToEuDate(item.data_real);
                
              });
            setPlanos(data.planos);
        } finally {
            setLoading(false);
        }
    };


    //funcao que trata e envia os dados para atualizacao no banco
    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };
            console.log(updatedItem);
            delete updatedItem.data_diferenca;
            delete updatedItem.valor_diferenca;
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'recursos/planoAquisicao/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setConfirmUpdateItem(confirmUpdateItem)
                console.error("Update failed:", error);
            }
            await fetchPlanos();
            setLoading(false)
        }
    };


    //funcao que envia os dados do item para delecao do banco
    const handleConfirmDelete = () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = handleDelete({
                    route: 'recursos/planoAquisicao',
                    item: confirmDeleteItem,
                    fetchDados: fetchPlanos
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


    //useEffect que so roda quando reload eh atualizado
    useEffect(() => {
        if(reload == true){
            setReload(false);
            fetchPlanos();
        }
    }, [reload]);


    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchPlanos();
    }, []);


    //textos dos modais 
    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };


    //funcao que calcula o rowSpan dos tds de area de acordo com a quantidade de itens q a area possui
    const calculateRowSpan = (itens, currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itens.length; i++) {
          if (itens[i].recurso === currentArea) {
            rowSpan++;
          } else {
            break;
          }
        }
        return rowSpan;
      };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2>Resource Acquisition Planning</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete the acquisition plan for "${confirmDeleteItem.recurso}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabela_financas_container}>
                <div className={styles.tabela_financas_wrapper}>
                    <table className={styles.tabela_financas}>
                        <thead>
                            <tr>
                                <th rowSpan="2">Resource</th>
                                <th colSpan="4">Procurement Strategies (Plan A)</th>
                                <th colSpan="2">Milestones</th>
                                <th colSpan="4">Procurement Strategies (Plan B)</th>
                                <th colSpan="5">Results</th>
                                <th rowSpan="2">Actions</th>
                            </tr>
                            <tr>
                                <th>Method</th>
                                <th>Where to Acquire (Supplier)</th>
                                <th>Details</th>
                                <th>Value</th>
                                <th>Expected date</th>
                                <th>Critical date</th>
                                <th>How to Acquire (Method)</th>
                                <th>Where to Acquire (Supplier)</th>
                                <th>Details</th>
                                <th>Value</th>
                                <th>Actual strategy</th>
                                <th>Date</th>
                                <th>Value</th>
                                <th style={{minWidth: '8rem'}}>Date difference</th>
                                <th style={{minWidth: '8rem'}}>Value difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {planos.map((plano, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === plano._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => {linhaVisivel === plano._id ? setLinhaVisivel() : setLinhaVisivel(plano._id); setIsUpdating(false)}
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            {!isUpdating || isUpdating !== plano.recurso ? (
                                                <React.Fragment>
                                                    {index === 0 || planos[index - 1].recurso !== plano.recurso ? (
                                                        <td rowSpan={calculateRowSpan(planos, plano.recurso, index)}
                                                        >{plano.recurso}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{plano.recurso}</td>
                                            )}
                                            <td>{plano.metodo_a}</td>
                                            <td>{plano.plano_a}</td>
                                            <td>{plano.detalhes_a}</td>
                                            <td>R${Number(plano.valor_a).toFixed(2)}</td>
                                            <td>{plano.data_esperada}</td>
                                            <td>{plano.data_limite}</td>
                                            <td>{plano.metodo_b}</td>
                                            <td>{plano.plano_b}</td>
                                            <td>{plano.detalhes_b}</td>
                                            <td>R${Number(plano.valor_b).toFixed(2)}</td>
                                            <td>{plano.plano_real || '-'}</td>
                                            <td>{plano.data_real != 'NaN/NaN/NaN' && plano.data_real != null ? plano.data_real : '-'}</td>
                                            <td>{plano.valor_real != null ? `R$${Number(plano.valor_real).toFixed(2)}` : '-'}</td>
                                            <td>
                                                {plano.data_diferenca[0]}<br/>
                                                {plano.data_diferenca[1]}
                                            </td>
                                            <td>{plano.valor_diferenca[0]}<br/>
                                                {plano.valor_diferenca[1]}
                                            </td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(plano)}
                                                    disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(plano._id); handleUpdateClick(plano); setIsUpdating(plano.recurso)
                                                }
                                                }
                                                disabled={!isAdmin}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcao={enviar}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>

            </div>
        </div>

    )
}

export default PlanoAquisicao;