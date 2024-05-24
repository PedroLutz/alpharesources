import React, { useState, useEffect, Suspense } from 'react';
import Modal from '../../Modal';
import styles from '../../../styles/modules/radio.module.css';
import { handleSubmit , fetchData } from '../../../functions/crud'
import { cleanForm } from '../../../functions/general'

const Cadastro = () => {
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [elementosWBS, setElementosWBS] = useState([]);
  const [formData, setFormData] = useState({
    tipo: '',
    descricao: '',
    valor: '',
    data: '',
    area: '',
    origem: '',
    destino: '',
  });

  const fetchElementos = async () => {
    const data = await fetchData('wbs/get');
    setElementosWBS(data.elementos);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSetDataHoje = (inputName) => {
    const today = new Date();
    const formattedDate = today.toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).split(',')[0];

    setFormData((formData) => ({
      ...formData,
      [inputName]: formattedDate,
    }));
  };

  useEffect(() => {
    fetchElementos();
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    const isExpense = formData.tipo === 'Expense';
    const valor = isExpense ? -parseFloat(formData.valor) : parseFloat(formData.valor);
    const updatedFormData = {
      ...formData,
      valor: valor
    };

    handleSubmit({
      route: 'financeiro/financas', 
      dados: updatedFormData, 
      registroSucesso: setRegisterSuccess});
    cleanForm(formData, setFormData);
  };

  return (
    <div className="centered-container financeiro">
      <h2>Register Financial Release</h2>

      <form onSubmit={enviar}>
        {/*Inputs*/}
        <div>

          {/*Inputs radio*/}
          <div className={styles.containerPai}>

            <label className={styles.container}>
              <input
                type="radio"
                name="tipo"
                value="Income"
                checked={formData.tipo === 'Income'}
                onChange={handleChange}
                required
              />
              <span className={styles.checkmark}></span>
              Income
            </label>

            <label className={styles.container}>
              <input
                type="radio"
                name="tipo"
                value="Expense"
                checked={formData.tipo === 'Expense'}
                onChange={handleChange}
                required
              />
              <span className={styles.checkmark}></span>
              Cost
            </label>

            <label className={styles.container}>
              <input
                type="radio"
                name="tipo"
                value="Exchange"
                checked={formData.tipo === 'Exchange'}
                onChange={handleChange}
                required
              />
              <span className={styles.checkmark}></span>
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
              {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                <option key={index} value={area}>{area}</option>
              ))};
              <option value="Extras">Extras</option>
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

        <div>
          <button className="botao-cadastro" type="submit">Register financial release</button>
        </div>
      </form>

      {/* Lazy loaded modal */}
      <Suspense fallback={<div>Loading...</div>}>
        {registerSuccess && 
        <Modal objeto={{
          titulo: registerSuccess ? 'Register successful!' : 'Register failed.',
          botao1: {
            funcao: () => setRegisterSuccess(false), texto: 'Close'
          }
        }}/>}
      </Suspense>
    </div>
  );
};

export default Cadastro;
