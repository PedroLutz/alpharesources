import React, { useEffect, useState } from 'react';
import members from '../../../styles/modules/members.module.css';
import Loading from '../../Loading';
import Modal from '../../Modal';
import CadastroInputs from './CadastroInputs';
import { fetchData, handleDelete, handleUpdate, handleSubmit } from '../../../functions/crud';
import { cleanForm } from '../../../functions/general';

const Tabela = () => {
  const [membros, setMembros] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
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

  const handleChange = (e) => {
    setNovosDados({
      ...novosDados,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    setNovosDados({
      nome: item.nome,
      softskills: item.softskills,
      hardskills: item.hardskills,
    });
  };

  const fetchMembros = async () => {
    try {
      const data = await fetchData('responsabilidades/membros/get/all');
      setMembros(data.membros);
    } finally {
      setLoading(false)
    };
  };

  useEffect(() => {
    setReload(false);
    fetchMembros();
  }, [reload]);

  const enviar = async (e) => {
    e.preventDefault();
    handleSubmit({
      route: 'responsabilidades/membros',
      dados: novoSubmit
    });
    cleanForm(novoSubmit, setNovoSubmit);
    setReload(true);
  };

  const checkDados = (tipo) => {
    setExibirModal(tipo); return;
  };

  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = handleDelete({
          route: 'responsabilidades/membros',
          item: confirmDeleteItem,
          fetchDados: fetchMembros
        });
      } finally {
        setDeleteSuccess(getDeleteSuccess);
      }
    }
    setConfirmDeleteItem(null);
  };

  function insertBreak(text) {
    if (text.length > 50) {
      let firstPart = text.substring(0, 50);
      let lastSpaceIndex = firstPart.lastIndexOf(' ');
      if (lastSpaceIndex !== -1) {
        firstPart = firstPart.substring(0, lastSpaceIndex);
      }
      return (
        <>
          {firstPart}
          <br />
          {text.substring(firstPart.length)}
        </>
      );
    }
    return text;
  }

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      setLoading(true);
      const updatedItem = { _id: confirmUpdateItem._id, ...novosDados };
      const updatedMembros = membros.map(item =>
        item._id === updatedItem._id ? { ...updatedItem } : item
      );

      setMembros(updatedMembros);
      linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
      setConfirmUpdateItem(null);
      try {
        await handleUpdate({
          route: 'responsabilidades/membros',
          dados: updatedItem,
          item: confirmUpdateItem
        });
      } catch (error) {
        setMembros(membros);
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Update failed:", error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Team members</h2>
      <div id="report" className={members.containerPai}>
        <CadastroInputs
          tipo='cadastro'
          obj={novoSubmit}
          objSetter={setNovoSubmit}
          funcao={enviar}
          checkDados={checkDados}
        />
        {membros.map((item, index) => (
          <React.Fragment key={item._id}>
            {linhaVisivel === item._id ? (
              <React.Fragment>
                <CadastroInputs
                obj={novosDados}
                objSetter={setNovosDados}
                tipo="update"
                checkDados={checkDados}
                funcao={{
                  funcao1: () => handleUpdateItem(),
                  funcao2: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                }}/>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div key={index} className={members.container}>
                  <div><b>Name:</b> {item.nome}</div>
                  <div>
                    <b>Softskills:</b> {item.softskills}
                  </div>
                  <div>
                    <b>Hardskills:</b> {item.hardskills}
                  </div>
                  <div className={members.botoesAcoes}>
                    <button onClick={() => setConfirmDeleteItem(item)}>❌</button>
                    <button onClick={() => {
                      linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                    }}>⚙️</button>
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

      {deleteSuccess && (
        <Modal objeto={{
          titulo: deleteSuccess ? 'Deletion successful!' : 'Deletion failed.',
          botao1: {
            funcao: () => setDeleteSuccess(false), texto: 'Close'
          },
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