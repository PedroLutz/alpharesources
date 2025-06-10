import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../Loading';
import Modal from '../Modal';
import { fetchData, handleDelete, handleUpdate } from '../../functions/crud';
import { jsDateToEuDate, euDateToJsDate, euDateToIsoDate, cleanForm } from '../../functions/general';
import styles from '../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';
import chroma from 'chroma-js';
import { AuthContext } from "../../contexts/AuthContext";

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [filtroAreaSelecionada, setFiltroAreaSelecionada] = useState('');
  const [filtroAreaResetarData, setFiltroAreaResetarData] = useState('');
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [itemSelecionadoResetar, setItemSelecionadoResetar] = useState('');
  const [confirmResetData, setConfirmResetData] = useState(false);
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
  const {isAdmin} = useContext(AuthContext);
  const [paleta, setPaleta] = useState([]);

  const labelsSituacao = {
    iniciar: 'Starting',
    emandamento: 'Executing',
    concluida: 'Completed',
  }

  //funcao responsavel pela atualizacao rapida da tarefa, verificando se a atualizacao
  //faz sentido com a situacao da tarefa e formatando os dados a serem atualizados de acordo com a situacao dela
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

      var updatedItem = {_id: itemParaAtualizar._id};

      if (situacao === 'em andamento') {
        updatedItem = {
          ...updatedItem,
          inicio: formattedDate,
          situacao: situacao
        };
      } else if (situacao === 'check') {
        updatedItem = {
          ...updatedItem,
          termino: formattedDate,
        };
      } else if (situacao === 'concluida') {
        updatedItem = {
          ...updatedItem,
          termino: formattedDate,
          situacao: situacao
        };
      }

      await handleUpdate({
        route: 'cronograma',
        dados: updatedItem,
        fetchDados: fetchCronogramas
      });
    } catch (error) {
      console.error('Erro ao atualizar a situação do cronograma', error);
    }
  };


  //funcao para resetar (igualar a null )as datas
  const handleResetarData = async () => {
    if (itemSelecionadoResetar === '') {
      setExibirModal('semtarefa');
      return;
    }

    try {
      const itemParaAtualizar = cronogramas.find(
        (item) =>
          item.area.toLowerCase() === filtroAreaResetarData.toLowerCase() &&
          item.item === itemSelecionadoResetar &&
          !item.plano
      ); 

      if (!itemParaAtualizar) {
        setExibirModal('semtarefa');
        return;
      }

      var updatedItem = {
        _id: itemParaAtualizar._id,
        inicio: null,
        termino: null,
        situacao: 'iniciar'
      }

      await handleUpdate({
        route: 'cronograma',
        dados: updatedItem,
        fetchDados: fetchCronogramas
      });
      setConfirmResetData(false)
    } catch (error) {
      console.error('Erro ao atualizar a situação do cronograma', error);
    }
  }

  
  //useEffect que executa apenas quando reload é atualizado
  useEffect(() => {
    if(reload == true){
      setReload(false);
      fetchCronogramas();
    }
  }, [reload]);

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


  //funcao que gera a tabela de estados das areas
  const generateReport = async () => {
    const responsePlano = await fetchData('cronograma/get/startAndEndPlano');
    const responseGantt = await fetchData('cronograma/get/startAndEndGantt');
    const responseSituacoesGantt = await fetchData('cronograma/get/ganttsESituacoes');
    const dadosPlano = responsePlano.resultadosPlano;
    const dadosGantt = responseGantt.resultadosGantt;
    const dadosSituacoesGantt = responseSituacoesGantt.ganttPorArea;

    var objSituacao = {}
    dadosSituacoesGantt.forEach((dado) => { 
      if(dado.itens.filter((item) => item.situacao === "em andamento").length === 0 &&
         dado.itens.filter((item) => item.situacao === "iniciar").length === 0){
         objSituacao = {...objSituacao, [dado.area] : "Complete"}
      } else if (dado.itens.filter((item) => item.situacao === "em andamento").length === 0 &&
                 dado.itens.filter((item) => item.situacao === "iniciar").length > 0 && 
                 dado.itens.filter((item) => item.situacao === 'concluida').length > 0){
        objSituacao = {...objSituacao, [dado.area] : "Hold"}
      } else if (dado.itens.filter((item) => item.situacao === "em andamento").length > 0){
        objSituacao = {...objSituacao, [dado.area] : "Executing"}
      } else if (dado.itens.filter((item) => item.situacao === "em andamento").length === 0 &&
                dado.itens.filter((item) => item.situacao === "concluida").length === 0){
        objSituacao = {...objSituacao, [dado.area] : "To Begin"}
      }
    })

    var duplas = [];
    dadosPlano.forEach((dado) => {
      const gantt = dadosGantt.find(o => o.area === dado.area);
      duplas.push([dado, gantt])
    })

    let arrayAnalise = [];
    duplas.forEach((dupla) => {
      const area = dupla[0].area;
      const planoUltimo = dupla[0].ultimo;
      const ganttUltimo = dupla[1].ultimo;
      const hoje = new Date().toISOString();
      var obj = { area: area, state: objSituacao[area] }

      //executing
      if (objSituacao[area] === "Executing") {
        if (planoUltimo.termino >= hoje) {
          obj = { ...obj, status: 'On Schedule' }
        } else {
          obj = { ...obj, status: 'Overdue' }
        }
        arrayAnalise.push(obj);
      }

      //hold
      if (objSituacao[area] === "Hold") {
        if (planoUltimo.termino >= hoje) {
          obj = { ...obj, status: 'On Schedule' }
        } else {
          obj = { ...obj, status: 'Overdue' }
        }
        arrayAnalise.push(obj);
      }

      //complete
      if (objSituacao[area] === "Complete") {
        if (planoUltimo.termino >= ganttUltimo.termino) {
          obj = { ...obj, status: 'On Schedule' }
        } else {
          obj = { ...obj, status: 'Overdue' }
        }
        arrayAnalise.push(obj);
      }

      //to begin
      if (objSituacao[area] === "To Begin") {
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

  //funcao que busca os cronogramas e as cores, trata as datas dos cronogramas,
  //trata as cores e cria a paleta para o grafico
  const fetchCronogramas = async () => {
    try {
      const data = await fetchData('cronograma/get/gantts');
      const dataCores = await fetchData('wbs/get/cores');

      data.cronogramaGantts.forEach((item) => {
        item.inicio = jsDateToEuDate(item.inicio);
        item.termino = jsDateToEuDate(item.termino);
      });
      data.cronogramaGantts.sort((a, b) => {
        if (a.area < b.area) return -1;
        if (a.area > b.area) return 1;
        return 0;
      });
      
      //adicionar cores na tabela
      var cores = {};
      dataCores.areasECores.forEach((area) => {
            cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
      })

      //adicionar cores no grafico (apenas as cores de areas que tem alguma coisa sendo executada)
      var paleta = [];
      for (const [key, value] of Object.entries(cores)) {
        if(data.cronogramaGantts.some((item) => item.area === key && item.termino !== null)){
          paleta.push({
            "color": value ? chroma(value).darken().saturate(3).hex() : '#000000',
            "dark": value ? chroma(value).hex() : '#000000',
            "light": value ? chroma(value).darken().hex() : '#000000'
          })
        }
      }

      setCores(cores);
      setPaleta(paleta);
      setCronogramas(data.cronogramaGantts);
    } finally {
      generateReport();
      setLoading(false);
    }

  };

  //useEffect que so executa na primeira render
  useEffect(() => {
    fetchCronogramas();
  }, []);


  //funcao que cria a array usada na geracao do grafico gantt
  const createGanttData = () => {
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

  //funcao que executa na primeira render e depois so quando cronogramas ou etis atualiza
  //armazenando os dados diretamente nas constantes
  const chartData = useMemo(() => {
      if (cronogramas.length === 0) return [];
      return createGanttData();
    }, [cronogramas]);

    
  //useEffect que so roda quando chartData recebe um valor, e define a altura do grafico gantt
  useEffect(() => {
    if (chartData.length > 1) {
      const linhaHeight = 30;
      const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
      setChartHeight(novaAltura);
      setChartDataLoaded(true);
    }
  }, [chartData]);


  //funcao que recebe o item a ser atualizado e o insere em novosDados
  const handleUpdateClick = (item) => {
    setNovosDados({
      _id: item._id,
      plano: false,
      inicio: euDateToIsoDate(item.inicio),
      termino: euDateToIsoDate(item.termino),
      dp_item: item.dp_item || undefined,
      dp_area: item.dp_area || undefined,
      situacao: item.situacao,
    });
  };


  //funcao que atualiza o item
  const handleUpdateItem = async () => {
    if (novosDados) {
      try {
        await handleUpdate({
          route: 'cronograma',
          dados: novosDados,
          fetchDados: fetchCronogramas
        });
      } catch (error) {
        console.error("Update failed:", error);
      }
    }
    cleanForm(novosDados, setNovosDados, camposVazios);
    setLinhaVisivel();
    window.location.reload();
  };


  //funcao que calcula o rowSpan do td da area de acordo com os itens
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

      {confirmResetData && (
        <Modal objeto={{
          alerta: true,
          titulo: `Are you sure you want to reset the dates?`,
          botao1: {
            funcao: handleResetarData, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setConfirmResetData(false), texto: 'Cancel'
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
          <button onClick={() => handleAtualizarTarefa('em andamento')} disabled={!isAdmin}>
            Start task
          </button>
          <button onClick={() => handleAtualizarTarefa('check')} disabled={!isAdmin}>
            Check execution
          </button>
          <button onClick={() => {
            itemSelecionado ? setConfirmCompleteTask(itemSelecionado) : setExibirModal('semtarefa')
          }} disabled={!isAdmin}>
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
                    <tr key={index} style={{ backgroundColor: cores[item.area] }}>
                      {index === 0 || cronogramas[index - 1].area !== item.area ? (
                        <td rowSpan={calculateRowSpan(cronogramas, item.area, index)}
                        >{item.area}</td>
                      ) : null}
                      <td>{item.item}</td>
                      {linhaVisivel === item._id ? (
                        <CadastroInputs
                          tipo="updatemonitoring"
                          gantt={true}
                          obj={novosDados}
                          objSetter={setNovosDados}
                          funcao={{
                            funcao1: () => handleUpdateItem(),
                            funcao2: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                          }}
                          setExibirModal={setExibirModal} />
                      ) : (
                        <React.Fragment>
                          <td>{item.inicio === '01/01/1970' ? '-' : item.inicio}</td>
                          <td>{item.termino === '01/01/1970' ? '-' : item.termino}</td>
                          <td>{item.dp_area || '-'}</td>
                          <td>{item.dp_item || '-'}</td>
                          <td>{labelsSituacao[item.situacao.toLowerCase().replace(/\s/g, '')] || '-'}</td>
                          <td>
                            <div className='botoes_acoes'>
                              <button onClick={() => {
                                linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                              }} disabled={!isAdmin}>⚙️</button>
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

          <div className={styles.quickUpdate} style={{ marginTop: '2rem' }}>
            <h4>Reset date</h4>
            <div>
              <select
                name="area"
                value={filtroAreaResetarData}
                onChange={(e) => {
                  setFiltroAreaResetarData(e.target.value);
                  setItemSelecionadoResetar('');
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
                value={itemSelecionadoResetar}
                onChange={(e) => {
                  setItemSelecionadoResetar(e.target.value);
                  setExibirModal(null);
                }}
                required
              >
                <option value="" disabled>Select an item</option>
                {cronogramas
                  .filter((item) => item.area.toLowerCase() === filtroAreaResetarData.toLowerCase() && !item.plano)
                  .map((item, index) => (
                    <option key={index} value={item.item}>
                      {item.item}
                    </option>
                  ))}
              </select>
              <div>
                <button onClick={() => setConfirmResetData({ ...confirmCompleteTask, question: true })} 
                disabled={!isAdmin}>
                  Reset date
                </button>
              </div>
            </div>
          </div>
        </div>


      )}
    </div>
  );
};

export default Tabela;