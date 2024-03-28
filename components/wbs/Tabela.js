import { useEffect, useState } from 'react';
import styles from '../../styles/modules/wbs.module.css';

const WBS = () => {
  const [elementosPorArea, setElementosPorArea] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [actionChoice, setActionChoice] = useState(null);
  const [formData, setFormData] = useState({
    item: '',
    area: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    setFormData({
      item: item.item,
      area: item.area
    });
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
        setElementos(data.elementos);
        setElementosPorArea(areas);
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
          console.log(data.message); 
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

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      const { item, area } = formData;

      try {
        const response = await fetch(`/api/wbs/update?id=${String(confirmUpdateItem._id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ item, area }),
        });

        if (response.status === 200) {
          console.log('Release updated successfully!');
          fetchElementos();
        } else {
          console.error('Error in updating release');
        }
      } catch (error) {
        console.error('Error in updating release', error);
      }
    }
    setConfirmUpdateItem(null);
    setFormData({
      item: '',
      area: '',
    })
  };

  const renderWBS = () => {
    return (
      <div className={styles.wbsContainer}>
        {Object.keys(elementosPorArea).map((area, index) => (
          <div className={styles.wbsArea} key={index}>
            <h3>{area}</h3>
            <div className={styles.wbsItems}>
              {elementosPorArea[area]
                .sort((a, b) => a.codigo - b.codigo)
                .map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    onClick={() => setActionChoice(item)}
                    className={styles.wbsItem}
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

      {confirmUpdateItem && (
        <div className="overlay">
          <div className="modal">
        <div className="centered-container">
          <label htmlFor="area" style={{alignSelf: 'center', textAlign: 'center', marginLeft: -11}}>Area</label>
          <div className="mini-input">
          <select
                className='mini-input'
                name="area"
                onChange={handleChange}
                value={formData.area}
                required
              >
                <option value="" disabled>Select an area</option>
                {[...new Set(elementos.map(item => item.area))].map((area, index) => (
                  <option key={index} value={area}>{area}</option>
            ))};
              </select>
          </div>
          <label htmlFor="item" style={{alignSelf: 'center', textAlign: 'center', marginLeft: -11}}>Item</label>
          <input
              type="text"
              id="item"
              name="item"
              placeholder=""
              style={{width:'400px'}}
              onChange={handleChange}
              value={formData.item}
              required
            />
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
              <button className="botao-cadastro" onClick={handleUpdateItem}>Update</button>
              <button className="botao-cadastro" onClick={() => setConfirmUpdateItem(null)}>Cancel</button>
            </div>
        </div>
      </div>
      )}

      {actionChoice &&(
        <div className="overlay">
          <div className="modal">
            <p>What do you wish to do?</p>
            <div className="mesma-linha">
              <button type="button" className="botao-cadastro" style={{width: '150px'}}
              onClick={() => {
                handleUpdateClick(actionChoice); setActionChoice(null)
              }}>Update item</button>
              <button type="button" className="botao-cadastro" style={{width: '150px'}}
              onClick={() => {
                setConfirmDeleteItem(actionChoice); setActionChoice(null)
              }}>Delete item</button>
            </div>
            <button type="button" className="botao-cadastro" style={{width: '150px'}}
              onClick={() => {
                setActionChoice(null)
              }}>Cancel</button>
          </div>
        </div>
      )}

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
