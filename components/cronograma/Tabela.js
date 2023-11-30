import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [filtroArea, setFiltroArea] = useState('');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'area') {
      setFiltroArea(value);
    }
  };

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
          console.log(item.inicio)
          item.inicio = formatDate(item.inicio);
          item.termino = formatDate(item.termino);
        });
        setCronogramas(data.cronogramas);
      } else {
        console.error('Error in searching for timeline data');
      }
    } catch (error) {
      console.error('Error in searching for financial releases data', error);
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
      if (item.plano) {
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
    });

    return ganttData;
  };

  const chartData = createGanttData(cronogramas);

  return (
    <div className="centered-container">
      <h2>Estimated timeline</h2>
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
      height={'1300px'}
        width={'90%'}
        chartType="Gantt"
        loader={<div>Loading Chart</div>}
        data={chartData}
        options={{
          gantt: {
            trackHeight: 30,
            sortTasks: false,
          },
        }}
      />

      

<div className="mini-input">
        <label htmlFor="filtroArea">Filter table:</label>
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
            <th>Area</th>
            <th>Task</th>
            <th>Start</th>
            <th>End</th>
            <th style={{width:'11%'}}>Dependency: Area</th>
            <th style={{width:'11%'}}>Dependency: Item</th>
            <th style={{width:'5%'}}>Delete</th>
          </tr>
        </thead>
        <tbody>
        {filteredCronogramas.filter((item) => item.plano).map((item, index) => (
            <tr key={index}>
              <td>
                {item.area}
              </td>
              <td>
                {item.item}
              </td>
              <td>{item.inicio}</td>
              <td>{item.termino}</td>
              <td>{item.dp_area || '-'}</td>
              <td>{item.dp_item || '-'}</td>
              <td>
                <div className="botoes-acoes">
                  <button style={{color: 'red'}} onClick={() => handleClick(item)}>X</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default Tabela;
