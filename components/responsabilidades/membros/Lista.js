import React, { useEffect, useState } from 'react';
import members from '../../../styles/modules/members.module.css';
import Loading from '../../Loading';

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

  const handleClick = (item) => {
    setConfirmDeleteItem(item);
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
      const response = await fetch('/api/responsabilidades/membros/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setMembros(data.membros);
      } else {
        console.error('Error in searching for members data');
      }
    } catch (error) {
      console.error('Error in searching for members data', error);
    } finally {
      setLoading(false)};
  };

  useEffect(() => {
    fetchMembros();
  }, []);

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      fetch(`/api/responsabilidades/membros/delete?id=${confirmDeleteItem._id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message); 
          fetchMembros();
          setDeleteSuccess(true);
        })
        .catch((error) => {
          console.error('Erro ao excluir membro', error);
        });
    }
    setConfirmDeleteItem(null);
  };

  const handleCloseModal = () => {
    setDeleteSuccess(false);
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
      const { nome, softskills, hardskills } = novosDados;

      try {
        const response = await fetch(`/api/responsabilidades/membros/update?id=${String(confirmUpdateItem._id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nome, softskills, hardskills }),
        });

        if (response.status === 200) {
          console.log('Member updated successfully!');
          fetchMembros();
        } else {
          console.error('Error in updating member');
        }
      } catch (error) {
        console.error('Error in updating member', error);
      }
    }
    setConfirmUpdateItem(null);
    setNovosDados({
        nome: '',
        softskills: '',
        hardskills: '',
    })
  };


return (
  <div className="centered-container">
    {loading && <Loading/>}
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
            <button onClick={() => handleClick(item)}>❌</button>
            <button onClick={() => handleUpdateClick(item)}>⚙️</button>
            </div>
        </div>
    ))}
    </div>

      {confirmDeleteItem && (
        <div className="overlay">
            <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.nome}"?</p>
                <div style={{display: 'flex', gap: '10px'}}>
                    <button className="botao-cadastro" onClick={handleConfirmDelete}>Confirm</button>
                    <button className="botao-cadastro" onClick={() => setConfirmDeleteItem(null)}>Cancel</button>
                </div>
            </div>
        </div>
      )}

      {deleteSuccess && (
        <div className="overlay">
          <div className="modal">
            <p>{deleteSuccess ? 'Deletion successful!' : 'Deletion failed.'}</p>
            <button className="botao-cadastro" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
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
            <div style={{display: 'flex', gap: '10px'}}>
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
