// components/Cadastro.js
import React, { useState, useEffect, Suspense } from 'react';

const Cadastro = () => {
  const [formData, setFormData] = useState({
    item: '',
    area: '',
  });

  const [mostrarInputNovaArea, setMostrarInputNovaArea] = useState(false);
  const [isNovaAreaButton, setIsNovaAreaButton] = useState(true);
  const [elementos, setElementos] = useState([]);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const fetchElementos = async () => {
    try {
      const response = await fetch('/api/wbs/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setElementos(data.elementos);

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

  const handleCloseModal = () => {
    setRegisterSuccess(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCadastrarNovaArea = () => {
    setMostrarInputNovaArea(!mostrarInputNovaArea); // Alternar exibição do input
    setIsNovaAreaButton(!isNovaAreaButton); // Alternar texto do botão

    setFormData({
      ...formData,
      area: '',
    });
  };

  const getButtonLabel = () => {
    return isNovaAreaButton ? 'Register new area' : 'Use registered areas';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/wbs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('WBS element successfully registered!');

        setFormData({
            item: '',
            area: '',
        });
        fetchElementos();
        setRegisterSuccess(true);
      } else {
        console.error('Error when registering the breakdown element');
      }
    } catch (error) {
      console.error('Error when registering the breakdown element', error);
    }
  };

  const Modal = () => (
    <div className="overlay">
      <div className="modal">
        <p>{registerSuccess ? 'Register successful!' : 'Register failed.'}</p>
        <button className="botao-cadastro" onClick={handleCloseModal}>Close</button>
      </div>
    </div>
  );
  
  return (
    <div className="centered-container">
      <h1>Work Breakdown Structure</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="centered-container">
            <label htmlFor="area" style={{alignSelf: 'center', textAlign: 'center', marginLeft: -11}}>Area</label>
            <div className="mini-input">
            {mostrarInputNovaArea ? (
              <input
                className='mini-input'
                type="text"
                id="area"
                name="area"
                placeholder=""
                onChange={handleChange}
                value={formData.area}
                required
              />
            ) : (
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
            )}
            </div>
            
            <button
            className="botao-cadastro"
            type="button"
            onClick={handleCadastrarNovaArea}
          >
            {getButtonLabel()}
          </button>
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
          
        </div>
        <div>
          <button className="botao-cadastro" type="submit">Register WBS element</button>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          {registerSuccess && <Modal />}
        </Suspense>
      </form>
    </div>
  );
};

export default Cadastro;
