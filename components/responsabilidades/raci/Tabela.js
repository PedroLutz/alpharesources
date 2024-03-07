import React, { useEffect, useState } from 'react';

const Tabela = () => {
  const [itensRaci, setItensRaci] = useState([]);
  const [nomesMembros, setNomesMembros] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [novosDados, setNovosDados] = useState({
    area: "",
    item: "",
    responsabilidades: ""
  });

  const handleChange = (e) => {
    setNovosDados({
      ...novosDados,
      [e.target.name]: e.target.value,
    });
  };

  const handleClick = (item) => {
    setConfirmDeleteItem(item);
  };

  const handleUpdateClick = (item) => {
    let valorCorrigido = 0;
    if(Number(item.valor) < 0){
      valorCorrigido = -Number(item.valor);
    } else {
      valorCorrigido = item.valor;
    }

    const parts = item.data.split('/');
    const itemDate = new Date(parts[2], parts[1] - 1, parts[0]); 
  
    setConfirmUpdateItem(item);
    setNovosDados({
      tipo: item.tipo,
      descricao: item.descricao,
      valor: valorCorrigido,
      data: itemDate.toISOString().split('T')[0], 
      area: item.area,
      origem: item.origem,
      destino: item.destino,
    });
  };

  const handleCellClick = (value) => {
    setEditCell(value);
    setEditValue(value);
  };

  const handleSelectChange = (e) => {
    setEditValue(e.target.value);
  };

  const fetchItensRaci = async () => {
    try {
      const response = await fetch('/api/responsabilidades/raci/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setItensRaci(data.itensRaci);
      } else {
        console.error('Error in searching for RACI items data');
      }
    } catch (error) {
      console.error('Error in searching for RACI items data', error);
    }
  };

  const fetchNomesMembros = async () => {
    try {
      const response = await fetch('/api/responsabilidades/membros/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setNomesMembros(data.nomes);
      } else {
        console.error('Error in searching for RACI items data');
      }
    } catch (error) {
      console.error('Error in searching for RACI items data', error);
    }
  };

  useEffect(() => {
    fetchNomesMembros();
    fetchItensRaci();
  }, []);

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      fetch(`/api/responsabilidades/raci/delete?id=${confirmDeleteItem._id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message); // Exibir uma mensagem de sucesso
          // Atualize os dados na tabela após a exclusão
          // Você pode recarregar a página ou atualizar os dados de outra forma
          fetchItensRaci();
          setDeleteSuccess(true);
        })
        .catch((error) => {
          console.error('Erro ao excluir elemento', error);
        });
    }
    setConfirmDeleteItem(null);
  };

  const handleCloseModal = () => {
    setDeleteSuccess(false);
  };

  const generateTableHeaders = () => {
    const firstNames = new Map();
    const headers = [];
  
    nomesMembros.forEach((membro) => {
      const nomeCompleto = membro.nome;
      const firstName = nomeCompleto.split(' ')[0];
      const lastName = nomeCompleto.split(' ')[1];
  
      if (firstNames.has(firstName)) {
        const existingHeader = firstNames.get(firstName);
        headers.push(`${existingHeader} ${lastName}`);
      } else {
        firstNames.set(firstName, nomeCompleto.split(' ')[0]);
        headers.push(nomeCompleto.split(' ')[0]);
      }
    });
  
    return headers;
  };
  
  const tableHeaders = generateTableHeaders();

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      const isExpense = confirmUpdateItem.tipo === "Expense";
      const newValueWithSign = isExpense ? -novosDados.valor : novosDados.valor;
      const { tipo, descricao, valor, data, area, origem, destino } = novosDados;

      try {
        const response = await fetch(`/api/responsabilidades/raci/update?id=${String(confirmUpdateItem._id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tipo, descricao, valor: newValueWithSign, data, area, origem, destino }),
        });

        if (response.status === 200) {
          console.log('Release updated successfully!');
          fetchLancamentos();
        } else {
          console.error('Error in updating release');
        }
      } catch (error) {
        console.error('Error in updating release', error);
      }
    }
    setConfirmUpdateItem(null);
    setNovosDados({
      tipo: '',
      descricao: '',
      valor: '',
      data: '',
      area: '',
      origem: '',
      destino: ''
    })
  };

return (
  <div className="centered-container">
    <h2>RACI Matrix</h2>
    <div id="report">
    <table>
        <thead>
          <tr>
            <th>Area</th>
            {tableHeaders.map((membro, index) => (
              <th key={index}>{membro}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itensRaci.map((item, index) => (
            <tr key={index}>
              <td>{`${item.area} ${item.item}`}</td>
              {item.responsabilidades.split(', ').map((responsabilidade, index) => (
                <td key={index}>{responsabilidade}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

      {confirmDeleteItem && (
        <div className="overlay">
            <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.descricao}"?</p>
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

      {confirmUpdateItem && (
        <div>
          
        </div>
      )}
    </div>
  );
};

export default Tabela;