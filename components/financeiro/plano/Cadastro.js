// components/Cadastro.js
import React, { useState , useEffect } from 'react';
import styles from '../../../styles/modules/radio.module.css';

const Cadastro = ({ onCadastro }) => {
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [elementosWBS, setElementosWBS] = useState([]);
  const [itensPorArea, setItensPorArea] = useState([]);
  const [viewUsage, setViewUsage] = useState(true);
  const [formData, setFormData] = useState({
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
  });

  const handleCloseModal = () => {
    setRegisterSuccess(false);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
    }
  };

  useEffect(() => {
    fetchElementos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/financeiro/plano/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        if (typeof onCadastro === 'function') {
          onCadastro(formData);
        }
        // Chama a função de cadastro passada como prop
        // Limpa os campos após o envio do formulário
        setFormData({
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
        console.log('Plan successfully registered!');
        setRegisterSuccess(true);
      } else {
        console.error('Error in registering the plan');
      }
    } catch (error) {
      console.error('Error in registering the plan', error);
    }
  };

  return (
    <div className="centered-container financeiro">
      <h2>Register Acquisition Plan</h2>
      <form onSubmit={handleSubmit}>
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
            <label  className={styles.container}>
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
          
          <div className="input-data" style={{width: '100%'}}>
            <button type='button'
            style={{width: '16rem'}}
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
          ):(
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
        <button className="botao-cadastro" type="submit">Register acquisition plan</button>
      </form>

      {registerSuccess && (
        <div className="overlay">
          <div className="modal">
            <p>{registerSuccess ? 'Register successful!' : 'Register failed.'}</p>
            <button className="botao-cadastro" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cadastro;
