import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

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
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}

const formatInputDate = (dateString) => {
  var dateParts = dateString.split("-");
  return new Date(+dateParts[0], dateParts[1] - 1, +dateParts[2])
}

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteInfo, setDeleteInfo] = useState({ success: false, item: null });
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroAreaSelecionada, setFiltroAreaSelecionada] = useState('');
  const [datas, setDatas] = useState({
    dataInicio: '',
    dataTermino: '',
  });
  const [dataInvalida, setDataInvalida] = useState(false);
  const [mensagemErroData, setMensagemErroData] = useState('');
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [tarefaSelecionada, setTarefaSelecionada] = useState('');
  const [exibirModalSemTarefa, setExibirModalSemTarefa] = useState(false);

  const handleChange = (e) => {
    setDatas({ ...datas, dataTermino: e.target.value });
  }

  const validarDatas = () => {
    if (datas.dataInicio && datas.dataTermino) {
      const dataInicioObj = new Date(datas.dataInicio);
      const dataTerminoObj = new Date(datas.dataTermino);
  
      if (dataInicioObj > dataTerminoObj) {
        setDataInvalida(true);
        setMensagemErroData('A data de início deve ser menor ou igual à data de término.');
        return false;
      }
    }
  
    setDataInvalida(false);
    setMensagemErroData('');
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
    setDeleteInfo({ success: false, item }); // Ao clicar, definimos item para confirmação
  };

  const handleAtualizarData = async () => {
    try {
      if (!validarDatas()) {
        // Se as datas forem inválidas, interrompa o processo
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
        setCronogramas(data.cronogramas);
      } else {
        console.error('Error in searching for financial releases data');
      }
    } catch (error) {
      console.error('Error in searching for financial releases data', error);
    }
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
        if (item.inicio < item.termino){
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
      }
    });

    return ganttData;
  };

  const handleSetDataHoje = (inputName) => {
    const today = new Date();
    today.setDate(today.getDate());
    const formattedDate = today.toISOString().split('T')[0];
  
    // Atualizar o estado apenas para o input correspondente
    setDatas((prevDatas) => ({
      ...prevDatas,
      [inputName]: formattedDate,
    }));
  };

  const chartData = createGanttData(cronogramas);

  return (
    <div className="centered-container">
      <h2>Linha do tempo</h2>
      <div>
      <label htmlFor="filtroArea">Filter by Area:</label>
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
              ))}
            </select>
      </div>
        
      <table style={{marginBottom: '10px'}}>
        <thead>
          <tr>
            <th>Plan</th>
            <th>Area</th>
            <th>Item</th>
            <th>Start</th>
            <th>End</th>
            <th style={{width:'10%'}}>Dependency: Area</th>
            <th style={{width:'10%'}}>Dependency: Item</th>
            <th>Situation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {filteredCronogramas.filter((item) => !item.plano).map((item, index) => (
            <tr key={index}>
              <td>{item.plano}</td>
              <td>
                {item.area}
              </td>
              <td>
                {item.item}
              </td>
              <td>{item.inicio}</td>
              <td>{item.termino}</td>
              <td>{item.dp_area}</td>
              <td>{item.dp_item}</td>
              <td>{item.situacao}</td>
              <td>
                <div className="botoes-acoes">
                  <button style={{color: 'red'}} onClick={() => handleClick(item)}>X</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
      <p>{mensagemErroData}</p>
      <button className="botao-cadastro" onClick={() => setDataInvalida(false)}>
        OK
      </button>
    </div>
  </div>
)}

{exibirModalSemTarefa && (
  <div className="overlay">
    <div className="modal">
      <p>Selecione uma tarefa para iniciar/finalizar.</p>
      <button className="botao-cadastro" onClick={() => setExibirModalSemTarefa(false)}>
        OK
      </button>
    </div>
  </div>
)}

      {/* Gráfico Gantt */}
      <Chart
        width={'90%'}
        height={'100%'}
        chartType="Gantt"
        loader={<div>Loading Chart</div>}
        data={chartData}
        options={{
          gantt: {
            trackHeight: 30,
          },
        }}
      />

        
        <div className='mini-input'>
        <label htmlFor="filtroArea">Filter by Area ATUALIZAR:</label>
        <select
          name="area"
          value={filtroAreaSelecionada}
          onChange={(e) => setFiltroAreaSelecionada(e.target.value)}
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

<div className="centered-container">
        <button className="botao-cadastro" onClick={() => handleAtualizarTarefa('em andamento')}>
          Iniciar Tarefa
        </button>
        <button className="botao-cadastro" onClick={() => handleAtualizarTarefa('concluida')}>
          Finalizar Tarefa
        </button>
    </div>
        
        <div className='mini-input'>
          <label htmlFor="inicioAlterado">Início a ser alterado</label>
          <div className='mesma-linha'>
          <input
            type="date"
            id="inicioAlterado"
            name="inicioAlterado"
            placeholder=""
            onChange={(e) => setDatas({ ...datas, dataInicio: e.target.value })}
            value={datas.dataInicio}
            required
          />
          <button className="botao-cadastro" onClick={() => handleSetDataHoje('dataInicio')}>Hoje</button>
          </div>
          
          <label htmlFor="terminoAlterado">Término a ser alterado</label>
          <div className='mesma-linha'>
            <input
                type="date"
                id="terminoAlterado"
                name="terminoAlterado"
                placeholder=""
                onChange={handleChange}
                value={datas.dataTermino}
                required
              />
              <button className="botao-cadastro" onClick={() => handleSetDataHoje('dataTermino')}>Hoje</button>
          </div>
        </div>
        

      <button className="botao-cadastro" onClick={handleAtualizarData}>
        Atualizar Datas
      </button>
    </div>
  );
};

export default Tabela;
