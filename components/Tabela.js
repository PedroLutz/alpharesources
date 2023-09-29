import React, { useEffect, useState } from 'react';

const Tabela = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Função para buscar os dados dos lançamentos quando a página é carregada
  const fetchLancamentos = async () => {
    try {
      const response = await fetch('/api/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setLancamentos(data.lancamentos); // Extraia apenas os lançamentos
      } else {
        console.error('Erro ao buscar dados dos lançamentos');
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos lançamentos', error);
    }
  };

  useEffect(() => {
    // Chame a função para buscar os dados dos lançamentos quando a página é carregada
    fetchLancamentos();
  }, []);

  const handleDelete = async (id) => {
    // Exibir um diálogo de confirmação ao usuário
    const confirmDelete = window.confirm('Tem certeza de que deseja excluir este lançamento?');
  
    if (confirmDelete) {
      try {
        const response = await fetch(`/api/delete?id=${String(id)}`, {
          method: 'DELETE',
        });
  
        if (response.status === 200) {
          console.log('Lançamento excluído com sucesso!');
          // Atualizar o estado para indicar que a exclusão foi bem-sucedida
          setDeleteSuccess(true);
          // Atualizar os dados dos lançamentos após a exclusão bem-sucedida
          fetchLancamentos();
        } else {
          console.error('Erro ao excluir o lançamento');
          // Definir o estado de sucesso de exclusão como falso
          setDeleteSuccess(false);
        }
      } catch (error) {
        console.error('Erro ao excluir o lançamento', error);
        // Definir o estado de sucesso de exclusão como falso
        setDeleteSuccess(false);
      }
    }
  };
  

  return (
    <div>
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
              <td>{item.valor}</td>
              <td>{item.data}</td>
              <td>{item.area}</td>
              <td>{item.origem}</td>
              <td>{item.destino}</td>
              <td>
                <button onClick={() => handleDelete(item._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tabela;
