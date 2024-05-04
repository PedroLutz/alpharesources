import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../Loading';

const formatDate = (dateString) => {
  // Converte a data da string para um objeto de data
  const date = new Date(dateString);

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
  return new Date(+dateParts[2], dateParts[1] - 1, dateParts[0]);
}

const formatInputDate = (dateString) => {
  var dateParts = dateString.split("-");
  return new Date(+dateParts[0], dateParts[1] - 1, dateParts[2])
}

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteInfo, setDeleteInfo] = useState({ success: false, item: null });
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroAreaSelecionada, setFiltroAreaSelecionada] = useState('');
  const [dataInvalida, setDataInvalida] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [tarefaSelecionada, setTarefaSelecionada] = useState('');
  const [exibirModalSemTarefa, setExibirModalSemTarefa] = useState(false);
  const [exibirModalSituacaoInvalida, setExibirModalSituacaoInvalida] = useState(false);
  const [exibirModalSemDatas, setExibirModalSemDatas] = useState(false);
  const [mostrarTabela, setMostrarTabela] = useState(false);
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
        setDataInvalida(true);
        return false;
      }
    }
  
    setDataInvalida(false);
    return true;
  };

  const handleAtualizarTarefa = async (situacao) => {
    if (!tarefaSelecionada) {
      setExibirModalSemTarefa(true);
      return;
    }
    
    try {
      // Filtra os itens com base na área e no item selecionados
      const itemParaAtualizar = cronogramas.find(
        (item) =>
          item.area.toLowerCase() === filtroAreaSelecionada.toLowerCase() &&
          item.item === itemSelecionado &&
          !item.plano
      );
  
      // Verifica se há um item para atualizar
      if (!itemParaAtualizar) {
        console.log('Nenhum item para atualizar');
        return;
      }

      const response = await fetch(`/api/cronograma/update?id=${itemParaAtualizar._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          situacao: situacao,
        }),
      });
  
      if (response.status === 200) {
        console.log('Atualização da situação bem-sucedida');
        fetchCronogramas(); // Recarregar os dados após a atualização
      } else {
        console.error('Erro ao atualizar a situação do cronograma');
      }
    } catch (error) {
      console.error('Erro ao atualizar a situação do cronograma', error);
    }
  };

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
    setDeleteInfo({ success: false, item });
  };

  const handleAtualizarData = async () => {
    try {
      if (!validarDatas()) {
        // Se as datas forem inválidas, interrompa o processo
        return;
      }

      if (!datas.dataInicio && !datas.dataTermino) {
        setExibirModalSemDatas(true);
        return;
      }
  
      // Filtra os itens com base na área e no item selecionados
      const itemParaAtualizar = cronogramas.find(
        (item) =>
          item.area.toLowerCase() === filtroAreaSelecionada.toLowerCase() &&
          item.item === itemSelecionado &&
          !item.plano
      );
  
      // Verifica se há um item para atualizar
      if (!itemParaAtualizar) {
        console.log('Nenhum item para atualizar');
        return;
      }

      if (itemParaAtualizar.situacao === 'iniciar' || itemParaAtualizar.situacao === 'concluida') {
        setExibirModalSituacaoInvalida(true);
        return;
      }
  
      const response = await fetch(`/api/cronograma/update?id=${itemParaAtualizar._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Envia apenas os campos preenchidos
          ...(datas.dataTermino && { termino: formatInputDate(datas.dataTermino) }),
          ...(datas.dataInicio && { inicio: formatInputDate(datas.dataInicio) }),
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
        data.cronogramas.sort((a, b) => {
          if (a.area < b.area) return -1;
          if (a.area > b.area) return 1;
          return 0;
        });
        setCronogramas(data.cronogramas);
      } else {
        console.error('Error in searching for financial releases data');
      }
    } catch (error) {
      console.error('Error in searching for financial releases data', error);
    } finally {
      setLoading(false)};
  };

  useEffect(() => {
    fetchCronogramas();
  }, []);

  const handleConfirmDelete = () => {
    if (deleteInfo.item) {
      fetch(`/api/cronograma/delete?id=${deleteInfo.item._id}`, {
        method: 'DELETE',
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        fetchCronogramas();
        setDeleteInfo({ success: true, item: null });
      })
      .catch((error) => {
        console.error('Error deleting element', error);
      });
    }
  };

  const createGanttData = (cronogramas) => {
    const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];
    
    cronogramas.forEach((item) => {
      if (!item.plano) {
        if (formatDateGantt(item.inicio) < formatDateGantt(item.termino)){
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
        ganttData.push([taskID, taskName, resource, startDate, endDate, 0, 100, dependencies]);
        }
      }
    });

    return ganttData;
  };

  const handleSetDataHoje = (inputName) => {
    const today = new Date();
    today.setDate(today.getDate());
    const formattedDate = today.toISOString().split('T')[0];
  
    setDatas((prevDatas) => ({
      ...prevDatas,
      [inputName]: formattedDate,
    }));
  };

  const chartData = createGanttData(cronogramas);

  return (
    <div className="centered-container">
      {loading && <Loading/>}
      <h2>Timeline monitoring</h2>

      {deleteInfo.item && (
        <div className="overlay">
          <div className="modal">
            <p>Are you sure you want to delete "{deleteInfo.item.descricao}"?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="botao-cadastro" onClick={handleConfirmDelete}>
                Confirm
              </button>
              <button
                className="botao-cadastro"
                onClick={() => setDeleteInfo({ success: false, item: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteInfo.success && (
        <div className="overlay">
          <div className="modal">
            <p>Deletion successful!</p>
            <button className="botao-cadastro" onClick={() => setDeleteInfo({ success: false, item: null })}>
              Close
            </button>
          </div>
        </div>
      )}

      {dataInvalida && (
        <div className="overlay">
          <div className="modal">
            <p>The last execution must be equal to or greater than the start date.</p>
            <button className="botao-cadastro" onClick={() => setDataInvalida(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {exibirModalSemTarefa && (
        <div className="overlay">
          <div className="modal">
            <p>Select a task to start/complete</p>
            <button className="botao-cadastro" onClick={() => setExibirModalSemTarefa(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {exibirModalSituacaoInvalida && (
        <div className="overlay">
          <div className="modal">
            <p>You can only update the dates of tasks that are in execution.</p>
            <button
              className="botao-cadastro"
              onClick={() => setExibirModalSituacaoInvalida(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {exibirModalSemDatas && (
        <div className="overlay">
          <div className="modal">
            <p>Insert valid dates!</p>
            <button
              className="botao-cadastro"
              onClick={() => setExibirModalSemDatas(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Gráfico Gantt */}
      <Chart
        width={'90%'}
        height={'1300px'}
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
      
      <div className='mini-input'>
        <label htmlFor="filtroArea">Select task for updating</label>
        <select
          name="area"
          value={filtroAreaSelecionada}
          onChange={(e) => {
            setFiltroAreaSelecionada(e.target.value);
            setItemSelecionado('');}}
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
              setTarefaSelecionada(true);
              setExibirModalSemTarefa(false); // Resetar o estado quando uma tarefa é selecionada
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
            <button onClick={() => handleAtualizarTarefa('em andamento')} style={{width: '100px'}}>
              Start task
            </button>
            <button onClick={() => handleAtualizarTarefa('concluida')} style={{width: '150px'}}>
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
              style={{maxWidth: '250px'}}
              placeholder=""
              onChange={(e) => setDatas({ ...datas, dataInicio: e.target.value })}
              value={datas.dataInicio}
              required
            />
            <button
            style={{marginTop:'9px', marginLeft: '-10px'}}
            onClick={() => handleSetDataHoje('dataInicio')}>Set today</button>
          </div>
          
          <label htmlFor="terminoAlterado">Last execution</label>
          <div className='mesma-linha input-data'>
            <input
                type="date"
                id="terminoAlterado"
                name="terminoAlterado"
                style={{maxWidth: '250px'}}
                placeholder=""
                onChange={handleChange}
                value={datas.dataTermino}
                required
              />
              <button
              style={{marginTop:'9px', marginLeft: '-10px'}}
              onClick={() => handleSetDataHoje('dataTermino')}>Set today</button>
          </div>
        </div>
        

        <button className="botao-cadastro" 
        onClick={handleAtualizarData}>
          Update dates
        </button>

        <button className="botao-cadastro"
        style={{marginTop: '20px'}}
        onClick={() => {
          setMostrarTabela(!mostrarTabela);
          setFiltroArea('');
          }}>
        {mostrarTabela ? 'Hide table' : 'Show table'}
        </button>

        {mostrarTabela && (
          <div className="centered-container">
            <div style={{marginTop: '30px'}} className='mini-input'>
              <label htmlFor="filtroArea">Filter Table:</label>
              <select
                name="area"
                onChange={handleFilterChange}
                value={filtroArea}
                required
              >
                <option value="" disabled>Select an area</option>
                  {[...new Set(cronogramas.map(item => item.area))].map((area, index) => (
                      <option key={index} value={area}>{area}</option>
                  ))}
              </select>
            </div>

            <table style={{marginBottom: '20px'}}>
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Task</th>
                  <th>Start</th>
                  <th>End</th>
                  <th style={{width:'11%'}}>Dependency: Area</th>
                  <th style={{width:'11%'}}>Dependency: Item</th>
                  <th>Situation</th>
                  <th style={{width:'5%'}}>Delete</th>
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
                    <td>{item.dp_item|| '-'}</td>
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
