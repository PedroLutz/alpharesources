import React, { useEffect, useState, useContext } from 'react';
import styles from '../../../styles/modules/responsabilidades.module.css'
import Loading from '../../Loading';
import Modal from '../../Modal';
import CadastroInputs from './CadastroInputs';
import { fetchData, handleDelete, handleUpdate, handleSubmit } from '../../../functions/crud';
import { cleanForm } from '../../../functions/general';
import { AuthContext } from '../../../contexts/AuthContext';

const Tabela = () => {
  const [membros, setMembros] = useState([]);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [exibirModal, setExibirModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
  const camposVazios = {
    nome: '',
    softskills: '',
    hardskills: '',
  };
  const [novoSubmit, setNovoSubmit] = useState(camposVazios);
  const [novosDados, setNovosDados] = useState(camposVazios);
  const { isAdmin } = useContext(AuthContext)

  const fetchMembros = async () => {
    setLoading(true);
    try {
      const data = await fetchData('responsabilidades/membros/get/all');
      setMembros(data.membros);
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
    await handleSubmit({
      route: 'responsabilidades/membros',
      dados: novoSubmit,
      fetchDados: fetchMembros
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
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = await handleDelete({
          route: 'responsabilidades/membros',
          item: confirmDeleteItem,
          fetchDados: fetchMembros
        });
      } finally {
        if (getDeleteSuccess) {
          setExibirModal(`deleteSuccess`)
        } else {
          setExibirModal(`deleteFail`)
        }
      }
    }
    setConfirmDeleteItem(null);
  };

  const handleUpdateItem = async () => {
    setLoading(true);
    try {
      await handleUpdate({
        route: 'responsabilidades/membros/update?id',
        dados: novosDados,
        fetchDados: fetchMembros
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
      <h2>Team members</h2>
      <div id="report" className={styles.containerPai}>
        <CadastroInputs
          tipo='cadastro'
          obj={novoSubmit}
          objSetter={setNovoSubmit}
          funcoes={{
            isMembroCadastrado,
            enviar: enviar
          }}
          setExibirModal={setExibirModal}
        />
        {membros.map((item, index) => (
          <React.Fragment key={item._id}>
            {linhaVisivel === item._id ? (
              <React.Fragment>
                <CadastroInputs
                  obj={novosDados}
                  objSetter={setNovosDados}
                  tipo="update"
                  setExibirModal={setExibirModal}
                  funcoes={{
                    enviar: handleUpdateItem,
                    cancelar: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                  }} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div key={index} className={styles.container}>
                  <div><b>Name:</b> {item.nome}</div>
                  <div>
                    <b>Soft skills:</b> {item.softskills}
                  </div>
                  <div>
                    <b>Hard skills:</b> {item.hardskills}
                  </div>
                  <div className={styles.botoesAcoes}>
                    <button onClick={() => setConfirmDeleteItem(item)}
                      disabled={!isAdmin}>❌</button>
                    <button onClick={() => {
                      linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); setNovosDados(item)
                    }} disabled={!isAdmin}>⚙️</button>
                  </div>
                </div>
              </React.Fragment>
            )}

          </React.Fragment>

        ))}
      </div>

      {confirmDeleteItem && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${confirmDeleteItem.nome}"?`,
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