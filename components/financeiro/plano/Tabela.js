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

  return formattedDate;
};


const Tabela = () => {
  const [planos, setPlanos] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

  const handleClick = (item) => {
    setConfirmDeleteItem(item);
  };

  const handleCloseModal = () => {
    setDeleteSuccess(false);
  };

  const fetchPlanos = async () => {
    try {
      const response = await fetch('/api/financeiro/plano/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        data.planos.forEach((item) => {
          item.data_esperada = formatDate(item.data_esperada);
          item.data_limite = formatDate(item.data_limite);
        });
        setPlanos(data.planos);
      } else {
        console.error('Error in getting plan data');
      }
    } catch (error) {
      console.error('Error in getting plan data', error);
    }
  };

  useEffect(() => {
    fetchPlanos();
  }, []);

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      fetch(`/api/financeiro/plano/delete?id=${confirmDeleteItem._id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message); // Exibir uma mensagem de sucesso
          // Atualize os dados na tabela após a exclusão
          // Você pode recarregar a página ou atualizar os dados de outra forma
          fetchPlanos();
          setDeleteSuccess(true);
        })
        .catch((error) => {
          console.error('Erro ao excluir elemento', error);
        });
    }
    setConfirmDeleteItem(null);
  };

  return (
    <div className="centered-container">
      <h2>Resource Acquisition Plan</h2>
      <div className="centered-container">
      <table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Area</th>
            <th>Resource</th>
            <th>Plan A</th>
            <th>Type</th>
            <th>Value</th>
            <th>Expected date</th>
            <th>Critical date</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {planos.map((item, index) => (
            <tr key={index}>
              <td>{item.plano}</td>
              <td>{item.area}</td>
              <td>{item.recurso}</td>
              <td>{item.plano_a}</td>
              <td>{item.tipo_a}</td>
              <td><b>R${item.valor_a}</b></td>
              <td>{item.data_esperada}</td>
              <td>{item.data_limite}</td>
              <td style={{width: '75px'}}>
                <div className="botoes-acoes">
                  <button style={{color: 'red'}} onClick={() => handleClick(item)}>X</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="centered-container" style={{marginTop: '50px'}}>
        <table style={{width: '100%'}}>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Area</th>
              <th>Resource</th>
              <th>Plan B</th>
              <th>Type</th>
              <th>Value</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {planos.map((item, index) => (
              <tr key={index}>
                <td  style={{padding: '10px'}}>{item.plano}</td>
                <td>{item.area}</td>
                <td>{item.recurso}</td>
                <td>{item.plano_b}</td>
                <td>{item.tipo_b}</td>
                <td><b>R${item.valor_b}</b></td>
                <td style={{width: '75px'}}>
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
            <p>Are you sure you want to delete the plan for "{confirmDeleteItem.recurso}"?</p>
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
    </div>
  );
};

export default Tabela;
