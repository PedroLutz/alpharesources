import React, { useEffect, useState } from 'react';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Tabela = () => {
  const [planos, setPlanos] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchPlanos = async () => {
    try {
      const response = await fetch('/api/plano/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        data.planos.forEach((item) => {
          item.data_esperada = formatDate(item.data_esperada);
          item.data_limite = formatDate(item.data_limite);
        });
        setPlanos(data.planos);
      } else {
        console.error('Erro ao buscar dados dos planos');
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos planos', error);
    }
  };

  useEffect(() => {
    fetchPlanos();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Tem certeza de que deseja excluir este plano?');

    if (confirmDelete) {
      try {
        const response = await fetch(`/api/plano/delete?id=${String(id)}`, {
          method: 'DELETE',
        });

        if (response.status === 200) {
          console.log('Plano excluído com sucesso!');
          setDeleteSuccess(true);
          fetchPlanos();
        } else {
          console.error('Erro ao excluir o plano');
          setDeleteSuccess(false);
        }
      } catch (error) {
        console.error('Erro ao excluir o plano', error);
        setDeleteSuccess(false);
      }
    }
  };

  return (
    <div>
      <h2>Dados dos Recursos Planejados</h2>
      <table>
        <thead>
          <tr>
            <th>Plano</th>
            <th>Área</th>
            <th>Recurso</th>
            <th>Tipo A</th>
            <th>Valor A</th>
            <th>Plano A</th>
            <th>Data Esperada</th>
            <th>Data Limite</th>
            <th>Plano B</th>
            <th>Tipo B</th>
            <th>Valor B</th>
            <th>Opções</th>
          </tr>
        </thead>
        <tbody>
          {planos.map((item, index) => (
            <tr key={index}>
              <td>{item.plano}</td>
              <td>{item.area}</td>
              <td>{item.recurso}</td>
              <td>{item.tipo_a}</td>
              <td>{item.valor_a}</td>
              <td>{item.plano_a}</td>
              <td>{item.data_esperada}</td>
              <td>{item.data_limite}</td>
              <td>{item.plano_b}</td>
              <td>{item.tipo_b}</td>
              <td>{item.valor_b}</td>
              <td style={{width: '75px'}}>
                <div className="botoes-acoes">
                  <button style={{color: 'red'}} onClick={() => handleDelete(item._id)}>X</button>
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
