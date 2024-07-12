import React, { useEffect, useState } from 'react';
import styles from '../../styles/modules/wbs.module.css';
import Loading from '../Loading';
import { fetchData, handleUpdate, handleDelete, handleSubmit } from '../../functions/crud';
import Modal from '../Modal';
import BlocoInputs from './BlocoInputs';
import { cleanForm } from '../../functions/general';

const WBS = () => {
  const [elementosPorArea, setElementosPorArea] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [verOpcoes, setVerOpcoes] = useState(false);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [actionChoice, setActionChoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const camposVazios = {
    item: '',
    area: '',
  }
  const [novoSubmit, setNovoSubmit] = useState(camposVazios)
  const [novosDados, setNovosDados] = useState(camposVazios);

  const handleChange = (e) => {
    setNovosDados({
      ...novosDados,
      [e.target.name]: e.target.value,
    });
  };

  const enviar = async (e) => {
    e.preventDefault();
    handleSubmit({
      route: 'wbs',
      dados: novoSubmit,
    });
    cleanForm(novoSubmit, setNovoSubmit);
  };

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    setNovosDados({
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
      const updatedItem = { _id: confirmUpdateItem._id, ...novosDados };
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
      var grupoIndex;
      if(verOpcoes){
        if(index < 3){
          grupoIndex = 0;
        } else {
          grupoIndex = Math.floor((index - 3) / areasPorLinha) + 1;
        }
      } else {
        grupoIndex = Math.floor((index) / areasPorLinha);
      }
      
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
            {(index == 0 && verOpcoes) && <BlocoInputs obj={novoSubmit} objSetter={setNovoSubmit} funcao={enviar}/>}
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
                    {/* {verOpcoes && <BlocoInputs tipo='update'/>} */}
                    
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
      <button onClick={() => setVerOpcoes(!verOpcoes)}>Bucetoide</button>
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
                  value={novosDados.area}
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
                value={novosDados.item}
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
        <Modal objeto={{
          titulo: 'What do you wish to do?',
          botao1: {
            funcao: () => { handleUpdateClick(actionChoice); setActionChoice(null) }, texto: 'Update item'
          },
          botao2: {
            funcao: () => { setConfirmDeleteItem(actionChoice); setActionChoice(null) }, texto: 'Delete item'
          },
          botao3: {
            funcao: () => setActionChoice(null), texto: 'Cancel'
          }
        }} />
      )}

      {confirmDeleteItem && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${confirmDeleteItem.item}"?`,
          botao1: {
            funcao: handleConfirmDelete, texto: 'Confirm'
          },
          botao2: {
            funcao: () => () => setConfirmDeleteItem(null), texto: 'Cancel'
          },
        }} />
      )}
    </div>
  );
};

export default WBS;