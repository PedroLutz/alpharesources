import React, { useEffect, useState } from 'react';
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';
import CadastroInputs from './CadastroInputs';
import { cleanForm } from '../../../../functions/general';
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import { handleFetch, handleReq } from '../../../../functions/crud_s';

const Tabela = () => {
    const { user, token } = useAuth();
    const { isEditor } = usePerm();

    const [membros, setMembros] = useState([]);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [linhaVisivel, setLinhaVisivel] = useState({});
    const [reload, setReload] = useState(false);
    const camposVazios = {
        name: '',
        softskills: '',
        hardskills: '',
    };
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);

    const fetchMembros = async () => {
        setLoading(true);
        try {
            const data = await handleFetch({
                table: 'member',
                query: 'all',
                token
            })
            setMembros(data.data);
        } finally {
            setLoading(false)
        };
    };

    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchMembros();
        }
    }, [reload]);

    useEffect(() => {
        fetchMembros();
    }, [])

    const enviar = async () => {
        await handleReq({
            table: 'member',
            route: 'create',
            token,
            data: {...novoSubmit, user_id: user.id},
            fetchData: fetchMembros
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isMembroCadastrado = (nome) => {
        return membros.some((m) => m.nome.trim().toLowerCase() == nome.trim().toLowerCase());
    }

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'membroRepetido': 'You have already registered that member!'
    };

    const handleConfirmDelete = async () => {
            if (confirmDeleteItem) {
                await handleReq({
                    table: "member",
                    route: 'delete',
                    token,
                    data: { id: confirmDeleteItem.id },
                    fetchData: fetchMembros
                });
            }
            setExibirModal("deleteSuccess");
            setConfirmDeleteItem(null)
        };

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'member',
                route: 'update',
                token,
                data: novosDados,
                fetchData: fetchMembros
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLoading(false);
        setNovosDados(camposVazios);
        setLinhaVisivel();
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2 className='smallTitle'>Team members</h2>
            <div id="report" className={styles.membrosContainerPai}>
                <CadastroInputs
                    tipo='cadastro'
                    obj={novoSubmit}
                    objSetter={setNovoSubmit}
                    funcoes={{
                        isMembroCadastrado,
                        enviar
                    }}
                    isEditor={isEditor}
                    setExibirModal={setExibirModal}
                />
                {membros.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {linhaVisivel === item.id ? (
                            <React.Fragment>
                                <CadastroInputs
                                    obj={novosDados}
                                    objSetter={setNovosDados}
                                    tipo="update"
                                    setExibirModal={setExibirModal}
                                    funcoes={{
                                        enviar: handleUpdateItem,
                                        cancelar: () => setLinhaVisivel()
                                    }}
                                    isEditor={isEditor} />
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <div key={index} className={styles.membrosContainer}>
                                    <div className={styles.membrosConteudo}>
                                        <b>Name:</b> {item.name}
                                    </div>
                                    <div className={styles.membrosConteudo}>
                                        <b>Soft skills:</b> {item.softskills}
                                    </div>
                                    <div className={styles.membrosConteudo}>
                                        <b>Hard skills:</b> {item.hardskills}
                                    </div>
                                    <div className={styles.membrosBotoesAcoes}>
                                        <button onClick={() => setConfirmDeleteItem(item)}
                                            disabled={!isEditor}>❌</button>
                                        <button onClick={() => {
                                            setLinhaVisivel(item.id); setNovosDados(item);
                                        }} disabled={!isEditor}>⚙️</button>
                                    </div>
                                </div>
                            </React.Fragment>
                        )}

                    </React.Fragment>

                ))}
            </div>

            {confirmDeleteItem && (
                <Modal objeto={{
                    titulo: `Are you sure you want to delete "${confirmDeleteItem.name}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}
        </div>
    );
};

export default Tabela;