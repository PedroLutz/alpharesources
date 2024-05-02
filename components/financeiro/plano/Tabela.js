import React, { useEffect, useState } from 'react';
import styles from '../../../styles/modules/radio.module.css';
import Loading from '../../Loading';

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
  const [planos, setPlanos] = useState([]);
  const [elementosWBS, setElementosWBS] = useState([]);
  const [itensPorArea, setItensPorArea] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [viewIdeal, setViewIdeal] = useState(true);
  const [viewUsage, setViewUsage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    plano: '',
    area: '',
    item: '',
    recurso: '',
    uso: '',
    tipo_a: '',
    valor_a: '',
    plano_a: '',
    data_inicial: '',
    data_esperada: '',
    data_limite: '',
    plano_b: '',
    tipo_b: '',
    valor_b: ''
  });

  const fetchElementos = async () => {
    try {
      const response = await fetch('/api/wbs/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setElementosWBS(data.elementos);

      } else {
        console.error('Error in searching for financal releases data');
      }
    } catch (error) {
      console.error('Error in searching for financal releases data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (e) => {
    const areaSelecionada = e.target.value;
    const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
    setItensPorArea(itensDaArea);

    // Atualiza o estado formData para refletir a nova área selecionada
    setFormData({
      ...formData,
      area: areaSelecionada,
      item: '', // Limpa o campo de itens quando a área é alterada
    });
  };

  const handleClick = (item) => {
    setConfirmDeleteItem(item);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateClick = (item) => {
    const fixDate = (data) => {
      const parts = data.split('/');
      const itemDate = new Date(parts[2], parts[1] - 1, parts[0]);
      return itemDate.toISOString().split('T')[0];
    }

    setConfirmUpdateItem(item);
    setFormData({
      plano: item.plano,
      area: item.area,
      item: item.item,
      recurso: item.recurso,
      uso: item.uso,
      tipo_a: item.tipo_a,
      valor_a: item.valor_a,
      plano_a: item.plano_a,
      data_inicial: fixDate(item.data_inicial),
      data_esperada: fixDate(item.data_esperada),
      data_limite: fixDate(item.data_limite),
      plano_b: item.plano_b,
      tipo_b: item.tipo_b,
      valor_b: item.valor_b
    });
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();

    if (confirmUpdateItem) {
      const { plano, area, item, recurso, uso, tipo_a, valor_a, plano_a, data_inicial, data_esperada, data_limite, plano_b, tipo_b, valor_b } = formData;

      try {
        const response = await fetch(`/api/financeiro/plano/update?id=${String(confirmUpdateItem._id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plano, area, item, recurso, uso, tipo_a, valor_a, plano_a, data_inicial, data_esperada, data_limite, plano_b, tipo_b, valor_b }),
        });

        if (response.status === 200) {
          console.log('Release updated successfully!');
          fetchPlanos();
        } else {
          console.error('Error in updating release');
        }
      } catch (error) {
        console.error('Error in updating release', error);
      }
    }
    setConfirmUpdateItem(null);
    setFormData({
      plano: '',
      area: '',
      item: '',
      recurso: '',
      tipo_a: '',
      valor_a: '',
      plano_a: '',
      data_inicial: '',
      data_esperada: '',
      data_limite: '',
      plano_b: '',
      tipo_b: '',
      valor_b: ''
    })
  };

  const handleCloseModal = () => {
    setDeleteSuccess(false);
  };

  const fetchPlanos = async () => {
    try {
      const response = await fetch('/api/financeiro/plano/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        data.planos.forEach((item) => {
          item.data_inicial = formatDate(item.data_inicial);
          item.data_esperada = formatDate(item.data_esperada);
          item.data_limite = formatDate(item.data_limite);
        });
        setPlanos(data.planos);
      } else {
        console.error('Error in getting plan data');
      }
    } catch (error) {
      console.error('Error in getting plan data', error);
    }
  };

  const updateInputItem = (areaSelecionadaDp) => {
    const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionadaDp).map(item => item.item);
    setItensPorArea(itensDaArea);

    // Verifica se o item selecionado ainda pertence à nova lista de itens
    const novoItemSelecionado = itensDaArea.includes(formData.item) ? formData.item : '';

    // Atualiza o estado formData para refletir a nova área selecionada
    setFormData(prevState => ({
      ...prevState,
      area: areaSelecionadaDp,
      item: novoItemSelecionado,
    }));
  };

  useEffect(() => {
    fetchPlanos();
    fetchElementos();
    if (formData.area) {
      updateInputItem(formData.area);
    }
  }, [formData.area]);

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      fetch(`/api/financeiro/plano/delete?id=${confirmDeleteItem._id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message); // Exibir uma mensagem de sucesso
          // Atualize os dados na tabela após a exclusão
          // Você pode recarregar a página ou atualizar os dados de outra forma
          fetchPlanos();
          setDeleteSuccess(true);
        })
        .catch((error) => {
          console.error('Erro ao excluir elemento', error);
        });
    }
    setConfirmDeleteItem(null);
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Resource Acquisition Plan</h2>
      <button type="button" className="botao-cadastro" onClick={() => setViewIdeal(!viewIdeal)}>
        {viewIdeal ?
          ('See Essential Scenario'
          ) : (
            'See Ideal Scenario')}
      </button>
      <div className="centered-container">
        {viewIdeal ? (
          <div>
            <h3>Ideal Scenario</h3>
            <div className="centered-container">
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Item</th>
                    <th>Resource</th>
                    <th>Use</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {planos
                    .filter(item => item.plano === "Ideal scenario")
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.area || '-'}</td>
                        <td>{item.item || '-'}</td>
                        <td>{item.recurso || '-'}</td>
                        <td>{item.uso || '-'}</td>
                        <td style={{ width: '75px' }}>
                          <div className="botoes-acoes">
                            <button style={{ color: 'red' }} onClick={() => handleClick(item)}>❌</button>
                            <button onClick={() => handleUpdateClick(item)}>⚙️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="centered-container" style={{ marginTop: '50px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Plan A</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Starting date</th>
                    <th>Expected date</th>
                    <th>Critical date</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {planos.filter(item => item.plano === "Ideal scenario").map((item, index) => (
                    <tr key={index}>
                      <td>{item.recurso || '-'}</td>
                      <td>{item.plano_a || '-'}</td>
                      <td>{item.tipo_a || '-'}</td>
                      <td>{`R$${item.valor_a}` || '-'}</td>
                      <td>{item.data_inicial || '-'}</td>
                      <td>{item.data_esperada || '-'}</td>
                      <td>{item.data_limite || '-'}</td>
                      <td style={{ width: '75px' }}>
                        <div className="botoes-acoes">
                          <button style={{ color: 'red' }} onClick={() => handleClick(item)}>❌</button>
                          <button onClick={() => handleUpdateClick(item)}>⚙️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="centered-container" style={{ marginTop: '50px' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Plan B</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {planos.
                    filter(item => item.plano === "Ideal scenario")
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.recurso || '-'}</td>
                        <td>{item.plano_b || '-'}</td>
                        <td>{item.tipo_b || '-'}</td>
                        <td>{`R$${item.valor_b}` || '-'}</td>
                        <td style={{ width: '75px' }}>
                          <div className="botoes-acoes">
                            <button style={{ color: 'red' }} onClick={() => handleClick(item)}>❌</button>
                            <button onClick={() => handleUpdateClick(item)}>⚙️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className='centered-container'>
              <h3>Essential Scenario</h3>
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Item</th>
                    <th>Resource</th>
                    <th>Use</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {planos
                    .filter(item => item.plano === "Worst scenario")
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.area || '-'}</td>
                        <td>{item.item || '-'}</td>
                        <td>{item.recurso || '-'}</td>
                        <td>{item.uso || '-'}</td>
                        <td style={{ width: '75px' }}>
                          <div className="botoes-acoes">
                            <button onClick={() => handleClick(item)}>❌</button>
                            <button onClick={() => handleUpdateClick(item)}>⚙️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="centered-container" style={{ marginTop: '50px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Plan A</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Starting date</th>
                    <th>Expected date</th>
                    <th>Critical date</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {planos.filter(item => item.plano === "Worst scenario").map((item, index) => (
                    <tr key={index}>
                      <td>{item.recurso || '-'}</td>
                      <td>{item.plano_a || '-'}</td>
                      <td>{item.tipo_a || '-'}</td>
                      <td>{`R$${item.valor_a}` || '-'}</td>
                      <td>{item.data_inicial || '-'}</td>
                      <td>{item.data_esperada || '-'}</td>
                      <td>{item.data_limite || '-'}</td>
                      <td style={{ width: '75px' }}>
                        <div className="botoes-acoes">
                          <button onClick={() => handleClick(item)}>❌</button>
                          <button onClick={() => handleUpdateClick(item)}>⚙️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="centered-container" style={{ marginTop: '50px' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Plan B</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {planos.
                    filter(item => item.plano === "Worst scenario")
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.recurso || '-'}</td>
                        <td>{item.plano_b || '-'}</td>
                        <td>{item.tipo_b || '-'}</td>
                        <td>{`R$${item.valor_b}` || '-'}</td>
                        <td style={{ width: '75px' }}>
                          <div className="botoes-acoes">
                            <button onClick={() => handleClick(item)}>❌</button>
                            <button onClick={() => handleUpdateClick(item)}>⚙️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="centered-container">
        {confirmDeleteItem && (
          <div className="overlay">
            <div className="modal">
              <p>Are you sure you want to delete the plan for "{confirmDeleteItem.recurso}"?</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="botao-cadastro" onClick={handleConfirmDelete}>Confirm</button>
                <button className="botao-cadastro" onClick={() => setConfirmDeleteItem(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {deleteSuccess && (
          <div className="overlay">
            <div className="modal">
              <p>{deleteSuccess ? 'Deletion successful!' : 'Deletion failed.'}</p>
              <button className="botao-cadastro" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        )}

        {confirmUpdateItem && (
          <div className="overlay">
            <div className="modal">
              <div className="centered-container financeiro">
                <form onSubmit={handleUpdateItem}>
                  <div >
                    <div className={styles.containerPai}>
                      <label className={styles.container}>
                        <input
                          type="radio"
                          name="plano"
                          value="Worst scenario"
                          checked={formData.plano === 'Worst scenario'}
                          onChange={handleChange}
                          required
                        />
                        <span className={styles.checkmark}></span>
                        Essential scenario
                      </label>
                      <label className={styles.container}>
                        <input
                          type="radio"
                          name="plano"
                          value="Ideal scenario"
                          checked={formData.plano === 'Ideal scenario'}
                          onChange={handleChange}
                          required
                        />
                        <span className={styles.checkmark}></span>
                        Ideal scenario
                      </label>
                    </div>

                    <div className='centered-container'>
                      <label htmlFor="recurso">Resource</label>
                      <input
                        type="text"
                        name="recurso"
                        placeholder=""
                        onChange={handleChange}
                        value={formData.recurso}
                        required
                      />
                    </div>

                    <div className="input-data" style={{ width: '100%' }}>
                      <button type='button'
                        style={{ width: '16rem' }}
                        onClick={() => setViewUsage(!viewUsage)}>
                        {viewUsage ?
                          ('Change to Acquisition Planning'
                          ) : (
                            'Change to Usage Planning')}
                      </button>
                    </div>

                    {viewUsage ? (
                      <div>
                        <div className="centered-container">
                          <label htmlFor="area">Area</label>
                          <select
                            name="area"
                            onChange={handleAreaChange}
                            value={formData.area}
                            required
                          >
                            <option value="" disabled>Select an area</option>
                            {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                              <option key={index} value={area}>{area}</option>
                            ))};
                          </select>
                        </div>

                        <div className="centered-container">
                          <label htmlFor="item">Item</label>
                          <select
                            name="item"
                            onChange={handleChange}
                            value={formData.item}
                            required
                          >
                            <option value="" disabled>Select an item</option>
                            {itensPorArea.map((item, index) => (
                              <option key={index} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>

                        <div className='centered-container'>
                          <label htmlFor="uso">Use</label>
                          <input
                            type="text"
                            name="uso"
                            placeholder=""
                            onChange={handleChange}
                            value={formData.uso}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className='centered-container'>
                          <label htmlFor="plano_a">Plan A</label>
                          <input
                            type="text"
                            name="plano_a"
                            onChange={handleChange}
                            value={formData.plano_a}
                            required
                          />
                        </div>

                        <div className={styles.containerPai}>
                          <label className={styles.container}>
                            <input
                              type="radio"
                              name="tipo_a"
                              value="Service"
                              checked={formData.tipo_a === 'Service'}
                              onChange={handleChange}
                              required
                            />
                            <span className={styles.checkmark}></span>
                            Service
                          </label>
                          <label className={styles.container}>
                            <input
                              type="radio"
                              name="tipo_a"
                              value="Product"
                              checked={formData.tipo_a === 'Product'}
                              onChange={handleChange}
                              required
                            />
                            <span className={styles.checkmark}></span>
                            Product
                          </label>
                        </div>

                        <div className='centered-container'>
                          <label htmlFor="valor_a">Value</label>
                          <input
                            type="number"
                            name="valor_a"
                            onChange={handleChange}
                            value={formData.valor_a}
                            required
                          />
                        </div>

                        <div className="container-inputs-pequenins">
                          <div className='centered-container input-pequenin'>
                            <label htmlFor="data_inicial">Starting date</label>
                            <input
                              className="input-pequenin"
                              type="date"
                              name="data_inicial"
                              onChange={handleChange}
                              value={formData.data_inicial}
                              required
                            />
                          </div>

                          <div className='centered-container input-pequenin'>
                            <label htmlFor="data_esperada">Expected date</label>
                            <input
                              type="date"
                              name="data_esperada"
                              onChange={handleChange}
                              value={formData.data_esperada}
                              required
                            />
                          </div>

                          <div className='centered-container input-pequenin'>
                            <label htmlFor="data_limite">Critical date</label>
                            <input
                              type="date"
                              name="data_limite"
                              onChange={handleChange}
                              value={formData.data_limite}
                              required
                            />
                          </div>
                        </div>


                        <div className='centered-container'>
                          <label htmlFor="plano_b">Plan B</label>
                          <input
                            type="text"
                            name="plano_b"
                            onChange={handleChange}
                            value={formData.plano_b}
                            required
                          />
                        </div>

                        <div className={styles.containerPai}>
                          <label className={styles.container}>
                            <input
                              type="radio"
                              name="tipo_b"
                              value="Service"
                              checked={formData.tipo_b === 'Service'}
                              onChange={handleChange}
                              required
                            />
                            <span className={styles.checkmark}></span>
                            Service
                          </label>
                          <label className={styles.container}>
                            <input
                              type="radio"
                              name="tipo_b"
                              value="Product"
                              checked={formData.tipo_b === 'Product'}
                              onChange={handleChange}
                              required
                            />
                            <span className={styles.checkmark}></span>
                            Product
                          </label>
                        </div>

                        <div className='centered-container'>
                          <label htmlFor="valor_b">Value</label>
                          <input
                            type="number"
                            name="valor_b"
                            onChange={handleChange}
                            value={formData.valor_b}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="botao-cadastro" type="submit">Update</button>
                  <button className="botao-cadastro" type="button" onClick={() => setConfirmUpdateItem(null)}>Cancel</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabela;
