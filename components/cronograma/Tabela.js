import React, { useEffect, useState } from 'react';
import Loading from '../Loading';
import { Chart } from 'react-google-charts';
import { fetchData, handleDelete, handleUpdate } from '../../functions/crud';
import { cleanForm, jsDateToEuDate, euDateToIsoDate, euDateToJsDate } from '../../functions/general';

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [elementos, setElementos] = useState([]);
  const [itensPorAreaDp, setItensPorAreaDp] = useState([]);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [filtroArea, setFiltroArea] = useState('');
  const [chartHeight, setChartHeight] = useState('100px'); 
  const [chartDataLoaded, setChartDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [novosDados, setNovosDados] = useState({
    inicio: '',
    termino: '',
    dp_item: '',
    dp_area: '',
    situacao: '',
  });

  const handleChange = (e) => {
    setNovosDados({
      ...novosDados,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault;
    if (confirmUpdateItem) {
      const updatedItem = { 
        ...confirmUpdateItem, 
        ...novosDados, 
        inicio: novosDados.inicio, 
        termino: novosDados.termino 
      };

      const updatedCronogramas = cronogramas.map(item =>
        item._id === updatedItem._id ? { 
          ...updatedItem, 
          inicio: jsDateToEuDate(updatedItem.inicio), 
          termino: jsDateToEuDate(updatedItem.termino) 
        } : item
      );
      setCronogramas(updatedCronogramas);
      setConfirmUpdateItem(null);
      try {
        await handleUpdate({
          route: 'cronograma',
          dados: updatedItem,
          item: confirmUpdateItem
        });
      } catch (error) {
        setCronogramas(cronogramas); 
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Update failed:", error);
      }
    }
    setConfirmUpdateItem(null);
    cleanForm(novosDados, setNovosDados);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'area') {
      setFiltroArea(value);
    }
  };

  const handleAreaChangeDp = (e) => {
    const areaSelecionadaDp = e.target.value;
    updateDpItem(areaSelecionadaDp);
  };  

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    setNovosDados({
      inicio: euDateToIsoDate(item.inicio),
      termino: euDateToIsoDate(item.termino),
      dp_item: item.dp_item || undefined,
      dp_area: item.dp_area || undefined,
      situacao: item.situacao,
    });
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteItem(null);
    if (confirmDeleteItem) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = handleDelete({
          route: 'cronograma', 
          item: confirmDeleteItem, 
          fetchDados: fetchCronogramas});
      } finally {
        setDeleteSuccess(getDeleteSuccess);
      }
    }
  };

  const updateDpItem = (areaSelecionadaDp) => {
    const itensDaAreaDp = elementos.filter(item => item.area === areaSelecionadaDp).map(item => item.item);
    setItensPorAreaDp(itensDaAreaDp);

    const novoItemSelecionado = itensDaAreaDp.includes(novosDados.dp_item) ? novosDados.dp_item : '';
  
    setNovosDados(prevState => ({
      ...prevState,
      dp_area: areaSelecionadaDp,
      dp_item: novoItemSelecionado,
    }));
  };

  const filteredCronogramas = cronogramas.filter((item) => {
    const areaMatch = item.area.toLowerCase().includes(filtroArea.toLowerCase());
    return areaMatch;
  });

  const createGanttData = (cronogramas) => {
    const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];

    cronogramas.forEach((item) => {
      if (item.plano) {
        var dependencies = ''
        const taskID = `${item.area}_${item.item}`;
        const taskName = item.item;
        const resource = item.area;
        const startDate = euDateToJsDate(item.inicio);
        const endDate = euDateToJsDate(item.termino);
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

  const fetchCronogramas = async () => {
    try {
      const data = await fetchData('cronograma/get/planos');
      data.cronogramaPlanos.forEach((item) => {
        item.inicio = jsDateToEuDate(item.inicio);
        item.termino = jsDateToEuDate(item.termino);
      });
      data.cronogramaPlanos.sort((a, b) => {
        if (a.area < b.area) return -1;
        if (a.area > b.area) return 1;
        return 0;
      });
      setCronogramas(data.cronogramaPlanos);
    } finally {
      setLoading(false);
    }
  };

  const fetchElementos = async () => {
    const data = await fetchData('wbs/get');
    setElementos(data.elementos);
  };

  useEffect(() => {
    fetchElementos();
    fetchCronogramas();
    if (novosDados.dp_area) {
      updateDpItem(novosDados.dp_area);
    }
  }, [novosDados.dp_area]);

  useEffect(() => {
    if (chartData.length > 1) {
      const linhaHeight = 30; 
      const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
      setChartHeight(novaAltura);
      setChartDataLoaded(true); 
    }
  }, [chartData]);

  return (
    <div className="centered-container">
      {loading && <Loading />}
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
            <button className="botao-cadastro" onClick={() => setDeleteSuccess(false)}>Close</button>
          </div>
        </div>
      )}

      {chartDataLoaded && (
        <Chart
        height={chartHeight}
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
      )}
      
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
                  <button onClick={() => setConfirmDeleteItem(item)}>❌</button>
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
