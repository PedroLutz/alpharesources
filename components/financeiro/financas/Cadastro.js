// components/Cadastro.js
import React, { useState } from 'react';

const Cadastro = ({ onCadastro }) => {
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [formData, setFormData] = useState({
    tipo: '',
    descricao: '',
    valor: '',
    data: '',
    area: '',
    origem: '',
    destino: '',
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
      const response = await fetch('/api/financeiro/financas/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Financial release successfully registered!');

        if (typeof onCadastro === 'function') {
          onCadastro(formData);
        }
        // Chama a função de cadastro passada como prop
        // Limpa os campos após o envio do formulário
        setFormData({
          tipo: '',
          descricao: '',
          valor: '',
          data: '',
          area: '',
          origem: '',
          destino: '',
        });

        setRegisterSuccess(true);
      } else {
        console.error('Error when registering the release');
      }
    } catch (error) {
      console.error('Error when registering the release', error);
    }
  };

  return (
    <div className="centered-container">
      <h1>Register Financial Release</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="containerPai">
            <label className="container">
              <input
                type="radio"
                name="tipo"
                value="Income"
                checked={formData.tipo === 'Income'}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
              Income
            </label>
            <label className="container">
              <input
                type="radio"
                name="tipo"
                value="Expense"
                checked={formData.tipo === 'Expense'}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
              Expense
            </label>
            <label className="container">
              <input
                type="radio"
                name="tipo"
                value="Exchange"
                checked={formData.tipo === 'Exchange'}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
              Exchange
            </label>
          </div>
          <div className="centered-container">
            <label htmlFor="descricao">Description</label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              placeholder=""
              onChange={handleChange}
              value={formData.descricao}
              required
            />
            <label htmlFor="valor">Value</label>
          <input
            type="number"
            name="valor"
            placeholder="R$420.69"
            onChange={handleChange}
            value={formData.valor}
            required
          />
          <label htmlFor="data">Date</label>
          <input
            type="date"
            name="data"
            onChange={handleChange}
            value={formData.data}
            required
          />
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
          <label htmlFor="origem">Credited Account (Origin)</label>
          <input
            type="text"
            name="origem"
            placeholder=""
            onChange={handleChange}
            value={formData.origem}
            required
          />
          <label htmlFor="destino">Debited Account (Destiny)</label>
          <input
            type="text"
            name="destino"
            placeholder=""
            onChange={handleChange}
            value={formData.destino}
            required
          />
          </div>
        </div>
        <div>
          <button className="botao-cadastro" type="submit">Register financial release</button>
        </div>
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
