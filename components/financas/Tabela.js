import React, { useEffect, useState } from 'react';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Tabela = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchLancamentos = async () => {
    try {
      const response = await fetch('/api/financas/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        data.lancamentos.forEach((item) => {
          item.data = formatDate(item.data);
        });
        setLancamentos(data.lancamentos);
      } else {
        console.error('Erro ao buscar dados dos lançamentos');
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos lançamentos', error);
    }
  };

  useEffect(() => {
    fetchLancamentos();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Tem certeza de que deseja excluir este lançamento?');

    if (confirmDelete) {
      try {
        const response = await fetch(`/api/financas/delete?id=${String(id)}`, {
          method: 'DELETE',
        });

        if (response.status === 200) {
          console.log('Lançamento excluído com sucesso!');
          setDeleteSuccess(true);
          fetchLancamentos();
        } else {
          console.error('Erro ao excluir o lançamento');
          setDeleteSuccess(false);
        }
      } catch (error) {
        console.error('Erro ao excluir o lançamento', error);
        setDeleteSuccess(false);
      }
    }
  };

  const handleUpdate = async (id) => {
    let newValue = prompt('Insira o novo valor:');
    if (newValue < 0){
      alert("Insira um valor maior do que zero!");
    } else if (newValue !== null) {

      const tipo = lancamentos.find(item => item._id === id)?.tipo;

      if (tipo === 'Despesa') {
        newValue = -Math.abs(newValue); // Torna o valor negativo
      } else if (tipo === 'Receita') {
        newValue = Math.abs(newValue); // Torna o valor positivo
      }
      try {
        const response = await fetch(`/api/financeiro/financas/update?id=${String(id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ valor: parseFloat(newValue) }), // Converter o novo valor para número
        });

        if (response.status === 200) {
          console.log('Lançamento atualizado com sucesso!');
          fetchLancamentos();
        } else {
          console.error('Erro ao atualizar o lançamento');
        }
      } catch (error) {
        console.error('Erro ao atualizar o lançamento', error);
      }
    }
  };

  return (
    <div className="centered-container">
      <h2>Dados dos Lançamentos</h2>
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Área</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map((item, index) => (
            <tr key={index}>
              <td>{item.tipo}</td>
              <td>{item.descricao}</td>
              <td>{Math.abs(item.valor)}</td>
              <td>{item.data}</td>
              <td>{item.area}</td>
              <td>{item.origem}</td>
              <td>{item.destino}</td>
              <td>
                <div className="botoes-acoes">
                  <button style={{color: 'red'}} onClick={() => handleDelete(item._id)}>X</button>
                  <button onClick={() => handleUpdate(item._id)}>$</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tabela;
