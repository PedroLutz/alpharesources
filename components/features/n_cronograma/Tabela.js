import React, { useEffect, useState, useContext, useMemo } from 'react';
import Loading from '../../ui/Loading';
import Modal from '../../ui/Modal';
import { Chart } from 'react-google-charts';
import { fetchData, handleDelete, handleUpdate, handleSubmit } from '../../../functions/crud';
import { handleFetch, handleReq } from '../../../functions/crud_s';
import { cleanForm, jsDateToEuDate, euDateToIsoDate, euDateToJsDate } from '../../../functions/general';
import styles from '../../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';
import chroma from 'chroma-js';
import useAuth from '../../../hooks/useAuth';

const Tabela = () => {
  const { user, token } = useAuth();
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
  const [cores, setCores] = useState({});
  const camposVazios = {
    item_id: '',
    inicio: '',
    termino: '',
    dp_item_id: '',
  }
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


  //funcao que recebe o item a ser atualizado e insere os campos relevantes em novosDados
  const handleUpdateClick = (item) => {
    setNovosDados({
      id: item.id,
      item_id: item.wbs_item.id,
      is_plan: true,
      start: euDateToIsoDate(item.start),
      end: euDateToIsoDate(item.end),
      status: item.status
    });
  };


  //funcao que deleta o item tanto no plano quanto no monitoramento
  const handleConfirmDelete = async (id) => {
    setLoading(true);
    setConfirmDeleteItem(null);
    await handleReq({
      table: "gantt",
      route: 'delete',
      token,
      data: { id },
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
      if (item.is_plan) {
        var dependencies = ''
        const taskID = `${item.id}`;
        const taskName = item.wbs_item.name;
        const resource = item.wbs_item.wbs_area.name;
        const startDate = euDateToJsDate(item.start);
        const endDate = euDateToJsDate(item.end);
        if (!item.dp_area && !item.dp_item) {
          dependencies = null;
        } else {
          dependencies = `${item.dp_area}_${item.dp_item}`;
        }
        ganttData.push([taskID, taskName, resource, startDate, endDate, 10, 100, dependencies]);
        ganttDataContingency.push([taskID, taskName, resource, startDate, adicionarDias(endDate, Math.floor(etis[taskName])), 10, 100, dependencies]);
      }
    });

    return [ganttData, ganttDataContingency];
  };

  //funcao que executa na primeira render e depois so quando cronogramas ou etis atualiza
  //armazenando os dados diretamente nas constantes

  //useMemo ARMAZENA VALOR
  //useEffect REALIZA FUNCOES
  const [chartData, chartDataContingencies] = useMemo(() => {
    if (cronogramas.length === 0) return [[], []];
    return createGanttData();
  }, [cronogramas, etis]);

  const checkAreaDisponivel = (area_id, item_id, isDp) => {
    if (cronogramas.length == 0) {
      return !isDp;
    }
    return cronogramas.some((c) => {
      return isDp ? c.wbs_item.wbs_area.id == area_id
                  : (c.wbs_item.wbs_area.id != area_id || c.wbs_item.wbs_area.id == area_id && c.wbs_item.id != item_id)
    }
    );
  }

  const checkItemDisponivel = (item_id, isDp) => {
    if (cronogramas.length == 0) {
      return !isDp;
    }
    return cronogramas.some((c) => {
      return isDp ? c.wbs_item.id == item_id
        : c.wbs_item.id != item_id
    }
    );
  }

  //funcao para puxar os dados de cronograma, ETIs e cores, tratando-os e armazenando-os em estados
  const fetchCronogramas = async () => {
    try {
      const data = await handleFetch({
        table: 'gantt',
        query: 'all',
        token
      })
      // const dataETIs = await fetchData('riscos/analise/get/etis_per_item');

      data.data.forEach((item) => {
        item.start = jsDateToEuDate(item.start);
        item.end = jsDateToEuDate(item.end);
      });

      setCronogramas(data.data);
      setTabela(data.data);

      // const cronogramaComContingencias = data.cronogramaPlanos.map(item => ({ ...item }));;
      // cronogramaComContingencias.forEach((item) => {
      //   if (dataETIs.resultadosAgrupados[item.item]) {
      //     const termino = euDateToJsDate(item.termino)
      //     const terminoConvertido = adicionarDias(termino, Math.floor(dataETIs.resultadosAgrupados[item.item]));
      //     item.termino = jsDateToEuDate(terminoConvertido);
      //   }
      // })

      //adicionar cores na tabela
      // var cores = {};
      // dataCores.areasECores.forEach((area) => {
      //   cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
      // })

      // var paleta = [];
      // for (const [key, value] of Object.entries(cores)) {
      //   if (data.cronogramaPlanos.some((item) => item.area === key && item.termino !== null)) {
      //     paleta.push({
      //       "color": value ? chroma(value).darken().saturate(3).hex() : '#000000',
      //       "dark": value ? chroma(value).hex() : '#000000',
      //       "light": value ? chroma(value).darken().hex() : '#000000'
      //     })
      //   }
      // }

      // setEtis(dataETIs.resultadosAgrupados);
      // setCronogramas(data.cronogramaPlanos);
      // setCronogramasCont(cronogramaComContingencias);
      // setTabela(data.cronogramaPlanos);
    } finally {
      setLoading(false);
    }
  };

  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'dadosUsados': 'This item is already registered in the timelines!',
    'depFaltando': 'Please select the dependencies correctly!',
    'dpNotRegistered': "The item you've selected as predecessor is not registered!",
    'dpNotOkay': "The predecessor must finish before the successor starts!",
    'datasErradas': 'The finishing date must be after the starting date!'
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
    const formDataPlano = {
      ...novoSubmit,
      is_plan: true,
      status: 'start',
      user_id: user.id
    }
    delete formDataPlano.id;
    delete formDataPlano.plano;
    delete formDataPlano.dp_item;
    delete formDataPlano.dp_area;
    await handleReq({
      table: 'gantt',
      route: 'create',
      token,
      data: formDataPlano,
      fetchData: fetchCronogramas
    })
    // const formDataPlano = {
    //   ...novoSubmit,
    //   plano: true,
    //   situacao: 'concluida'
    // };

    // const formDataGantt = {
    //   ...novoSubmit,
    //   plano: false,
    //   inicio: null,
    //   termino: null,
    //   situacao: 'iniciar'
    // };
    // await handleSubmit({
    //   route: 'cronograma',
    //   dados: formDataPlano,
    //   fetchDados: fetchCronogramas
    // });
    // await handleSubmit({
    //   route: 'cronograma',
    //   dados: formDataGantt,

    // });
    cleanForm(novoSubmit, setNovoSubmit, camposSubmit);
  };

  //funcao que trata os dados e atualiza o plano
  const handleUpdateItem = async () => {
    if (novosDados) {
      try {
       await handleReq({
          table: 'gantt',
          route: 'update',
          token,
          data: novosDados,
          fetchData: fetchCronogramas
        });
      } catch (error) {
        console.error("Update failed:", error);
      }
    }
    cleanForm(novosDados, setNovosDados, camposVazios);
    setLinhaVisivel();
  };


  //funcao que calcula o rowSpan do td da area de acordo com os itens 
  const calculateRowSpan = (itens, currentArea, currentIndex) => {
    let rowSpan = 1;
    for (let i = currentIndex + 1; i < itens.length; i++) {
      if (itens[i].wbs_item.wbs_area.name === currentArea) {
        rowSpan++;
      } else {
        break;
      }
    }
    return rowSpan;
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
      <h2 className='smallTitle'>Estimated timeline</h2>
      {confirmDeleteItem && (
        <div className="overlay">
          <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.wbs_item.wbs_area.name} - {confirmDeleteItem.wbs_item.name}"?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="botao-padrao" onClick={() => handleConfirmDelete(confirmDeleteItem.id)}>Confirm</button>
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
                // palette: paleta,
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
                    obj={{ ...novoSubmit, plano: true }}
                    objSetter={setNovoSubmit}
                    tipo='cadastro'
                    funcoes={{
                      enviar,
                      setLoading,
                      checkAreaDisponivel,
                      checkItemDisponivel,
                    }}
                    loading={loading}
                    setExibirModal={setExibirModal}
                  />
                </tr>
                {tabela.filter((item) => item.is_plan).map((item, index) => (
                  <tr key={index} style={{ backgroundColor: item.wbs_item.wbs_area.color }}>
                    <React.Fragment>
                      {index === 0 || cronogramas[index - 1].wbs_item.wbs_area.name !== item.wbs_item.wbs_area.name ? (
                        <td rowSpan={calculateRowSpan(cronogramas, item.wbs_item.wbs_area.name, index)}
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
                          loading={loading}
                          funcoes={{
                            enviar: handleUpdateItem,
                            setLoading,
                            checkAreaDisponivel,
                            checkItemDisponivel,
                            cancelar: () => setLinhaVisivel()
                          }}
                        />
                      ) : (
                        <React.Fragment>
                          <td>{item.start}</td>
                          <td>{item.end}</td>
                          <td>{item.gantt_dependency[0]?.id || '-'}</td>
                          <td>{item.gantt_dependency[0]?.id || '-'}</td>
                          <td className="botoes_acoes">

                            <button onClick={() => setConfirmDeleteItem(item)}
                            >❌</button>
                            <button onClick={() => {
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