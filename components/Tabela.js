// components/Tabela.js
import React, { useEffect, useState } from 'react';

const Tabela = () => {
  const [peopleData, setPeopleData] = useState([]);
  const [deleteId, setDeleteId] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Função para buscar os dados das pessoas quando a página é carregada
  const fetchPeopleData = async () => {
    try {
      const response = await fetch('/api/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setPeopleData(data);
      } else {
        console.error('Erro ao buscar dados das pessoas');
      }
    } catch (error) {
      console.error('Erro ao buscar dados das pessoas', error);
    }
  };

  useEffect(() => {
    // Chame a função para buscar os dados das pessoas quando a página é carregada
    fetchPeopleData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/delete?id=${String(id)}`, {
        method: 'DELETE',
      });

      if (response.status === 200) {
        console.log('Pessoa excluída com sucesso!');
        // Atualizar o estado para indicar que a exclusão foi bem-sucedida
        setDeleteSuccess(true);
        // Atualizar os dados das pessoas após a exclusão bem-sucedida
        fetchPeopleData();
      } else {
        console.error('Erro ao excluir a pessoa');
        // Definir o estado de sucesso de exclusão como falso
        setDeleteSuccess(false);
      }
    } catch (error) {
      console.error('Erro ao excluir a pessoa', error);
      // Definir o estado de sucesso de exclusão como falso
      setDeleteSuccess(false);
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
          {peopleData.map((item, index) => (
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
