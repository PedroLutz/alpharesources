// components/Cadastro.js
import React, { useState } from 'react';

const Cadastro = ({ onCadastro }) => {
  const [formData, setFormData] = useState({
    tipo: '',
    descricao: '',
    valor: '',
    data: '',
    area: '',
    origem: '',
    destino: '',
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
      const response = await fetch('/api/plano/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Lançamento cadastrado com sucesso!');
        alert("Lançamento cadastrado com sucesso!");

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
      } else {
        console.error('Erro ao cadastrar o lançamento');
      }
    } catch (error) {
      console.error('Erro ao cadastrar o lançamento', error);
    }
  };

  return (
    <div>
      <h1>Cadastrar Lançamento</h1>
      <form onSubmit={handleSubmit}>
      <div>
          <div class="containerPai">
            <label className="container">
              <input
                type="radio"
                name="tipo"
                value="Receita"
                checked={formData.tipo === 'Receita'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Receita
            </label>
            <label className="container">
              <input
                type="radio"
                name="tipo"
                value="Despesa"
                checked={formData.tipo === 'Despesa'}
                onChange={handleChange}
                required
              />
              <span class="checkmark"></span>
              Despesa
            </label>
          </div>
          <input
            type="text"
            name="descricao"
            placeholder="Descrição"
            onChange={handleChange}
            value={formData.descricao}
            required
          />
          <input
            type="number"
            name="valor"
            placeholder="Valor"
            onChange={handleChange}
            value={formData.valor}
            required
          />
          <input
            type="date"
            name="data"
            onChange={handleChange}
            value={formData.data}
            required
          />
          <select
            name="area"
            onChange={handleChange}
            value={formData.area}
            required
            defaultValue=""
          >
            <option value="" disabled select>Selecione uma área</option>
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
          <input
            type="text"
            name="origem"
            placeholder="Conta creditada"
            onChange={handleChange}
            value={formData.origem}
            required
          />
          <input
            type="text"
            name="destino"
            placeholder="Conta debitada"
            onChange={handleChange}
            value={formData.destino}
            required
          />
        </div>
        <button type="submit">Cadastrar lançamento</button>
      </form>
    </div>
  );
};

export default Cadastro;
