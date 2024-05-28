import React, { useEffect, useState } from 'react';
import members from '../../../styles/modules/members.module.css';
import Loading from '../../Loading';
import Modal from '../../Modal';
import { fetchData, handleDelete, handleUpdate } from '../../../functions/crud';

const Tabela = () => {
  const [membros, setMembros] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [novosDados, setNovosDados] = useState({
    nome: '',
    softskills: '',
    hardskills: '',
  });

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
      const data = await fetchData('responsabilidades/membros/get');
      setMembros(data.membros);
    } finally {
      setLoading(false)
    };
  };

  useEffect(() => {
    fetchMembros();
  }, []);

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
      const updatedItem = { _id: confirmUpdateItem._id, ...novosDados };
      const updatedMembros = membros.map(item =>
        item._id === updatedItem._id ? { ...updatedItem } : item
      );

      setMembros(updatedMembros);
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
    }
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Team members</h2>
      <div id="report" className={members.containerPai}>
        {membros.map((item, index) => (
          <div key={index} className={members.container}>
            <div><b>Name:</b> {item.nome}</div>
            <div>
              <b>Softskills:</b> {insertBreak(item.softskills)}
            </div>
            <div>
              <b>Hardskills:</b> {insertBreak(item.hardskills)}
            </div>
            <div className={members.botoesAcoes}>
              <button onClick={() => setConfirmDeleteItem(item)}>❌</button>
              <button onClick={() => handleUpdateClick(item)}>⚙️</button>
            </div>
          </div>
        ))}
      </div>

      {confirmDeleteItem && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${confirmDeleteItem.nome}"?`,
          botao1: {
            funcao: handleConfirmDelete, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
          }
        }}/>
      )}

      {deleteSuccess && (
        <Modal objeto={{
          titulo: deleteSuccess ? 'Deletion successful!' : 'Deletion failed.',
          botao1: {
            funcao: () => setDeleteSuccess(false), texto: 'Close'
          },
        }}/>
      )}

      {confirmUpdateItem && (
        <div className="overlay">
          <div className="modal">
            {/*outros inputs*/}
            <div className="centered-container">

              {/*input nome*/}
              <div className="mini-input">
                <label htmlFor="nome">Name</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  placeholder=""
                  onChange={handleChange}
                  value={novosDados.nome}
                  required
                />
              </div>

              {/*input softskills*/}
              <div className="mini-input">
                <label htmlFor="softskills">Softskills</label>
                <textarea
                  type="text"
                  id="softkills"
                  name="softskills"
                  onChange={handleChange}
                  value={novosDados.softskills}
                  required
                />
              </div>

              {/*input hardskills*/}
              <div className="mini-input">
                <label htmlFor="hardskills">Hardskills</label>
                <textarea
                  type="text"
                  name="hardskills"
                  id="hardskills"
                  onChange={handleChange}
                  value={novosDados.hardskills}
                  required
                />
              </div>

              {/*fim outros inputs*/}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="botao-cadastro" onClick={handleUpdateItem}>Update</button>
              <button className="botao-cadastro" onClick={() => setConfirmUpdateItem(null)}>Cancel</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Tabela;