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
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Lançamento cadastrado com sucesso!');

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
          <div>
          <label>
      <input
        type="radio"
        name="tipo"
        value="Receita"
        checked={formData.tipo === 'Receita'}
        onChange={handleChange}
      />
      Receita
    </label>
    <label>
      <input
        type="radio"
        name="tipo"
        value="Despesa"
        checked={formData.tipo === 'Despesa'}
        onChange={handleChange}
      />
      Despesa
    </label>
          </div>
          <input
            type="text"
            name="descricao"
            placeholder="Descrição"
            onChange={handleChange}
            value={formData.descricao}
          />
          <input
            type="number"
            name="valor"
            placeholder="Valor"
            onChange={handleChange}
            value={formData.valor}
          />
          <input
            type="date"
            name="data"
            onChange={handleChange}
            value={formData.data}
          />
          <select
            name="area"
            onChange={handleChange}
            value={formData.area}
          >
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
            placeholder="Origem"
            onChange={handleChange}
            value={formData.origem}
          />
          <input
            type="text"
            name="destino"
            placeholder="Destino"
            onChange={handleChange}
            value={formData.destino}
          />
        </div>
        <button className="dark-mode"type="submit">Cadastrar lançamento</button>
      </form>
    </div>
  );
};

export default Cadastro;
