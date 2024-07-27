import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../Loading';
import Modal from '../Modal';
import { fetchData, handleDelete, handleUpdate } from '../../functions/crud';
import { jsDateToEuDate, euDateToJsDate, euDateToIsoDate, cleanForm } from '../../functions/general';
import styles from '../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteInfo, setDeleteInfo] = useState({ success: false, item: null });
  const [filtroAreaSelecionada, setFiltroAreaSelecionada] = useState('');
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [exibirModal, setExibirModal] = useState(null);
  const [mostrarTabela, setMostrarTabela] = useState(false);
  const [chartHeight, setChartHeight] = useState('100px');
  const [chartDataLoaded, setChartDataLoaded] = useState(false);
  const [confirmCompleteTask, setConfirmCompleteTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
  const camposVazios = {
    item: '',
    area: '',
    inicio: '',
    termino: '',
    dp_item: '',
    dp_area: '',
    situacao: '',
  }
  const [novosDados, setNovosDados] = useState(camposVazios);

  const labelsSituacao = {
    iniciar: 'Starting',
    emandamento: 'Executing',
    concluida: 'Completed'
  }

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

      if(itemParaAtualizar.situacao === 'concluida'){
        setExibirModal('tarefaConcluida')
        return;
      }

      const today = new Date();
      const formattedDate = today.
        toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .split(',')[0];

      var updatedItem;

      if (situacao === 'em andamento') {
        updatedItem = {
          inicio: formattedDate,
          situacao: situacao
        };
      } else if (situacao === 'check') {
        updatedItem = {
          termino: formattedDate,
        };
      } else if (situacao === 'concluida') {
        updatedItem = {
          termino: formattedDate,
          situacao: situacao
        };
      } 

      await handleUpdate({
        route: 'cronograma',
        dados: updatedItem,
        item: itemParaAtualizar
      });

      fetchCronogramas();
      setReload(true);
    } catch (error) {
      console.error('Erro ao atualizar a situação do cronograma', error);
    }
  };

  useEffect(() => {
    setReload(false);
    fetchCronogramas();
  }, [reload]);

  const handleClick = (item) => {
    setDeleteInfo({ success: false, item });
  };

  const checkDados = (tipo) => {
    setExibirModal(tipo); return;
  };

  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'dadosUsados': 'This item is already registered in the timelines!',
    'depFaltando': 'Please select the dependencies correctly!',
    'dpNotUsed': "The item you've selected as predecessor is not registered!",
    'dpNotOkay': "The predecessor must finish before the successor starts!",
    'datasErradas': 'The finishing date must be after the starting date!',
    'semtarefa': 'Select a task to update.',
    'tarefaConcluida': "You can't update a task you've already completed!",
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

  const chartData = createGanttData(cronogramas);

  const teste = async () => {
    const monthYear = "2024-07";
    const response = await fetch(`/api/relatorio/get/geral`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({monthYear: monthYear}),
    });
    const data = await response.json();
    console.log(data)
}

  useEffect(() => {
    if (chartData.length > 1) {
      const linhaHeight = 30;
      const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
      setChartHeight(novaAltura);
      setChartDataLoaded(true);
    }
  }, [chartData]);

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

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      const updatedItem = {
        ...confirmUpdateItem,
        ...novosDados,
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
    setLinhaVisivel();
    window.location.reload();
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Timeline monitoring</h2>
      <button onClick={teste}>Avançada</button>
      
      {confirmCompleteTask && (
        <Modal objeto={{
          titulo: `Are you sure you want to complete "${filtroAreaSelecionada} - ${confirmCompleteTask}"?`,
          botao1: {
            funcao: () => {handleAtualizarTarefa('concluida'); setConfirmCompleteTask(null)}, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setConfirmCompleteTask(null), texto: 'Cancel'
          }
        }} />
      )}

      {deleteInfo.item && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${deleteInfo.item.area} - ${deleteInfo.item.item}"?`,
          botao1: {
            funcao: handleConfirmDelete, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setDeleteInfo({ success: false, item: null }), texto: 'Cancel'
          }
        }} />
      )}

      {deleteInfo.success && (
        <Modal objeto={{
          titulo: 'Deletion successful!',
          botao1: {
            funcao: () => setDeleteInfo({ success: false, item: null }), texto: 'Close'
          }
        }} />
      )}

      {exibirModal != null && (
        <Modal objeto={{
          titulo: modalLabels[exibirModal],
          botao1: {
            funcao: () => setExibirModal(null), texto: 'Okay'
          },
        }} />
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
              trackHeight: 30,
              sortTasks: false,
            },
          }}
        />
      )}

      <div className='mini-input'>
        <label htmlFor="filtroArea">Quick update</label>
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
          {cronogramas
            .filter((item) => item.area.toLowerCase() === filtroAreaSelecionada.toLowerCase() && !item.plano)
            .map((item, index) => (
              <option key={index} value={item.item}>
                {item.item}
              </option>
            ))}
        </select>
      </div>

      <div>
        <button onClick={() => handleAtualizarTarefa('em andamento')} style={{ width: '100px' }}>
          Start task
        </button>
        <button onClick={() => handleAtualizarTarefa('check')}>
          Check execution
        </button>
        <button onClick={() => {
          itemSelecionado ? setConfirmCompleteTask(itemSelecionado) : setExibirModal('semtarefa')
          }} style={{ width: '150px' }}>
          Complete task
        </button>
      </div>

      <button className="botao-cadastro"
        style={{ marginTop: '20px' }}
        onClick={() => {
          setMostrarTabela(!mostrarTabela);
        }}>
        {mostrarTabela ? 'Hide table' : 'Show table'}
      </button>

      {mostrarTabela && (
        <div className="centered-container">
          <div className={styles.tabelaCronograma_container}>
            <div className={styles.tabelaCronograma_wrapper}>
              <table className={styles.tabelaCronograma}>
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
                  {cronogramas.filter((item) => !item.plano).map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item.area}
                      </td>
                      <td>
                        {item.item}
                      </td>
                      {linhaVisivel === item._id ? (
                        <CadastroInputs
                        tipo="update"
                        gantt={true}
                        obj={novosDados}
                        objSetter={setNovosDados}
                        funcao={{
                          funcao1: () => handleUpdateItem(),
                          funcao2: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                        }} 
                        checkDados={checkDados}/>
                      ) : (
                        <React.Fragment>
                          <td>{item.inicio === '01/01/1970' ? '-' : item.inicio}</td>
                          <td>{item.termino === '01/01/1970' ? '-' : item.termino}</td>
                          <td>{item.dp_area || '-'}</td>
                          <td>{item.dp_item || '-'}</td>
                          <td>{labelsSituacao[item.situacao.toLowerCase().replace(/\s/g, '')] || '-'}</td>
                          <td>
                            <div className="botoes-acoes">
                              <button onClick={() => handleClick(item)}>❌</button>
                            </div>
                            <button onClick={() => {
                              linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                            }}>⚙️</button>
                          </td>
                        </React.Fragment>

                      )}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Tabela;