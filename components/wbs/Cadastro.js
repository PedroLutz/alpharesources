// components/Cadastro.js
import React, { useState, useEffect } from 'react';

const Cadastro = ({ onCadastro }) => {
  const [formData, setFormData] = useState({
    item: '',
    area: '',
  });

  const [novaArea, setNovaArea] = useState(''); // Estado para a nova área
  const [mostrarInputNovaArea, setMostrarInputNovaArea] = useState(false);
  const [isNovaAreaButton, setIsNovaAreaButton] = useState(true);
  const [elementos, setElementos] = useState([]);

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
    elementos.map((item) => console.log(item.area));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCadastrarNovaArea = () => {
    setMostrarInputNovaArea(!mostrarInputNovaArea); // Alternar exibição do input
    setIsNovaAreaButton(!isNovaAreaButton); // Alternar texto do botão
  };

  const getButtonLabel = () => {
    return isNovaAreaButton ? 'Register new area' : 'Use registered areas';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.area && novaArea) {
        alert('Preencha apenas um dos campos de área.');
        return;
      }

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
        alert("WBS element successfully registered!");

        if (typeof onCadastro === 'function') {
          onCadastro(formData);
        }
        // Chama a função de cadastro passada como prop
        // Limpa os campos após o envio do formulário
        setFormData({
            item: '',
            area: '',
        });
        fetchElementos();
      } else {
        console.error('Error when registering the breakdown element');
      }
    } catch (error) {
      console.error('Error when registering the breakdown element', error);
    }
  };

  return (
    <div className="centered-container">
      <h1>WBS Element Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="centered-container">
            <label htmlFor="area" style={{alignSelf: 'center', marginLeft: -11}}>Area</label>
            {mostrarInputNovaArea ? (
              <input
                type="text"
                id="area"
                name="area"
                style={{width:'250px'}}
                placeholder=""
                onChange={handleChange}
                value={formData.area}
                required
              />
            ) : (
              <select
                name="area"
                onChange={handleChange}
                style={{width:'264px', height: '33px'}}
                value={formData.area}
                required
              >
                <option value="" disabled>Select an area</option>
                {[...new Set(elementos.map(item => item.area))].map((area, index) => (
                  <option key={index} value={area}>{area}</option>
            ))};
              </select>
            )}
            <button
            className="botao-cadastro"
            type="button"
            onClick={handleCadastrarNovaArea}
          >
            {getButtonLabel()}
          </button>
            <label htmlFor="item" style={{alignSelf: 'center', marginLeft: -11}}>Item</label>
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
          <button className="botao-cadastro" type="submit">Register financial release</button>
        </div>
      </form>
    </div>
  );
};

export default Cadastro;
