import React, { useEffect, useState, useMemo } from 'react';
import Loading from '../../ui/Loading';
import Modal from '../../ui/Modal';
import { Chart } from 'react-google-charts';
import { handleFetch, handleReq } from '../../../functions/crud_s';
import { cleanForm, jsDateToEuDate, euDateToIsoDate, isoDateToJsDate } from '../../../functions/general';
import styles from '../../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';
import chroma from 'chroma-js';
import useAuth from '../../../hooks/useAuth';
import usePerm from '../../../hooks/usePerm';
import HelpBubble from '../../ui/HelpBubble/cronograma/Tabela';
import { getTextColor } from '../../../functions/colors';
import { calculateRowSpan } from '../../../functions/general';
import { useToolbar } from '../../../hooks/useToolbar';
import { useCallback } from 'react';
import exportCSV from '../../../functions/exportCSV';
import { GanttChart } from '../../ui/GanttChart/GanttChart';

const Tabela = () => {
  const { user, token } = useAuth();
  const { isEditor } = usePerm();

  const [cronogramas, setCronogramas] = useState([]);
  const [cronogramasCont, setCronogramasCont] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [exibirModal, setExibirModal] = useState(null);
  const [chartHeight, setChartHeight] = useState('100px');
  const [chartDataLoaded, setChartDataLoaded] = useState(false);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const camposSubmit = {
    id: '',
    item_id: '',
    is_plan: '',
    start: '',
    end: '',
    status: '',
    user_id: ''
  }
  const [novosDados, setNovosDados] = useState(camposSubmit);
  const [novoSubmit, setNovoSubmit] = useState(camposSubmit);
  const [paleta, setPaleta] = useState([]);
  const [etis, setEtis] = useState([]);
  const [showContingencies, setShowContingencies] = useState(false);
  const [tabela, setTabela] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const { setExportCSVClick, setHelpClick } = useToolbar();

  const exportToCSV = useCallback(() => {
    const headers = ["Area", "Task",
      "Start", "End", "Dependency: Area",
      "Dependency: Item"];
    const lines = cronogramas.map(item => [
      item.wbs_item.wbs_area.name,
      item.wbs_item.name,
      jsDateToEuDate(item?.gantt_data[0]?.start),
      jsDateToEuDate(item?.gantt_data[0]?.end),
      item.gantt_dependency[0]?.dependency_id ? cronogramas.find(t => t.id == item.gantt_dependency[0]?.dependency_id).wbs_item.wbs_area.name : '-',
      item.gantt_dependency[0]?.dependency_id ? cronogramas.find(t => t.id == item.gantt_dependency[0]?.dependency_id).wbs_item.name : '-'
    ]);
    exportCSV(headers, lines, "timeline_monitoring");
  }, [cronogramas, exportCSV]);

  useEffect(() => {
    setHelpClick(() => () => setShowHelp(true));
    setExportCSVClick(() => exportToCSV);

    return (() => {
      setHelpClick(null);
      setExportCSVClick(null);
    })
  }, [cronogramas, exportToCSV]);

  //funcao que recebe o item a ser atualizado e insere os campos relevantes em novosDados
  const handleUpdateClick = (item) => {
    setNovosDados({
      id: item.gantt_data[0].id,
      item_id: item.wbs_item.id,
      is_plan: true,
      gantt_id: item.id,
      start: item?.gantt_data[0]?.start,
      end: item?.gantt_data[0]?.end,
      dependency_id: item.gantt_dependency[0] ? item?.gantt_dependency[0]?.dependency_id : "",
      status: item.gantt_data.status
    });
  };

  //funcao que deleta o item tanto no plano quanto no monitoramento
  const handleConfirmDelete = async (confirmDeleteItem) => {
    setLoading(true);
    setConfirmDeleteItem(null);
    await handleReq({
      table: "gantt",
      route: 'delete',
      token,
      data: { id: confirmDeleteItem.id },
      fetchData: fetchCronogramas
    });
    await handleReq({
      table: "gantt_dependency",
      route: 'delete',
      subroute: 'byGanttId',
      token,
      data: { id: confirmDeleteItem.id },
      fetchData: fetchCronogramas
    });
    setLoading(false);
  };


  //funcao para somar dias a uma data
  function adicionarDias(data, dias) {
    if (dias) {
      const novaData = new Date(data);
      novaData.setDate(novaData.getDate() + dias);
      return novaData;
    }
    return data;
  }


  //funcao para criar os dados que entram no grafico gantt, tanto o normal quanto o de contingencia
  const createGanttData = () => {
    const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];
    const ganttDataContingency = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];

    cronogramas.forEach((item) => {
      if (item.gantt_data[0].is_plan) {
        let dependencies = ''
        const taskID = `${item.id}`;
        const taskName = item.wbs_item.name;
        const resource = item.wbs_item.wbs_area.name;
        const startDate = isoDateToJsDate(item.gantt_data[0].start);
        const endDate = isoDateToJsDate(item.gantt_data[0].end);
        if (!item.gantt_dependency[0]) {
          dependencies = null;
        } else {
          dependencies = `${item.gantt_dependency[0].dependency_id}`;
        }
        ganttData.push([taskID, taskName, resource, startDate, endDate, 10, 100, dependencies]);
        const riscosAnalise = etis.filter(e => e?.risk?.wbs_item?.id == item?.wbs_item?.id);
        var acrescimoDeData = 0;
        if (riscosAnalise.length > 0) {
          riscosAnalise.forEach(e => {
            const eti = e?.schedule_impact * (e?.occurrence / 5) || 0;
            acrescimoDeData += eti;
          })
        }
        ganttDataContingency.push([taskID, taskName, resource, startDate, adicionarDias(endDate, Math.floor(acrescimoDeData)), 10, 100, dependencies]);
      }
    });

    return [ganttData, ganttDataContingency];
  };

  //funcao que executa na primeira render e depois so quando cronogramas ou etis atualiza
  //armazenando os dados diretamente nas constantes
  const [chartData, chartDataContingencies] = useMemo(() => {
    if (cronogramas.length === 0) return [[], []];
    return createGanttData();
  }, [cronogramas, etis]);

  const checkAreaDisponivel = (area_id, item_id, isDp) => {
    if (cronogramas.length == 0) {
      return !isDp;
    }
    return cronogramas.some((c) => {
      if (isDp) {
        return c.wbs_item.wbs_area.id == area_id
      } else {
        return c.wbs_item.wbs_area.id != area_id || c.wbs_item.wbs_area.id == area_id && c.wbs_item.id != item_id
      }
    }
    );
  }

  const checkItemDisponivel = (item_id, isDp) => {
    if (cronogramas.length == 0) {
      return !isDp;
    }
    if (isDp) {
      return cronogramas.some(c => c.wbs_item.id == item_id);
    } else {
      return !cronogramas.some(c => c.wbs_item.id == item_id);
    }
  }

  const findGanttById = (id) => {
    return cronogramas.find((c) => c.id == id);
  }

  const findGanttByItemId = (id) => {
    return cronogramas.find((c) => c.wbs_item.id == id);
  }

  //funcao para puxar os dados de cronograma, ETIs e cores, tratando-os e armazenando-os em estados
  const fetchCronogramas = async () => {
    setLoaded(false);
    try {
      const data = await handleFetch({
        table: 'gantt',
        query: 'plans',
        token
      })

      data.data.sort((a, b) => {
        if (a.wbs_item.wbs_area.name != b.wbs_item.wbs_area.name) {
          return a.wbs_item.wbs_area.name > b.wbs_item.wbs_area.name
        }

        return isoDateToJsDate(a.gantt_data[0].start) > isoDateToJsDate(b.gantt_data[0].start)
      })

      const dataETIs = await handleFetch({
        table: 'risk_analysis',
        query: 'etis_per_item',
        token
      })

      const cronogramaComContingencias = structuredClone(data.data);
      cronogramaComContingencias.forEach((item) => {
        const riscosAnalise = dataETIs.data.filter((e) => e.risk?.wbs_item?.id == item.wbs_item?.id)
        if (riscosAnalise.length > 0) {
          var acrescimoDeData = 0;
          riscosAnalise.forEach(e => {
            const eti = e?.schedule_impact * (e?.occurrence / 5) || 0;
            acrescimoDeData += eti;
          })
          const termino = item.gantt_data[0].end;
          const terminoConvertido = adicionarDias(termino, Math.floor(acrescimoDeData));
          item.gantt_data[0].end = euDateToIsoDate(jsDateToEuDate(terminoConvertido));
        }
      })
      //adicionar cores na tabela
      var cores = {};
      data.data.forEach((c) => {
        cores = { ...cores, [c.wbs_item.wbs_area.name]: c.wbs_item.wbs_area.color ? c.wbs_item.wbs_area.color : '' }
      })

      var paleta = [];
      for (const [key, value] of Object.entries(cores)) {
        if (data.data.some((item) => item.wbs_item.wbs_area.name === key && item.end !== null)) {
          paleta.push({
            "color": value ? chroma(value).darken().saturate(3).hex() : '#000000',
            "dark": value ? chroma(value).hex() : '#000000',
            "light": value ? chroma(value).darken().hex() : '#000000'
          })
        }
      }

      setPaleta(paleta);
      setEtis(dataETIs.data);
      setCronogramas(data.data)
      setTabela(data.data);
      setCronogramasCont(cronogramaComContingencias);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'depFaltando': 'Please select the dependencies correctly!',
    'dpNotOkay': "The predecessor must finish before the successor starts!",
    "dpIsTask": "A task cannot depend on itself!",
    'datasErradas': 'The finishing date must be after the starting date!',
  };


  //useEffect que só executa as funcoes quando reload atualiza
  useEffect(() => {
    if (reload == true) {
      setReload(false);
      fetchCronogramas();
    }
  }, [reload]);


  //useEffect que so roda na primeira execucao
  useEffect(() => {
    fetchCronogramas();
  }, []);


  //useEffect que só executa quando chartData recebe um valor para calcular o tamanho do grafico
  useEffect(() => {
    if (chartData.length > 1) {
      const linhaHeight = isMobile ? 20 : 30;
      const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
      setChartHeight(novaAltura);
      setChartDataLoaded(true);
    }
  }, [chartData]);


  //funcao que cadastra o plano e o monitoramento, com os dados vazios
  const enviar = async () => {
    setLoading(true);

    //se houver uma tarefa predecessora, prepara o objeto de cadastro de dependencia
    let formDataDependency;
    if (novoSubmit.dp_item) {
      formDataDependency = {
        dependency_id: cronogramas.find((c) => c.wbs_item.id == novoSubmit.dp_item).id,
        user_id: user.id
      }
    }

    //objeto de cadastro na tabela gantt
    const formDataGantt = {
      item_id: novoSubmit.item_id,
      user_id: user.id
    }

    //prepara os objetos de cadastro de plano e monitoramento
    const { id, dp_item, item_id, ...validNovoSubmit } = novoSubmit;
    const formDataMonitor = {
      ...validNovoSubmit,
      is_plan: false,
      status: 'start',
      start: null,
      end: null,
      user_id: user.id
    }
    const formDataPlano = {
      ...validNovoSubmit,
      is_plan: true,
      status: 'start',
      user_id: user.id
    }

    //cadastro na tabela gantt (retorna os dados do item cadastrado)
    const success = await handleReq({
      table: 'gantt',
      route: 'createReturn',
      token,
      data: formDataGantt,
    })

    //cadastros na tabela gantt_data (plano e monitoramento)
    await handleReq({
      table: 'gantt_data',
      route: 'create',
      token,
      data: { ...formDataPlano, gantt_id: success.data.resultado[0].id },
    })
    await handleReq({
      table: 'gantt_data',
      route: 'create',
      token,
      data: { ...formDataMonitor, gantt_id: success.data.resultado[0].id },
    })

    //se há uma dependencia, registra ela na tabela gantt_dependency
    if (formDataDependency.dependency_id != "" && formDataDependency.dependency_id != null) {
      formDataDependency = {
        ...formDataDependency,
        gantt_id: success.data.resultado[0].id
      }
      await handleReq({
        table: 'gantt_dependency',
        route: 'create',
        token,
        data: formDataDependency,
      })
    }

    cleanForm(novoSubmit, setNovoSubmit, camposSubmit);
    await fetchCronogramas();
    setLoading(false);
  };

  //funcao que trata os dados e atualiza o plano
  const handleUpdateItem = async () => {
    setLoading(true);

    //verifica se as novas datas não rompem a ordem das dependendências


    const old_dependency_id = cronogramas.find(c => c.id === novosDados.gantt_id)?.gantt_dependency[0]?.dependency_id;
    const new_dependency_id = cronogramas.find(c => c.wbs_item.id == novosDados?.dp_item)?.id;
    if (new_dependency_id === novosDados.gantt_id) {
      setExibirModal("dpIsTask");
      return;
    };
    if (old_dependency_id === new_dependency_id) {
      let depOkay = true;
      const tarefasDependentes = cronogramas.filter(c => c.gantt_dependency[0]?.dependency_id === novosDados.gantt_id);
      tarefasDependentes.forEach(t => {
        if (isoDateToJsDate(t.gantt_data[0]?.start) < isoDateToJsDate(novosDados.end)) {
          setExibirModal("dpNotOkay");
          depOkay = false;
          return;
        }
      })

      if (!depOkay) return;
    }

    const { dependency_id, dp_item, item_id, ...updatedData } = novosDados;
    if (novosDados) {
      try {
        await handleReq({
          table: 'gantt_data',
          route: 'update',
          token,
          data: updatedData,
        });

        //se a dependencia for nula, apaga por padrão
        if (novosDados.dp_item == null || novosDados.dp_item === "") {
          await handleReq({
            table: "gantt_dependency",
            route: 'delete',
            subroute: 'byGanttId',
            token,
            data: { id: novosDados.gantt_id },
          });
        } else {
          if (old_dependency_id !== new_dependency_id) {
            await handleReq({
              table: "gantt_dependency",
              route: 'delete',
              subroute: 'byGanttId',
              token,
              data: { id: novosDados.gantt_id },
            });

            const formDataDependency = {
              gantt_id: novosDados.gantt_id,
              dependency_id: new_dependency_id,
              user_id: user.id
            }

            await handleReq({
              table: 'gantt_dependency',
              route: 'create',
              token,
              data: formDataDependency,
            })
          }
        }

      } catch (error) {
        console.error("Update failed:", error);
      }
    }
    await fetchCronogramas();
    cleanForm(novosDados, setNovosDados, camposSubmit);
    setLinhaVisivel();
  };

  const handleResize = () => {
    if (window.innerWidth < 1024) {
      setIsMobile(true)
    } else {
      setIsMobile(false)
    }
  }

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
  }, []);

  return (
    <div className="centered-container">
      {loading && <Loading />}
      {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
      <h2 className='smallTitle'>Estimated timeline</h2>
      {confirmDeleteItem && (
        <div className="overlay">
          <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.wbs_item.wbs_area.name} - {confirmDeleteItem.wbs_item.name}"?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="botao-padrao" onClick={() => handleConfirmDelete(confirmDeleteItem)}>Confirm</button>
              <button className="botao-padrao" onClick={() => setConfirmDeleteItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <div className="overlay">
          <div className="modal">
            <p>{deleteSuccess ? 'Deletion successful!' : 'Deletion failed.'}</p>
            <button className="botao-padrao" onClick={() => setDeleteSuccess(false)}>Close</button>
          </div>
        </div>
      )}

      {exibirModal != null && (
        <Modal objeto={{
          titulo: modalLabels[exibirModal],
          botao1: {
            funcao: () => setExibirModal(null), texto: 'Okay'
          },
        }} />
      )}

      <button className="botao-bonito" style={{ width: '11rem' }} onClick={() => {
        setShowContingencies(!showContingencies);
        showContingencies ? setTabela(cronogramas) : setTabela(cronogramasCont);
      }}
      >{!showContingencies ? `Show contingencies` : `Hide contingencies`}</button>

      {chartDataLoaded && (
        <div style={{ width: '90%', height: chartHeight }}>
          <Chart
            key={isMobile ? "mobile" : "desktop"}
            height="100%"
            width="100%"
            chartType="Gantt"
            loader={<div>Loading Chart</div>}
            data={!showContingencies ? chartData : chartDataContingencies}
            options={{
              gantt: {
                trackHeight: isMobile ? 20 : 30,
                barHeight: isMobile ? 10 : null,
                arrow: {
                  length: isMobile ? 0 : 8
                },
                sortTasks: false,
                palette: paleta,
                shadowEnabled: false,
                criticalPathEnabled: false,
                labelMaxWidth: isMobile ? 0 : 300
              },
            }}
          />
        </div>

      )}

      <div className="centered-container">
        <div className={styles.tabelaCronograma_container}>
          <div className={styles.tabelaCronograma_wrapper}>
            <table style={{ marginBottom: '10px' }} className={`tabela ${styles.tabelaCronograma}`}>
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Task</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Dependency: Area</th>
                  <th>Dependency: Item</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <CadastroInputs
                    obj={{ ...novoSubmit, is_plan: true }}
                    objSetter={setNovoSubmit}
                    tipo='cadastro'
                    funcoes={{
                      enviar,
                      setLoading,
                      checkAreaDisponivel,
                      checkItemDisponivel,
                      findGanttById,
                      findGanttByItemId
                    }}
                    loaded={loaded}
                    setExibirModal={setExibirModal}
                  />
                </tr>
                {tabela.filter((item) => item?.gantt_data[0]?.is_plan).map((item, index) => (
                  <tr key={index} style={{ backgroundColor: item.wbs_item.wbs_area.color, color: getTextColor(item.wbs_item.wbs_area.color) }}>
                    <React.Fragment>
                      {index === 0 || cronogramas[index - 1].wbs_item.wbs_area.name !== item.wbs_item.wbs_area.name ? (
                        <td rowSpan={calculateRowSpan(cronogramas, item.wbs_item.wbs_area.name, index, "wbs_item.wbs_area.name")}
                        >{item.wbs_item.wbs_area.name}</td>
                      ) : null}
                      <td>
                        {item.wbs_item.name}
                      </td>
                      {linhaVisivel === item.id ? (
                        <CadastroInputs
                          tipo="update"
                          obj={novosDados}
                          objSetter={setNovosDados}
                          setExibirModal={setExibirModal}
                          loaded={loaded}
                          funcoes={{
                            enviar: handleUpdateItem,
                            setLoading,
                            checkAreaDisponivel,
                            checkItemDisponivel,
                            findGanttById,
                            findGanttByItemId,
                            cancelar: () => setLinhaVisivel()
                          }}
                          backgroundColor={item.wbs_item.wbs_area.color}
                        />
                      ) : (
                        <React.Fragment>
                          <td>{jsDateToEuDate(item?.gantt_data[0]?.start)}</td>
                          <td>{jsDateToEuDate(item?.gantt_data[0]?.end)}</td>
                          <td>{item.gantt_dependency[0]?.dependency_id ? tabela.find(t => t.id == item.gantt_dependency[0]?.dependency_id).wbs_item.wbs_area.name : '-'}</td>
                          <td>{item.gantt_dependency[0]?.dependency_id ? tabela.find(t => t.id == item.gantt_dependency[0]?.dependency_id).wbs_item.name : '-'}</td>
                          <td className="botoes_acoes">
                            <button onClick={() => setConfirmDeleteItem(item)}
                              disabled={!isEditor}>❌</button>
                            <button disabled={!isEditor} onClick={() => {
                              setLinhaVisivel(item.id); handleUpdateClick(item)
                            }}
                            >⚙️</button>

                          </td>
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tabela;