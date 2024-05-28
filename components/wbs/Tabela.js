import { useEffect, useState } from 'react';
import styles from '../../styles/modules/wbs.module.css';
import Loading from '../Loading';
import { fetchData , handleUpdate } from '../../functions/crud';

const WBS = () => {
  const [elementosPorArea, setElementosPorArea] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [actionChoice, setActionChoice] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const fetchElementos = async () => {
    try {
      const data = await fetchData('wbs/get');
      const areas = {};
      data.elementos.forEach((elemento) => {
        if (!areas[elemento.area]) {
          areas[elemento.area] = [];
        }
        areas[elemento.area].push(elemento);
      });
      setElementos(data.elementos);
      setElementosPorArea(areas);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      handleDelete({
        route: 'wbs',
        item: confirmDeleteItem,
        fetchDados: fetchElementos
      });
    }
    setConfirmDeleteItem(null);
  };

  useEffect(() => {
    fetchElementos();
  }, []);

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      const updatedItem = { _id: confirmUpdateItem._id, ...formData };
      const updatedElementos = elementos.map(item =>
        item._id === updatedItem._id ? { ...updatedItem } : item
      );

      setElementos(updatedElementos);
      setConfirmUpdateItem(null);
      try {
        await handleUpdate({
          route: 'wbs',
          dados: updatedItem,
          item: confirmUpdateItem
        });
      } catch (error) {
        setElementos(elementos);
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Update failed:", error);
      }
    }
  };

  const renderWBS = () => {
    const areasPorLinha = 4;
    const gruposDeAreas = Object.keys(elementosPorArea).reduce((grupos, area, index) => {
      const grupoIndex = Math.floor(index / areasPorLinha);
      if (!grupos[grupoIndex]) {
        grupos[grupoIndex] = [];
      }
      grupos[grupoIndex].push({ area, elementos: elementosPorArea[area] });
      return grupos;
    }, []);

    return (
      <div>
        {gruposDeAreas.map((grupo, index) => (
          <div className={styles.wbsContainer} key={index}>
            {grupo.map(({ area, elementos }) => (
              <div className={styles.wbsArea} key={area}>
                <h3>{area}</h3>
                <div className={styles.wbsItems}>
                  {elementos
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
        ))}
      </div>
    );
  };

  return (
    <div className="centered-container" style={{ marginTop: '20px' }}>
      {loading && <Loading />}
      {renderWBS()}

      {confirmUpdateItem && (
        <div className="overlay">
          <div className="modal" style={{ width: '20%' }}>
            <div className="centered-container">
              <label htmlFor="area" style={{ alignSelf: 'center', textAlign: 'center', marginLeft: -11 }}>Area</label>
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
              <label htmlFor="item" style={{ alignSelf: 'center', textAlign: 'center', marginLeft: -11 }}>Item</label>
              <input
                type="text"
                id="item"
                name="item"
                placeholder=""
                style={{ width: '250px' }}
                onChange={handleChange}
                value={formData.item}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="botao-cadastro" onClick={handleUpdateItem}>Update</button>
              <button className="botao-cadastro" onClick={() => setConfirmUpdateItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {actionChoice && (
        <div className="overlay">
          <div className="modal">
            <p>What do you wish to do?</p>
            <div className="mesma-linha">
              <button type="button" className="botao-cadastro" style={{ width: '150px' }}
                onClick={() => {
                  handleUpdateClick(actionChoice); setActionChoice(null)
                }}>Update item</button>
              <button type="button" className="botao-cadastro" style={{ width: '150px' }}
                onClick={() => {
                  setConfirmDeleteItem(actionChoice); setActionChoice(null)
                }}>Delete item</button>
            </div>
            <button type="button" className="botao-cadastro" style={{ width: '150px' }}
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