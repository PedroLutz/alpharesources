// components/Cadastro.js
import React, { useState } from 'react';
import global from "../styles/global.module.css"

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

      if (response.status === 201) {
        console.log('Pessoa criada com sucesso!');
        // Chama a função de cadastro passada como prop
        onCadastro(formData);
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
        console.error('Erro ao criar a pessoa');
      }
    } catch (error) {
      console.error('Erro ao criar a pessoa', error);
    }
  };

  return (
    <div>
      <h1>Cadastrar Lançamento</h1>
      <form onSubmit={handleSubmit}>
      <div className={`${global.alinhamentoVertical}`}>
          <input
            type="text"
            name="tipo"
            placeholder="Tipo"
            onChange={handleChange}
            value={formData.tipo}
          />
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
          <input
            type="text"
            name="area"
            placeholder="Área"
            onChange={handleChange}
            value={formData.area}
          />
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
        <button type="submit">Cadastrar lançamento</button>
      </form>
    </div>
  );
};

export default Cadastro;
