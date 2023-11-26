import { useEffect, useState } from 'react';

const WBS = () => {
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
        const areas = {}; // Um objeto para armazenar as áreas e seus itens
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
  };

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

  const renderWBS = () => {
    return (
      <div className="wbs-container">
        {Object.keys(elementos).map((area, index) => (
          <div className="wbs-area" key={index}>
            <h3>{area}</h3>
            <div className="wbs-items">
              {elementos[area]
                .sort((a, b) => a.codigo - b.codigo)
                .map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    onClick={() => handleItemClick(item)}
                    className="wbs-item"
                  >
                    {item.item}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="centered-container" style={{marginTop: '20px'}}>
      {renderWBS()}

      {confirmDeleteItem && (
        <div className="overlay">
          <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.item}"?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="botao-cadastro" onClick={handleConfirmDelete}>
                Confirm
              </button>
              <button
                className="botao-cadastro"
                onClick={() => setConfirmDeleteItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WBS;
