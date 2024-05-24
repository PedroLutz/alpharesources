import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../Loading';
import Modal from '../Modal';
import { fetchData, handleDelete, handleUpdate } from '../../functions/crud';
import { jsDateToEuDate, euDateToJsDate, isoDateToJsDate } from '../../functions/general';

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteInfo, setDeleteInfo] = useState({ success: false, item: null });
  const [filtroAreaTabela, setFiltroAreaTabela] = useState('');
  const [filtroAreaSelecionada, setFiltroAreaSelecionada] = useState('');
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [exibirModal, setExibirModal] = useState(null);
  const [mostrarTabela, setMostrarTabela] = useState(false);
  const [chartHeight, setChartHeight] = useState('100px');
  const [chartDataLoaded, setChartDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [datas, setDatas] = useState({
    dataInicio: '',
    dataTermino: '',
  });

  const labelsSituacao = {
    iniciar: 'Starting',
    emandamento: 'Executing',
    concluida: 'Completed'
  }

  const handleChange = (e) => {
    setDatas({ ...datas, dataTermino: e.target.value });
  }

  const validarDatas = () => {
    if (datas.dataInicio && datas.dataTermino) {
      const dataInicioObj = new Date(datas.dataInicio);
      const dataTerminoObj = new Date(datas.dataTermino);

      if (dataInicioObj > dataTerminoObj) {
        setExibirModal('datainvalida');
        return false;
      }
    }

    setExibirModal(null);
    return true;
  };

  const handleAtualizarTarefa = async (situacao) => {
    if (itemSelecionado === '') {
      setExibirModal('semtarefa');
      return;
    }

    try {
      const itemParaAtualizar = cronogramas.find(
        (item) =>
          item.area.toLowerCase() === filtroAreaSelecionada.toLowerCase() &&
          item.item === itemSelecionado &&
          !item.plano
      );

      if (!itemParaAtualizar) {
        setExibirModal('semtarefa');
        return;
      }

      const updatedItem = {
        situacao: situacao
      };

      await handleUpdate({
        route: 'cronograma',
        dados: updatedItem,
        item: itemParaAtualizar
      });

      fetchCronogramas();
    } catch (error) {
      console.error('Erro ao atualizar a situação do cronograma', error);
    }
  };

  const handleFilterChange = ({ target: { name, value } }) => {
    if (name === 'area') {
      setFiltroAreaTabela(value);
    }
  };

  const filteredCronogramas = cronogramas.filter((item) => {
    const areaMatch = item.area.toLowerCase().includes(filtroAreaTabela.toLowerCase());
    return areaMatch;
  });

  const handleClick = (item) => {
    setDeleteInfo({ success: false, item });
  };

  const handleAtualizarData = async () => {
    if (!validarDatas()) {
      return;
    }

    if (!datas.dataInicio && !datas.dataTermino) {
      setExibirModal("semdatas");
      return;
    }

    const itemParaAtualizar = cronogramas.find(
      (item) =>
        item.area.toLowerCase() === filtroAreaSelecionada.toLowerCase() &&
        item.item === itemSelecionado &&
        !item.plano
    );

    if (!itemParaAtualizar) {
      setExibirModal('semtarefa');
      return;
    }

    if (itemParaAtualizar.situacao === 'iniciar' || itemParaAtualizar.situacao === 'concluida') {
      setExibirModal('situacaoinvalida');
      return;
    }

    const updatedItem = {
      ...itemParaAtualizar,
      ...(datas.dataTermino && { termino: isoDateToJsDate(datas.dataTermino) }),
      ...(datas.dataInicio && { inicio: isoDateToJsDate(datas.dataInicio) }),
    };

    const updatedCronogramas = cronogramas.map(item =>
      item._id === updatedItem._id ? { 
        ...updatedItem, 
        inicio: jsDateToEuDate(updatedItem.inicio), 
        termino: jsDateToEuDate(updatedItem.termino) 
      } : item
    );
    setCronogramas(updatedCronogramas);
    try {
      await handleUpdate({
        route: 'cronograma',
        dados: updatedItem,
        item: itemParaAtualizar
      });
    } catch (error) {
      setCronogramas(cronogramas); 
      console.error("Update failed:", error);
    }
  };

  const fetchCronogramas = async () => {
    try {
      const data = await fetchData('cronograma/get/gantts');
      data.cronogramaGantts.forEach((item) => {
        item.inicio = jsDateToEuDate(item.inicio);
        item.termino = jsDateToEuDate(item.termino);
      });
      data.cronogramaGantts.sort((a, b) => {
        if (a.area < b.area) return -1;
        if (a.area > b.area) return 1;
        return 0;
      });
      setCronogramas(data.cronogramaGantts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCronogramas();
  }, []);

  const handleConfirmDelete = () => {
    if (deleteInfo.item) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = handleDelete({
          route: 'cronograma',
          item: deleteInfo.item,
          fetchDados: fetchCronogramas
        });
      } finally {
        setDeleteInfo({ success: getDeleteSuccess, item: null });
      }
    }
  };

  const createGanttData = (cronogramas) => {
    const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];

    cronogramas.forEach((item) => {
      if (!item.plano) {
        if (euDateToJsDate(item.inicio) < euDateToJsDate(item.termino)) {
          var dependencies = ''
          const taskID = `${item.area}_${item.item}`;
          const taskName = item.item;
          const resource = item.area;
          const startDate = euDateToJsDate(item.inicio);
          const endDate = euDateToJsDate(item.termino);
          if (!item.dp_area && !item.dp_item) {
            dependencies = null;
          } else {
            dependencies = `${item.dp_area}_${item.dp_item}`;
          }
          ganttData.push([taskID, taskName, resource, startDate, endDate, 0, 100, dependencies]);
        }
      }
    });

    return ganttData;
  };

  const handleSetDataHoje = (inputName) => {
    const today = new Date();
    const formattedDate = today.toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).split(',')[0];

    setDatas((prevDatas) => ({
      ...prevDatas,
      [inputName]: formattedDate,
    }));
  };

  const chartData = createGanttData(cronogramas);

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
      <h2>Timeline monitoring</h2>

      {deleteInfo.item && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${deleteInfo.item.descricao}"?`,
          botao1: {
            funcao: handleConfirmDelete, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setDeleteInfo({ success: false, item: null }), texto: 'Cancel'
          }
        }}/>
      )}

      {deleteInfo.success && (
        <Modal objeto={{
          titulo: 'Deletion successful!',
          botao1: {
            funcao: () => setDeleteInfo({ success: false, item: null }), texto: 'Close'
          }
        }}/>
      )}

      {exibirModal === 'datainvalida' && (
        <Modal objeto={{
          titulo: 'The last execution must be equal to or greater than the start date.',
          botao1: {
            funcao: () => setExibirModal(null), texto: 'OK'
          }
        }}/>
      )}

      {exibirModal === 'semtarefa' && (
        <Modal objeto={{
          titulo: 'Select a task to update.',
          botao1: {
            funcao: () => setExibirModal(null), texto: 'OK'
          }
        }}/>
      )}

      {exibirModal === 'situacaoinvalida' && (
        <Modal objeto={{
          titulo: 'You can only update the dates of tasks that are in execution.',
          botao1: {
            funcao: () => setExibirModal(null), texto: 'OK'
          }
        }}/>
      )}

      {exibirModal === "semdatas" && (
        <Modal objeto={{
          titulo: 'Insert valid dates!',
          botao1: {
            funcao: () => setExibirModal(null), texto: 'OK'
          }
        }}/>
      )}

      {/* Gráfico Gantt */}
      {chartDataLoaded && (
        <Chart
          width={'90%'}
          height={chartHeight}
          chartType="Gantt"
          loader={<div>Loading Chart</div>}
          data={chartData}
          options={{
            gantt: {
              trackHeight: 30, // Altura de cada linha do gráfico
              sortTasks: false,
            },
          }}
        />
      )}

      <div className='mini-input'>
        <label htmlFor="filtroArea">Select task for updating</label>
        <select
          name="area"
          value={filtroAreaSelecionada}
          onChange={(e) => {
            setFiltroAreaSelecionada(e.target.value);
            setItemSelecionado('');
          }}
          required
        >
          <option value="" disabled>Select an area</option>
          {[...new Set(cronogramas.map((item) => item.area))].map((area, index) => (
            <option key={index} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className='mini-input'>
        <select
          name="item"
          value={itemSelecionado}
          onChange={(e) => {
            setItemSelecionado(e.target.value);
            setExibirModal(null);
          }}
          required
        >
          <option value="" disabled>Select an item</option>
          {filteredCronogramas
            .filter((item) => item.area.toLowerCase() === filtroAreaSelecionada.toLowerCase() && !item.plano)
            .map((item, index) => (
              <option key={index} value={item.item}>
                {item.item}
              </option>
            ))}
        </select>
      </div>

      <div className="input-data botoes-cronograma">
        <button onClick={() => handleAtualizarTarefa('em andamento')} style={{ width: '100px' }}>
          Start task
        </button>
        <button onClick={() => handleAtualizarTarefa('concluida')} style={{ width: '150px' }}>
          Complete task
        </button>
      </div>

      <div className='mini-input'>
        <label htmlFor="inicioAlterado">Start date</label>
        <div className='mesma-linha input-data'>
          <input
            type="date"
            id="inicioAlterado"
            name="inicioAlterado"
            style={{ maxWidth: '250px' }}
            placeholder=""
            onChange={(e) => setDatas({ ...datas, dataInicio: e.target.value })}
            value={datas.dataInicio}
            required
          />
          <button
            style={{ marginTop: '9px', marginLeft: '-10px' }}
            onClick={() => handleSetDataHoje('dataInicio')}>Set today</button>
        </div>

        <label htmlFor="terminoAlterado">Last execution</label>
        <div className='mesma-linha input-data'>
          <input
            type="date"
            id="terminoAlterado"
            name="terminoAlterado"
            style={{ maxWidth: '250px' }}
            placeholder=""
            onChange={handleChange}
            value={datas.dataTermino}
            required
          />
          <button
            style={{ marginTop: '9px', marginLeft: '-10px' }}
            onClick={() => handleSetDataHoje('dataTermino')}>Set today</button>
        </div>
      </div>


      <button className="botao-cadastro"
        onClick={handleAtualizarData}>
        Update dates
      </button>

      <button className="botao-cadastro"
        style={{ marginTop: '20px' }}
        onClick={() => {
          setMostrarTabela(!mostrarTabela);
          setFiltroAreaTabela('');
        }}>
        {mostrarTabela ? 'Hide table' : 'Show table'}
      </button>

      {mostrarTabela && (
        <div className="centered-container">
          <div style={{ marginTop: '30px' }} className='mini-input'>
            <label htmlFor="filtroAreaTabela">Filter Table:</label>
            <select
              name="area"
              onChange={handleFilterChange}
              value={filtroAreaTabela}
              required
            >
              <option value="" disabled>Select an area</option>
              {[...new Set(cronogramas.map(item => item.area))].map((area, index) => (
                <option key={index} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <table style={{ marginBottom: '20px' }}>
            <thead>
              <tr>
                <th>Area</th>
                <th>Task</th>
                <th>Start</th>
                <th>End</th>
                <th style={{ width: '11%' }}>Dependency: Area</th>
                <th style={{ width: '11%' }}>Dependency: Item</th>
                <th>Situation</th>
                <th style={{ width: '5%' }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredCronogramas.filter((item) => !item.plano).map((item, index) => (
                <tr key={index}>
                  <td>
                    {item.area}
                  </td>
                  <td>
                    {item.item}
                  </td>
                  <td>{item.inicio === '31/12/1969' ? '-' : item.inicio}</td>
                  <td>{item.termino === '31/12/1969' ? '-' : item.termino}</td>
                  <td>{item.dp_area || '-'}</td>
                  <td>{item.dp_item || '-'}</td>
                  <td>{labelsSituacao[item.situacao.toLowerCase().replace(/\s/g, '')] || '-'}</td>
                  <td>
                    <div className="botoes-acoes">
                      <button onClick={() => handleClick(item)}>❌</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tabela;