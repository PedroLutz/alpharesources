// components/Cadastro.js
import React, { useState } from 'react';

const Cadastro = ({ onCadastro }) => {
    //estado para gerar o modal de sucesso
    const [registerSuccess, setRegisterSuccess] = useState(false);
    //estado para controlar os dados dos inputs
    const [formData, setFormData] = useState({
      tipo: '',
      descricao: '',
      valor: '',
      data: '',
      area: '',
      origem: '',
      destino: '',
    });

  //função para fechar o modal de sucesso
  const handleCloseModal = () => {
    setRegisterSuccess(false);
  };

  //função para atualizar os dados dos inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //função para chamar o dia de hoje
  const handleSetDataHoje = (inputName) => {
    const today = new Date();
    const formattedDate = today.toLocaleString('en-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}).split(',')[0];
  
    setFormData((formData) => ({
      ...formData,
      [inputName]: formattedDate,
    }));
  };

  //função para cadastrar os dados
  const handleSubmit = async (e) => {
    e.preventDefault();

    //chamar api de cadastro de finanças
    try {
      const response = await fetch('/api/financeiro/financas/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      //verifica se deu certo
      if (response.ok) {
        console.log('Financial release successfully registered!');

        //
        if (typeof onCadastro === 'function') {
          onCadastro(formData);
        }

        //reseta os dados dos inputs para deixá-los em branco
        setFormData({
          tipo: '',
          descricao: '',
          valor: '',
          data: '',
          area: '',
          origem: '',
          destino: '',
        });

        //habilita o modal de sucesso
        setRegisterSuccess(true);
      } else {
        console.error('Error when registering the release');
      }
    } catch (error) {
      console.error('Error when registering the release', error);
    }
  };

  return (
    <div className="centered-container financeiro">
      <h1>Register Financial Release</h1>

      <form onSubmit={handleSubmit}>
        {/*Inputs*/}
        <div>

          {/*Inputs radio*/}
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
              Cost
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
          {/*fim inputs Radio*/}
          </div>

          {/*outros inputs*/}
          <div className="centered-container">
            
            {/*input descricao*/}
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

            {/*input valor*/}
            <label htmlFor="valor">Value</label>
            <input
              type="number"
              name="valor"
              placeholder="950.99"
              onChange={handleChange}
              value={formData.valor}
              required
            />

            {/*input data*/}
            <label htmlFor="data">Date</label>
            <div className='input-data'>
                <input
                    type="date"
                    name="data"
                    onChange={handleChange}
                    value={formData.data}
                    required
                />
              <button type="button" onClick={() => handleSetDataHoje('data')}>Set today</button>
            </div>
            
            

            {/*select area*/}
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

            {/*select origem*/}
            <label htmlFor="origem">Credited Account (Origin)</label>
            <input
              type="text"
              name="origem"
              placeholder=""
              onChange={handleChange}
              value={formData.origem}
              required
            />

            {/*select destino*/}
            <label htmlFor="destino">Debited Account (Destiny)</label>
            <input
              type="text"
              name="destino"
              placeholder=""
              onChange={handleChange}
              value={formData.destino}
              required
            />

          {/*fim outros inputs*/}
          </div>

        {/*fim inputs*/}
        </div>

        {/*botao cadastro*/}
        <div>
          <button className="botao-cadastro" type="submit">Register financial release</button>
        </div>
      </form>

      {/*Modal de sucesso*/}
      {registerSuccess && (
        <div className="overlay">
          <div className="modal">
            <p>{registerSuccess ? 'Register successful!' : 'Register failed.'}</p>
            <button className="botao-cadastro" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}

    {/*fim componente*/}
    </div>
  );
};

export default Cadastro;
