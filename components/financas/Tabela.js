import React, { useEffect, useState } from 'react';

const formatDate = (dateString) => {
  // Converte a data da string para um objeto de data
  const date = new Date(dateString);

  // Adiciona um dia à data
  date.setDate(date.getDate() + 1);

  // Formata a data
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formattedDate;
};

const Tabela = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchLancamentos = async () => {
    try {
      const response = await fetch('/api/financeiro/financas/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        data.lancamentos.forEach((item) => {
          item.data = formatDate(item.data);
        });
        setLancamentos(data.lancamentos);
      } else {
        console.error('Error in searching for financal releases data');
      }
    } catch (error) {
      console.error('Error in searching for financal releases data', error);
    }
  };

  useEffect(() => {
    fetchLancamentos();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this release?');

    if (confirmDelete) {
      try {
        const response = await fetch(`/api/financeiro/financas/delete?id=${String(id)}`, {
          method: 'DELETE',
        });

        if (response.status === 200) {
          console.log('Release deleted successfully!');
          alert("Release deleted successfully!");
          setDeleteSuccess(true);
          fetchLancamentos();
        } else {
          console.error('Error in deleting the release');
          setDeleteSuccess(false);
        }
      } catch (error) {
        console.error('Error in deleting the release', error);
        setDeleteSuccess(false);
      }
    }
  };

  const handleUpdate = async (id) => {
    let newValue = prompt('Insert the new value:');
    if (newValue < 0){
      alert("Insert a value bigger than zero!");
    } else if (newValue !== null) {

      const tipo = lancamentos.find(item => item._id === id)?.tipo;

      if (tipo === 'Cost') {
        newValue = -Math.abs(newValue); // Torna o valor negativo
      } else if (tipo === 'Revenue') {
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
          console.log('Release updated successfully!');
          alert("Release updated successfully!");
          fetchLancamentos();
        } else {
          console.error('Error in updating release');
        }
      } catch (error) {
        console.error('Error in updating release', error);
      }
    }
  };

  return (
    <div className="centered-container">
      <h2>Financial Releases Data</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Value</th>
            <th>Date</th>
            <th>Area</th>
            <th>Origin</th>
            <th>Destiny</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map((item, index) => (
            <tr key={index}>
              <td>{item.tipo}</td>
              <td>{item.descricao}</td>
              <td style={{ color: item.tipo === 'Receita' ? 'green' : 'red' }}>
                <b>R${Math.abs(item.valor)}</b>
              </td>
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
