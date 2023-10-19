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
      const response = await fetch('/api/financeiro/financas/create', {
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
    <div className="centered-container">
      <h2>Cadastrar Lançamento</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="containerPai">
            <label className="container">
              <input
                type="radio"
                name="tipo"
                value="Receita"
                checked={formData.tipo === 'Receita'}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
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
              <span className="checkmark"></span>
              Despesa
            </label>
          </div>
          <div className="centered-container">
            <label htmlFor="descricao">Descrição</label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              placeholder="COMPRA - Adesivos para o Carro"
              onChange={handleChange}
              value={formData.descricao}
              required
            />
            <label htmlFor="valor">Valor</label>
          <input
            type="number"
            name="valor"
            placeholder="420.69"
            onChange={handleChange}
            value={formData.valor}
            required
          />
          <label htmlFor="data">Data</label>
          <input
            type="date"
            name="data"
            onChange={handleChange}
            value={formData.data}
            required
          />
          <label htmlFor="area">Área</label>
          <select
            name="area"
            onChange={handleChange}
            value={formData.area}
            required
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
          <label htmlFor="origem">Conta Creditada (Origem)</label>
          <input
            type="text"
            name="origem"
            placeholder="Patrocinador"
            onChange={handleChange}
            value={formData.origem}
            required
          />
          <label htmlFor="destino">Conta Debitada (Destino)</label>
          <input
            type="text"
            name="destino"
            placeholder="Caixa do time"
            onChange={handleChange}
            value={formData.destino}
            required
          />
          </div>
        </div>
        <div>
          <button className="botao-cadastro" type="submit">Cadastrar lançamento</button>
        </div>
      </form>
    </div>
  );
};

export default Cadastro;
