// components/Cadastro.js
import React, { useState } from 'react';

const Cadastro = ({ onCadastro }) => {
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
        console.log('Plano cadastrado com sucesso!');
        alert("Plano cadastrado com sucesso!");

        if (typeof onCadastro === 'function') {
          onCadastro(formData);
        }
        // Chama a função de cadastro passada como prop
        // Limpa os campos após o envio do formulário
        setFormData({
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
      } else {
        console.error('Erro ao cadastrar o plano');
      }
    } catch (error) {
      console.error('Erro ao cadastrar o plano', error);
    }
  };

  return (
    <div className="centered-container">
      <h1>Cadastrar Plano</h1>
      <form onSubmit={handleSubmit}>
      <div >
          <div class="containerPai">
            <label className="container">
              <input
                type="radio"
                name="plano"
                value="Pior Cenário"
                checked={formData.plano === 'Pior Cenário'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Pior cenário
            </label>
            <label className="container">
              <input
                type="radio"
                name="plano"
                value="Cenário Ideal"
                checked={formData.plano === 'Cenário Ideal'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Cenário ideal
            </label>
          </div>
          <div className="centered-container">
          <label htmlFor="area">Área</label>
          <select
            name="area"
            onChange={handleChange}
            value={formData.area}
            required
          >
            <option value="" disabled selected>Selecione uma área</option>
            <option value="Patrocínio">Patrocínio</option>
            <option value="Engenharia">Engenharia</option>
            <option value="Impressão 3D">Impressão 3D</option>
            <option value="Usinagem">Usinagem</option>
            <option value="Pintura">Pintura</option>
            <option value="Marketing">Marketing</option>
            <option value="Estande">Estande</option>
            <option value="Viagem">Viagem</option>
            <option value="Extras">Extras</option>
          </select>
          </div>

          <div className='centered-container'>
            <label htmlFor="recurso">Recurso</label>
            <input
              type="text"
              name="recurso"
              placeholder="Recurso"
              onChange={handleChange}
              value={formData.recurso}
              required
            />
          </div>

          <div className='centered-container'>
            <label htmlFor="plano_a">Plano A</label>
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
                value="Serviço"
                checked={formData.tipo_a === 'Serviço'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Serviço
            </label>
            <label className="container">
              <input
                type="radio"
                name="tipo_a"
                value="Produto"
                checked={formData.tipo_a === 'Produto'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Produto
            </label>
          </div>

          <div className='centered-container'>
          <label htmlFor="valor_a">Valor</label>
            <input
              type="number"
              name="valor_a"
              onChange={handleChange}
              value={formData.valor_a}
              required
            />
          </div>

          <div className='centered-container'>
          <label htmlFor="data_esperada">Data Esperada</label>
            <input
              type="date"
              name="data_esperada"
              onChange={handleChange}
              value={formData.data_esperada}
              required
            />
          </div>

          <div className='centered-container'>
          <label htmlFor="data_limite">Data Limite</label>
            <input
              type="date"
              name="data_limite"
              onChange={handleChange}
              value={formData.data_limite}
              required
            />
          </div>

          <div className='centered-container'>
          <label htmlFor="plano_b">Plano B</label>
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
                value="Serviço"
                checked={formData.tipo_b === 'Serviço'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Serviço
            </label>
            <label className="container">
              <input
                type="radio"
                name="tipo_b"
                value="Produto"
                checked={formData.tipo_b === 'Produto'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Produto
            </label>
          </div>

          <div className='centered-container'>
            <label htmlFor="valor_b">Valor</label>
            <input
              type="number"
              name="valor_b"
              onChange={handleChange}
              value={formData.valor_b}
              required
            />
          </div>
        </div>
        <button className="botao-cadastro" type="submit">Cadastrar plano</button>
      </form>
    </div>
  );
};

export default Cadastro;
