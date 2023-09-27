// pages/index.js
import { useState, useEffect } from 'react';

function Home() {
  const [formData, setFormData] = useState({
    tipo: '',
    descricao: '',
    valor: '',
    data: '',
    area: '',
    origem: '',
    destino: '',
  });

  const [peopleData, setPeopleData] = useState([])
  const [deleteId, setDeleteId] = useState(''); // Estado para armazenar o ID a ser excluído
  const [deleteSuccess, setDeleteSuccess] = useState(false); // Estado para acompanhar o sucesso da exclusão

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        console.log('Pessoa criada com sucesso!');
      } else {
        console.error('Erro ao criar a pessoa');
      }
    } catch (error) {
      console.error('Erro ao criar a pessoa', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/delete?id=${deleteId}`, {
        method: 'DELETE',
      });

      if (response.status === 200) {
        console.log('Pessoa excluída com sucesso!');
        // Atualizar o estado para indicar que a exclusão foi bem-sucedida
        setDeleteSuccess(true);
        // Limpar o campo de entrada do ID
        setDeleteId('');
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


  return (
    <div>
      <h1>Cadastrar Lançamento</h1>
      <form onSubmit={handleSubmit}>
        <div className="alinhamentoVertical">
          <input
            type="text"
            name="tipo"
            placeholder="Tipo"
            onChange={handleChange}
            value={formData.tipo}
          />
          <input
            type="text"
            name="descricao"
            placeholder="Descrição"
            onChange={handleChange}
            value={formData.descricao}
          />
          <input
            type="number"
            name="valor"
            placeholder="Valor"
            onChange={handleChange}
            value={formData.valor}
          />
          <input
            type="date"
            name="data"
            placeholder="Data"
            onChange={handleChange}
            value={formData.data}
          />
          <input
            type="text"
            name="area"
            placeholder="Área"
            onChange={handleChange}
            value={formData.area}
          />
          <input
            type="text"
            name="origem"
            placeholder="Origem"
            onChange={handleChange}
            value={formData.origem}
          />
          <input
            type="text"
            name="destino"
            placeholder="Destino"
            onChange={handleChange}
            value={formData.destino}
          />
        </div>
        <button type="submit">Cadastrar lançamento</button>
      </form>

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Excluir Lançamentos</h2>
        <input
          type="text"
          name="deleteId"
          placeholder="ID do Lançamento a Excluir"
          value={deleteId}
          onChange={(e) => setDeleteId(e.target.value)}
        />
        <button onClick={handleDelete}>Excluir</button>
        {deleteSuccess && <p>Pessoa excluída com sucesso!</p>}
      </div>
    </div>
  );
};

export default Home;