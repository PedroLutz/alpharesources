import React, { useEffect, useState } from 'react';

const formatDate = (dateString) => {
  // Converte a data da string para um objeto de data
  const date = new Date(dateString);

  // Adiciona um dia à data
  date.setDate(date.getDate() + 1);

  // Formata a data
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  console.log(formattedDate)
  return formattedDate;
};

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroItem, setFiltroItem] = useState('');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'area') {
      setFiltroArea(value);
    };
  };

  const filteredCronogramas = cronogramas.filter((item) => {
    const areaMatch = item.area.toLowerCase().includes(filtroArea.toLowerCase());
    return areaMatch;
  });

  const handleClick = (item) => {
    setConfirmDeleteItem(item);
  };

  const fetchCronogramas = async () => {
    try {
      const response = await fetch('/api/cronograma/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        data.cronogramas.forEach((item) => {
          item.inicio = formatDate(item.inicio);
          item.termino = formatDate(item.termino);
        });
        setCronogramas(data.cronogramas);
      } else {
        console.error('Error in searching for financal releases data');
      }
    } catch (error) {
      console.error('Error in searching for financal releases data', error);
    }
  };


  useEffect(() => {
    fetchCronogramas();
  }, []);

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      fetch(`/api/cronograma/delete?id=${confirmDeleteItem._id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message); // Exibir uma mensagem de sucesso
          // Atualize os dados na tabela após a exclusão
          // Você pode recarregar a página ou atualizar os dados de outra forma
          fetchCronogramas();
          setDeleteSuccess(true);
        })
        .catch((error) => {
          console.error('Erro ao excluir elemento', error);
        });
    }
    setConfirmDeleteItem(null);
  };

  const handleCloseModal = () => {
    setDeleteSuccess(false);
  };

  return (
    <div className="centered-container">
      <h2>Linha do tempo</h2>
      <div className="filtro-container">
        <label htmlFor="filtroArea">Filter by Area:</label>
        <select
                  name="area"
                  onChange={handleFilterChange}
                  style={{width:'264px', height: '33px'}}
                  value={filtroArea}
                  required
                >
                  <option value="" disabled>Select an area</option>
                  {[...new Set(cronogramas.map(item => item.area))].map((area, index) => (
                    <option key={index} value={area}>{area}</option>
              ))};
            </select>
        
      </div>
      <table>
        <thead>
          <tr>
            <th>Plan</th>
            <th>Area</th>
            <th>Item</th>
            <th>Start</th>
            <th>End</th>
            <th style={{width:'10%'}}>Dependency: Area</th>
            <th style={{width:'10%'}}>Dependency: Item</th>
            <th>Situation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCronogramas.map((item, index) => (
            <tr key={index}>
              <td>{item.plano}</td>
              <td>
                {item.area}
              </td>
              <td>
                {item.item}
              </td>
              <td>{item.inicio}</td>
              <td>{item.termino}</td>
              <td>{item.dp_area}</td>
              <td>{item.dp_item}</td>
              <td>{item.situacao}</td>
              <td>
                <div className="botoes-acoes">
                  <button style={{color: 'red'}} onClick={() => handleClick(item)}>X</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmDeleteItem && (
        <div className="overlay">
            <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.descricao}"?</p>
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
    </div>
  );
};

export default Tabela;
