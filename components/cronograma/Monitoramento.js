import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

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

const formatDateGantt = (dateString) => {
  var dateParts = dateString.split("/");
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroAreaSelecionada, setFiltroAreaSelecionada] = useState('');
  const [dataTermino, setDataTermino] = useState('');
  const [dataInicio, setDataInicio] = useState('');

  const handleChange = (e) => {
    setDataTermino(e.target.value)
  }

  const handleFilterChange = ({ target: { name, value } }) => {
    if (name === 'area') {
      setFiltroArea(value);
    }
  };

  const filteredCronogramas = cronogramas.filter((item) => {
    const areaMatch = item.area.toLowerCase().includes(filtroArea.toLowerCase());
    return areaMatch;
  });

  const handleClick = (item) => {
    setConfirmDeleteItem(item);
  };

  const handleAtualizarData = async () => {
    try {
      // Filtra os itens com base na área selecionada e com plano como false
      const itensParaAtualizar = cronogramas.filter((item) => 
        item.area.toLowerCase() === filtroAreaSelecionada.toLowerCase() && !item.plano
      );

      // Verifica se há itens para atualizar
      if (!itensParaAtualizar.length) {
        console.log('Nenhum item para atualizar');
        return;
      }

      // Mapeia os IDs dos itens para criar a URL de atualização
      const idsParaAtualizar = itensParaAtualizar.map((item) => item._id);

      const response = await fetch(`/api/cronograma/update?id=${idsParaAtualizar}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Envia apenas os campos preenchidos
          ...(dataTermino && { termino: dataTermino }),
          ...(dataInicio && { inicio: dataInicio }),
        }),
      });

      if (response.status === 200) {
        console.log('Atualização bem-sucedida');
        fetchCronogramas(); // Recarregar os dados após a atualização
      } else {
        console.error('Erro ao atualizar os dados do cronograma');
      }
    } catch (error) {
      console.error('Erro ao atualizar os dados do cronograma', error);
    }
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
        console.error('Error in searching for financial releases data');
      }
    } catch (error) {
      console.error('Error in searching for financial releases data', error);
    }
  };

  useEffect(() => {
    fetchCronogramas();
  }, []);

  const handleChangeInicio = (e) => {
    setDataInicio(e.target.value);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      fetch(`/api/cronograma/delete?id=${confirmDeleteItem._id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          fetchCronogramas();
          setDeleteSuccess(true);
        })
        .catch((error) => {
          console.error('Error deleting element', error);
        });
    }
    setConfirmDeleteItem(null);
  };

  const handleCloseModal = () => {
    setDeleteSuccess(false);
  };

  const createGanttData = (cronogramas) => {
    const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];
    
    cronogramas.forEach((item) => {
      if (!item.plano) {
        if (item.inicio < item.termino){
          var dependencies = ''
        const taskID = `${item.area}_${item.item}`;
        const taskName = item.item;
        const resource = item.area;
        const startDate = formatDateGantt(item.inicio);
        const endDate = formatDateGantt(item.termino);
        if (!item.dp_area && !item.dp_item){
          dependencies = null;
        } else { 
          dependencies = `${item.dp_area}_${item.dp_item}`;
        }
        ganttData.push([taskID, taskName, resource, startDate, endDate, 10, 100, dependencies]);
        }
      }
    });

    return ganttData;
  };

  const chartData = createGanttData(cronogramas);

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
      <table style={{marginBottom: '10px'}}>
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
        {filteredCronogramas.filter((item) => !item.plano).map((item, index) => (
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

      {/* Gráfico Gantt */}
      <Chart
        width={'90%'}
        height={'400px'}
        chartType="Gantt"
        loader={<div>Loading Chart</div>}
        data={chartData}
        options={{
          gantt: {
            trackHeight: 30,
          },
        }}
      />

<label htmlFor="filtroArea">Filter by Area ATUALIAR:</label>
        <select
          name="area"
          style={{ width: '264px', height: '33px' }}
          value={filtroAreaSelecionada}
          onChange={(e) => setFiltroAreaSelecionada(e.target.value)}
          required
        >
          <option value="" disabled>Select an area</option>
          {[...new Set(cronogramas.map((item) => item.area))].map((area, index) => (
            <option key={index} value={area}>
              {area}
            </option>
          ))}
        </select>

        <label htmlFor="inicioAlterado">Início a ser alterado</label>
      <input
        type="text"
        id="inicioAlterado"
        name="inicioAlterado"
        placeholder=""
        onChange={handleChangeInicio}
        value={dataInicio}
        required
      />
      <br />
        <label htmlFor="terminoAlterado">Término a ser alterado</label>
            <input
              type="text"
              id="terminoAlterado"
              name="terminoAlterado"
              placeholder=""
              onChange={handleChange}
              value={dataTermino}
              required
            />

<button className="botao-cadastro" onClick={handleAtualizarData}>
        Atualizar Datas
      </button>
    </div>
  );
};

export default Tabela;
