import React, { useState, useEffect, Suspense } from 'react';
import { cleanForm } from '../../functions/general'
import Modal from '../Modal';
import { fetchData } from '../../functions/crud'

const Cadastro = () => {
  const [formData, setFormData] = useState({
    item: '',
    area: '',
  });

  const [mostrarInputNovaArea, setMostrarInputNovaArea] = useState(false);
  const [isNovaAreaButton, setIsNovaAreaButton] = useState(true);
  const [elementos, setElementos] = useState([]);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const fetchElementos = async () => {
    const data = await fetchData('wbs/get');
    setElementos(data.elementos);
  };

  useEffect(() => {
    fetchElementos();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCadastrarNovaArea = () => {
    setMostrarInputNovaArea(!mostrarInputNovaArea);
    setIsNovaAreaButton(!isNovaAreaButton);

    setFormData({
      ...formData,
      area: '',
    });
  };

  const enviar = async (e) => {
    e.preventDefault();
    handleSubmit({
      route: 'wbs',
      dados: formData,
      registroSucesso: setRegisterSuccess
    });
    cleanForm(formData, setFormData);
  };

  return (
    <div className="centered-container">
      <h1>Work Breakdown Structure</h1>
      <form onSubmit={enviar}>
        <div>
          <div className="centered-container">
            <label htmlFor="area" style={{ alignSelf: 'center', textAlign: 'center', marginLeft: -11 }}>Area</label>
            <div className="mini-input">
              {mostrarInputNovaArea ? (
                <input
                  className='mini-input'
                  type="text"
                  id="area"
                  name="area"
                  placeholder=""
                  onChange={handleChange}
                  value={formData.area}
                  required
                />
              ) : (
                <select
                  className='mini-input'
                  name="area"
                  onChange={handleChange}
                  value={formData.area}
                  required
                >
                  <option value="" disabled>Select an area</option>
                  {[...new Set(elementos.map(item => item.area))].map((area, index) => (
                    <option key={index} value={area}>{area}</option>
                  ))};
                </select>
              )}
            </div>

            <button
              className="botao-cadastro"
              type="button"
              onClick={handleCadastrarNovaArea}
            >
              {isNovaAreaButton ? 'Register new area' : 'Use registered areas'}
            </button>
            <label htmlFor="item" style={{ alignSelf: 'center', textAlign: 'center', marginLeft: -11 }}>Item</label>
            <input
              type="text"
              id="item"
              name="item"
              placeholder=""
              style={{ width: '400px' }}
              onChange={handleChange}
              value={formData.item}
              required
            />
          </div>

        </div>
        <div>
          <button className="botao-cadastro" type="submit">Register WBS element</button>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          {registerSuccess &&
            <Modal objeto={{
              titulo: registerSuccess ? 'Register successful!' : 'Register failed.',
              botao1: {
                funcao: () => setRegisterSuccess(false), texto: 'Close'
              },
            }} />}
        </Suspense>
      </form>
    </div>
  );
};

export default Cadastro;
