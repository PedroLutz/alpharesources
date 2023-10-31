// pages/wbs.js

import { useEffect, useState } from 'react';

const Tabela = () => {
  const [elementos, setElementos] = useState([]);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

  const handleItemClick = (item) => {
    setConfirmDeleteItem(item);
  };

  const fetchElementos = () => {
    // Fazer uma solicitação à rota "api/wbs/get" para obter os dados
    fetch('/api/wbs/get')
      .then((response) => response.json())
      .then((data) => {
        // Organizar os dados da maneira desejada
        const areas = {}; // Um objeto para armazenar as áreas e seus items
        data.elementos.forEach((elemento) => {
          if (!areas[elemento.area]) {
            areas[elemento.area] = [];
          }
          areas[elemento.area].push(elemento);
        });
        setElementos(areas);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados da API', error);
      });
  }

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      fetch(`/api/wbs/delete?id=${confirmDeleteItem._id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message); // Exibir uma mensagem de sucesso
          // Atualize os dados na tabela após a exclusão
          // Você pode recarregar a página ou atualizar os dados de outra forma
          fetchElementos();
        })
        .catch((error) => {
          console.error('Erro ao excluir elemento', error);
        });
    }
    setConfirmDeleteItem(null);
  };

  useEffect(() => {
    fetchElementos();
  }, []);

  return (
    <div className="centered-container">
      <h2>Work Breakdown Structure</h2>
      <table>
        <thead>
          <tr>
            <th>Áreas</th>
            {Object.keys(elementos).map((area, index) => (
              <th key={index}>{area}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Itens</td>
            {Object.keys(elementos).map((area, index) => (
              <td key={index}>
                <ol>
                  {elementos[area]
                    .sort((a, b) => a.codigo - b.codigo)
                    .map((item, itemIndex) => (
                        <li
                        key={itemIndex}
                        onClick={() => handleItemClick(item)}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.item}
                      </li>
                    ))}
                </ol>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      
      {confirmDeleteItem && (
        <div className="overlay">
            <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.item}"?</p>
                <div style={{display: 'flex', gap: '10px'}}>
                    <button className="botao-cadastro" onClick={handleConfirmDelete}>Confirm</button>
                    <button className="botao-cadastro" onClick={() => setConfirmDeleteItem(null)}>Cancel</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Tabela;
