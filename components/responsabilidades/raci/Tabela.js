import React, { useEffect, useState } from 'react';
import members from '../../../styles/modules/members.module.css';

const Tabela = () => {
  const [itensRaci, setItensRaci] = useState([]);
  const [nomesMembros, setNomesMembros] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [formData, setFormData] = useState({
    area: "",
    item: "",
    responsabilidades: ""
  });

  const handleChange = (e) => {
    setFormData(({
      ...formData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClick = (item) => {
    setConfirmDeleteItem(item);
    console.log(confirmDeleteItem);
  };

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item); 
    const responsabilidadesArray = item.responsabilidades.split(", ");
    setFormData({
      area: item.area,
      item: item.item
    });

    inputNames.forEach((membro, index) => {
      const responsabilidade = responsabilidadesArray[index % responsabilidadesArray.length];
      setFormData(prevFormData => ({
        ...prevFormData,
        [`input${getCleanName(membro)}`]: responsabilidade
      }));
    });
  };


  const fetchItensRaci = async () => {
    try {
      const response = await fetch('/api/responsabilidades/raci/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setItensRaci(data.itensRaci);
      } else {
        console.error('Error in searching for RACI items data');
      }
    } catch (error) {
      console.error('Error in searching for RACI items data', error);
    };
  };

  const fetchNomesMembros = async () => {
    try {
      const response = await fetch('/api/responsabilidades/membros/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setNomesMembros(data.nomes);
      } else {
        console.error('Error in searching for RACI items data');
      }
    } catch (error) {
      console.error('Error in searching for RACI items data', error);
    };
  };

  const generateInputNames = () => {
    const firstNames = new Map();
    const inputNames = [];
  
    nomesMembros.forEach((membro) => {
      const nomeCompleto = membro.nome;
      const firstName = nomeCompleto.split(' ')[0];
      const lastName = nomeCompleto.split(' ')[1];
  
      if (firstNames.has(firstName)) {
        const existingHeader = firstNames.get(firstName);
        inputNames.push(`${existingHeader} ${lastName}`);
      } else {
        firstNames.set(firstName, nomeCompleto.split(' ')[0]);
        inputNames.push(nomeCompleto.split(' ')[0]);
      }
    });
    return inputNames;
  };
  const inputNames = generateInputNames();

  const generateFormData = () => {
    inputNames.forEach((membro) => {
        setFormData(({
            ...formData,
            [`input${getCleanName(membro)}`]: ''
        }));
    });
  };

  const getCleanName = (str) => {
    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };
    return removeAccents(str.split(" ").join(""));
  };

  useEffect(() => {
    fetchNomesMembros();
    fetchItensRaci();
    generateFormData();
  }, []);

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      fetch(`/api/responsabilidades/raci/delete?id=${confirmDeleteItem._id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message); 
          fetchItensRaci();
          setDeleteSuccess(true);
        })
        .catch((error) => {
          console.error('Erro ao excluir elemento', error);
        });
    };
    setConfirmDeleteItem(null);
  };

  const handleCloseModal = () => {
    setDeleteSuccess(false);
  };

  const generateTableHeaders = () => {
    const firstNames = new Map();
    const fullNames = [];
    const headers = [];
  
    nomesMembros.forEach((membro) => {
      const nomeCompleto = membro.nome;
      const firstName = nomeCompleto.split(' ')[0];
      const lastName = nomeCompleto.split(' ')[1];
      const corrigirNomeCompleto = () => {
        let index = fullNames.findIndex(x => x.includes(firstName));
        let otherLastName = fullNames[index].split(' ')[1];
        headers[index] = `${firstName} ${otherLastName}`;
      };
  
      if (firstNames.has(firstName)) {
        const existingHeader = firstNames.get(firstName);
        headers.push(`${existingHeader} ${lastName}`);
        fullNames.push(`${firstName} ${lastName}`);
        corrigirNomeCompleto();
      } else {
        firstNames.set(firstName, nomeCompleto.split(' ')[0]);
        headers.push(firstName);
        fullNames.push(`${firstName} ${lastName}`);
      };
    });
    return headers;
  };
  const tableHeaders = generateTableHeaders();

  function calculateRowSpan(itensRaci, currentArea, currentIndex) {
    let rowSpan = 1;
    for (let i = currentIndex + 1; i < itensRaci.length; i++) {
      if (itensRaci[i].area === currentArea) {
        rowSpan++;
      } else {
        break;
      }
    }
    return rowSpan;
  }

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      const responsabilidadesString = Object.keys(formData)
      .filter(key => key.startsWith('input'))
      .map(key => formData[key]).join(', ');
      const { area, item } = formData;

      try {
        const response = await fetch(`/api/responsabilidades/raci/update?id=${String(confirmUpdateItem._id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ area, item, responsabilidades: responsabilidadesString}),
        });

        if (response.status === 200) {
          console.log('RACI item updated successfully!');
          fetchItensRaci();
        } else {
          console.error('Error in updating RACI item');
        }
      } catch (error) {
        console.error('Error in updating RACI item', error);
      }
    }
    setConfirmUpdateItem(null);
    generateFormData();
  };

  return (
    <div className="centered-container">
      <h2>RACI Matrix</h2>
      <div id="report">
        <table className={members.tabelaRaci}>
          <thead>
            <tr>
              <th>Area</th>
              <th>Item</th>
              {tableHeaders.map((membro, index) => (
                <th key={index}>{membro}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {itensRaci.map((item, index) => (
              <tr key={index}>
                {index === 0 || itensRaci[index - 1].area !== item.area ? (
                  <td rowSpan={calculateRowSpan(itensRaci, item.area, index)} 
                  onClick={() => handleUpdateClick(item)} className={members.areaTc}>{item.area}</td>
                ) : null}
                <td onClick={() => handleUpdateClick(item)} className={members.itemTc}>{item.item}</td>
                {item.responsabilidades.split(', ').map((responsabilidade, index) => (
                  <td key={index} onClick={() => handleUpdateClick(item)}>{responsabilidade}</td>
                ))}
                <td onClick={() => handleClick(item)}>❌</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {confirmDeleteItem && (
        <div className="overlay">
          <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.area} - {confirmDeleteItem.item}"?</p>
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
            <form onSubmit={handleUpdateItem}>
              {/*Inputs*/}
              <div>

                {/*outros inputs*/}
                <div className="centered-container">
                  <div style={{marginBottom: '20px'}}><b>{formData.area} -<br/>{formData.item}</b></div>
                  {inputNames.map((membro, index) => (
                    <div className="mini-input" key={index}>
                    <label htmlFor={"input" + getCleanName(membro)}>{membro}</label>
                      <select
                          type="text"
                          id={"input" + getCleanName(membro)}
                          name={"input" + getCleanName(membro)}
                          placeholder=""
                          onChange={handleChange}
                          value={formData["input" + getCleanName(membro)]}
                          required
                      >
                          <option value="" disabled>Select responsibility</option>
                          <option value="R">Responsible</option>
                          <option value="A">Accountable</option>
                          <option value="C">Consulted</option>
                          <option value="I">Informed</option>
                      </select>
                  </div>

                  ))}
                </div>
              </div>
              <div>
                <button className="botao-cadastro" style={{width: "55%"}} type="submit">Register RACI item</button>
                <button className="botao-cadastro" onClick={() => setConfirmUpdateItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tabela;