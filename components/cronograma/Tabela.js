import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../../Loading';

const formatInputDate = (dateString) => {
  var dateParts = dateString.split("-");
  return new Date(+dateParts[0], dateParts[1] - 1, dateParts[2] - 1)
}

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [elementos, setElementos] = useState([]);
  const [itensPorAreaDp, setItensPorAreaDp] = useState([]);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroArea, setFiltroArea] = useState('');
  const [novosDados, setNovosDados] = useState({
    inicio: '',
    termino: '',
    dp_item: '',
    dp_area: '',
    situacao: '',
  });

  const fetchElementos = async () => {
    try {
      const response = await fetch('/api/wbs/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setElementos(data.elementos);

      } else {
        console.error('Error in searching for financal releases data');
      }
    } catch (error) {
      console.error('Error in searching for financal releases data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNovosDados({
      ...novosDados,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault;

    if (confirmUpdateItem) {
      const inicioConsertado = formatInputDate(novosDados.inicio);
      const terminoConsertado = formatInputDate(novosDados.termino);
      const { dp_item, dp_area, situacao } = novosDados;

      try {
        const response = await fetch(`/api/cronograma/update?id=${String(confirmUpdateItem._id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inicio: inicioConsertado, termino: terminoConsertado, dp_item, dp_area, situacao }),
        });

        if (response.status === 200) {
          console.log('Timeline component updated successfully!');
          fetchCronogramas();
        } else {
          console.error('Error in updating timeline component');
        }
      } catch (error) {
        console.error('Error in updating timeline component', error);
      }
    }
    setConfirmUpdateItem(null);
    setNovosDados({
      inicio: '',
      termino: '',
      dp_item: '',
      dp_area: '',
      situacao: '',
    })
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'area') {
      setFiltroArea(value);
    }
  };

  const updateDpItem = (areaSelecionadaDp) => {
    const itensDaAreaDp = elementos.filter(item => item.area === areaSelecionadaDp).map(item => item.item);
    setItensPorAreaDp(itensDaAreaDp);
  
    // Verifica se o item selecionado ainda pertence à nova lista de itens
    const novoItemSelecionado = itensDaAreaDp.includes(novosDados.dp_item) ? novosDados.dp_item : '';
  
    // Atualiza o estado formData para refletir a nova área selecionada
    setNovosDados(prevState => ({
      ...prevState,
      dp_area: areaSelecionadaDp,
      dp_item: novoItemSelecionado,
    }));
  };
  
  const handleAreaChangeDp = (e) => {
    const areaSelecionadaDp = e.target.value;
    updateDpItem(areaSelecionadaDp);
  };  

  const handleUpdateClick = (item) => {
    const fixDate = (data) => {
      const parts = data.split('/');
      const itemDate = new Date(parts[2], parts[1] - 1, parts[0]); 
      return itemDate.toISOString().split('T')[0];
    };

    setConfirmUpdateItem(item);
    setNovosDados({
      inicio: fixDate(item.inicio),
      termino: fixDate(item.termino),
      dp_item: item.dp_item,
      dp_area: item.dp_area,
      situacao: item.situacao,
    });
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
          item.inicio = formatDate(item.inicio);
          item.termino = formatDate(item.termino);
        });
        data.cronogramas.sort((a, b) => {
          if (a.area < b.area) return -1;
          if (a.area > b.area) return 1;
          return 0;
        });

        setCronogramas(data.cronogramas);
        console.log(cronogramas);;
      } else {
        console.error('Error in searching for timeline data');
      }
    } catch (error) {
      console.error('Error in searching for financial releases data', error);
    }
  };

  useEffect(() => {
    fetchElementos();
    fetchCronogramas();
    if (novosDados.dp_area) {
      updateDpItem(novosDados.dp_area);
    }
  }, [novosDados.dp_area]);

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
      {loading && <Loading/>}
      <h2>Estimated timeline</h2>
      {confirmDeleteItem && (
        <div className="overlay">
          <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.item}"?</p>
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
            <th style={{width:'5%'}}>Actions</th>
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
                  <button onClick={() => handleClick(item)}>❌</button>
                  <button onClick={() => handleUpdateClick(item)}>⚙️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmUpdateItem && (
        <div className="overlay"> 
          <div className="modal">
          <div className="centered-container mini-input">
            <label htmlFor="inicio" style={{width: '260px'}}>Start</label>
            <input
              type="date"
              id="inicio"
              name="inicio"
              placeholder=""
              onChange={handleChange}
              value={novosDados.inicio}
              required
            />

            <label htmlFor="termino" style={{width: '260px'}}>End</label>
            <input
              type="date"
              id="termino"
              name="termino"
              placeholder=""
              onChange={handleChange}
              value={novosDados.termino}
              required
            />

            <label htmlFor="dp_area"style={{width: '260px'}} >Dependencies</label>
            <select
                  name="dp_area"
                  onChange={handleAreaChangeDp}
                  value={novosDados.dp_area}
                >
                  <option value="" disabled>Select an area</option>
                  {[...new Set(elementos.map(item => item.area))].map((area, index) => (
                    <option key={index} value={area}>{area}</option>
              ))};
            </select>

            <select
              name="dp_item"
              onChange={handleChange}
              value={novosDados.dp_item}
            >
              <option value="" disabled>Select an item</option>
              {itensPorAreaDp.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
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
