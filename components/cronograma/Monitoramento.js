import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../Loading';
import Modal from '../Modal';
import { fetchData, handleDelete, handleUpdate } from '../../functions/crud';
import { jsDateToEuDate, euDateToJsDate, euDateToIsoDate, cleanForm } from '../../functions/general';
import styles from '../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';
import chroma from 'chroma-js';

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteInfo, setDeleteInfo] = useState({ success: false, item: null });
  const [filtroAreaSelecionada, setFiltroAreaSelecionada] = useState('');
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [report, setReport] = useState([])
  const [exibirModal, setExibirModal] = useState(null);
  const [mostrarTabela, setMostrarTabela] = useState(false);
  const [chartHeight, setChartHeight] = useState('100px');
  const [chartDataLoaded, setChartDataLoaded] = useState(false);
  const [confirmCompleteTask, setConfirmCompleteTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
  const [cores, setCores] = useState({});
  const camposVazios = {
    plano: '',
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
    concluida: 'Completed',
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

      if (itemParaAtualizar.situacao === 'concluida') {
        setExibirModal('tarefaConcluida')
        return;
      }

      if (situacao !== 'em andamento' && itemParaAtualizar.situacao === 'iniciar') {
        setExibirModal('tarefaNaoIniciada')
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

  const fetchCores = async () => {
    const data = await fetchData('wbs/get/cores');
    var cores = {};
    data.areasECores.forEach((area) => {
      cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
    })
    setCores(cores);
  }

  useEffect(() => {
    setReload(false);
    fetchCronogramas();
    fetchCores();
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
    'tarefaNaoIniciada': "You can't update a task you haven't started yet!"
  };

  const generateReport = async () => {
    const responsePlano = await fetchData('cronograma/get/startAndEndPlano');
    const responseGantt = await fetchData('cronograma/get/startAndEndGantt');
    const dadosPlano = responsePlano.resultadosPlano;
    const dadosGantt = responseGantt.resultadosGantt;
    var duplas = [];
    dadosPlano.forEach((dado) => {
      const gantt = dadosGantt.find(o => o.area === dado.area);
      duplas.push([dado, gantt])
    })

    let arrayAnalise = [];
    duplas.forEach((dupla) => {
      const area = dupla[0].area;
      const planoUltimo = dupla[0].ultimo;
      const ganttPrimeiro = dupla[1].primeiro;
      const ganttUltimo = dupla[1].ultimo;
      const hoje = new Date().toISOString();

      //executing
      if (ganttUltimo.situacao === "em andamento") {
        var obj = { area: area, state: 'Executing' }
        if (planoUltimo.termino >= hoje) {
          obj = { ...obj, status: 'On Schedule' }
        } else {
          obj = { ...obj, status: 'Overdue' }
        }
        arrayAnalise.push(obj);
      }

      //hold
      if ((planoUltimo.item !== ganttUltimo.item && ganttUltimo.situacao === 'concluida')) {
        var obj = { area: area, state: 'Hold' }
        if (planoUltimo.termino >= hoje) {
          obj = { ...obj, status: 'On Schedule' }
        } else {
          obj = { ...obj, status: 'Overdue' }
        }
        arrayAnalise.push(obj);
      }

      //complete
      if (planoUltimo.item === ganttUltimo.item && ganttUltimo.situacao === 'concluida') {
        var obj = { area: area, state: 'Complete' }
        if (planoUltimo.termino >= ganttUltimo.termino) {
          obj = { ...obj, status: 'On Schedule' }
        } else {
          obj = { ...obj, status: 'Overdue' }
        }
        arrayAnalise.push(obj);
      }

      //to begin
      if (ganttPrimeiro.inicio === null && ganttUltimo.termino === null) {
        var obj = { area: area, state: 'To Begin' }
        if (planoUltimo.termino >= hoje) {
          obj = { ...obj, status: 'On Schedule' }
        } else {
          obj = { ...obj, status: 'Overdue' }
        }
        arrayAnalise.push(obj);
      }
    })
    setReport(arrayAnalise)
  }

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
      generateReport();
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchCronogramas();
    fetchCores();
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

  const generatePaleta = () => {

    var paleta = [];
    for (const [key, value] of Object.entries(cores)) {
      paleta.push({
        "color": value ? chroma(value).darken().saturate(3).hex() : '#000000',
        "dark": value ? chroma(value).hex() : '#000000',
        "light": value ? chroma(value).darken().hex() : '#000000'
      })
    }
    return paleta;
  }
  const paleta = generatePaleta();

  const createGanttData = (cronogramas) => {
    const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];
  
    cronogramas.forEach((item) => {
      if (!item.plano) {
        if (euDateToJsDate(item.inicio) < euDateToJsDate(item.termino)) {
          var dependencies = '';
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
      plano: false,
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

  const calculateRowSpan = (itens, currentArea, currentIndex) => {
    let rowSpan = 1;
    for (let i = currentIndex + 1; i < itens.length; i++) {
      if (itens[i].area === currentArea) {
        rowSpan++;
      } else {
        break;
      }
    }
    return rowSpan;
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Timeline monitoring</h2>

      {confirmCompleteTask && (
        <Modal objeto={{
          titulo: `Are you sure you want to complete "${filtroAreaSelecionada} - ${confirmCompleteTask}"?`,
          botao1: {
            funcao: () => { handleAtualizarTarefa('concluida'); setConfirmCompleteTask(null) }, texto: 'Confirm'
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
              palette: paleta,
              shadowEnabled: false,
              criticalPathEnabled: false,
            },
            
          }}
        />
      )}



      <div className={styles.quickUpdate}>
        <h4>Quick update</h4>
        <div>
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
          <button onClick={() => handleAtualizarTarefa('em andamento')}>
            Start task
          </button>
          <button onClick={() => handleAtualizarTarefa('check')}>
            Check execution
          </button>
          <button onClick={() => {
            itemSelecionado ? setConfirmCompleteTask(itemSelecionado) : setExibirModal('semtarefa')
          }}>
            Complete task
          </button>
        </div>
      </div>


      <button className="botao-padrao"
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
                    <th>Dependency: Area</th>
                    <th>Dependency: Item</th>
                    <th>Situation</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {cronogramas.filter((item) => !item.plano).map((item, index) => (
                    <tr key={index} style={{backgroundColor: cores[item.area]}}>
                      {index === 0 || cronogramas[index - 1].area !== item.area ? (
                        <td rowSpan={calculateRowSpan(cronogramas, item.area, index)}
                        >{item.area}</td>
                      ) : null}
                      <td>{item.item}</td>
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
                          checkDados={checkDados} />
                      ) : (
                        <React.Fragment>
                          <td>{item.inicio === '01/01/1970' ? '-' : item.inicio}</td>
                          <td>{item.termino === '01/01/1970' ? '-' : item.termino}</td>
                          <td>{item.dp_area || '-'}</td>
                          <td>{item.dp_item || '-'}</td>
                          <td>{labelsSituacao[item.situacao.toLowerCase().replace(/\s/g, '')] || '-'}</td>
                          <td>
                            <div className='botoes_acoes'>
                              <button onClick={() => handleClick(item)}>❌</button>
                              <button onClick={() => {
                                linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                              }}>⚙️</button>
                            </div>
                          </td>
                        </React.Fragment>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.areaAnalysis}>
            <table>
              <thead>
                <tr>
                  <th>Area</th>
                  <th>State</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.map((area, index) => (
                  <tr key={index}>
                    <td>{area.area}</td>
                    <td
                      style={{
                        backgroundColor:
                          area.state === 'To Begin' ? '#ffc6c6' : (
                            area.state === 'Complete' ? '#d8ffc6' : (
                              area.state === 'Hold' ? '#e1e1e1' : '#cdf2ff'
                            )
                          ),
                      }}>{area.state}</td>
                    <td
                      style={{
                        backgroundColor:
                          area.status === 'Overdue' ? '#ffc6c6' : '#d8ffc6'
                      }}>{area.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tabela;