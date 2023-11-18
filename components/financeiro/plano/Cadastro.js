// components/Cadastro.js
import React, { useState } from 'react';

const Cadastro = ({ onCadastro }) => {
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [formData, setFormData] = useState({
    plano: '',
    area: '',
    recurso: '', 
    tipo_a: '',
    valor_a: '',
    plano_a: '',
    data_esperada: '',
    data_limite: '',
    plano_b: '',
    tipo_b: '',
    valor_b: ''
  });

  const handleCloseModal = () => {
    setRegisterSuccess(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
          recurso: '', 
          uso: '',
          tipo_a: '',
          valor_a: '',
          plano_a: '',
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
    <div className="centered-container">
      <h1>Register Acquisition Plan</h1>
      <form onSubmit={handleSubmit}>
      <div >
          <div class="containerPai">
            <label className="container">
              <input
                type="radio"
                name="plano"
                value="Worst scenario"
                checked={formData.plano === 'Worst scenario'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Worst scenario
            </label>
            <label className="container">
              <input
                type="radio"
                name="plano"
                value="Ideal scenario"
                checked={formData.plano === 'Ideal scenario'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Ideal scenario
            </label>
          </div>
          <div className="centered-container">
          <label htmlFor="area">Area</label>
          <select
            name="area"
            onChange={handleChange}
            value={formData.area}
            required
          >
            <option value="" disabled>Select an area</option>
            <option value="3D printing">3D printing</option>
            <option value="Engineering">Engineering</option>
            <option value="Extras">Extras</option>
            <option value="Marketing">Marketing</option>
            <option value="Machining">Machining</option>
            <option value="Painting">Painting</option>
            <option value="Pit Display">Pit Display</option>
            <option value="Portfolios">Portfolios</option>
            <option value="Sponsorship">Sponsorship</option>
            <option value="Traveling">Traveling</option>
          </select>
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

          <div class="containerPai">
            <label className="container">
              <input
                type="radio"
                name="tipo_a"
                value="Service"
                checked={formData.tipo_a === 'Service'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Service
            </label>
            <label className="container">
              <input
                type="radio"
                name="tipo_a"
                value="Product"
                checked={formData.tipo_a === 'Product'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
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

          <div className='centered-container'>
          <label htmlFor="data_esperada">Expected date</label>
            <input
              type="date"
              name="data_esperada"
              onChange={handleChange}
              value={formData.data_esperada}
              required
            />
          </div>

          <div className='centered-container'>
          <label htmlFor="data_limite">Critical date</label>
            <input
              type="date"
              name="data_limite"
              onChange={handleChange}
              value={formData.data_limite}
              required
            />
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

          <div class="containerPai">
            <label className="container">
              <input
                type="radio"
                name="tipo_b"
                value="Service"
                checked={formData.tipo_b === 'Service'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Service
            </label>
            <label className="container">
              <input
                type="radio"
                name="tipo_b"
                value="Product"
                checked={formData.tipo_b === 'Product'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
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
