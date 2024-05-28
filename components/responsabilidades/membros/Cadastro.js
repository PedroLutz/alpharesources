import React, { useState, Suspense } from 'react';
import Modal from '../../Modal';
import { handleSubmit, fetchData } from '../../../functions/crud'
import { cleanForm } from '../../../functions/general'

const Cadastro = () => {
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [dadosUsados, setDadosUsados] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    softskills: '',
    hardskills: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const enviar = async (e) => {
    e.preventDefault();

    const data = await fetchData('responsabilidades/membros/get');
    const nomesMembros = data.nomes;

    const nomeJaUsado = nomesMembros.some((item) => item.nome === formData.nome);

    if (nomeJaUsado) {
      setDadosUsados(true);
      return
    };

    handleSubmit({
      route: 'responsabilidades/membros',
      dados: formData,
      registroSucesso: setRegisterSuccess
    });
    cleanForm(formData, setFormData);
  };

  // Modal component
  const Skibidi = () => (
    <div className="overlay">
      <div className="modal">
        <p>{registerSuccess ? 'Register successful!' : 'Register failed.'}</p>
        <button className="botao-cadastro" onClick={() => setRegisterSuccess(false)}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="centered-container financeiro">
      <h2>Register Member</h2>

      <form onSubmit={enviar}>
        {/*Inputs*/}
        <div>

          {/*outros inputs*/}
          <div className="centered-container">

            {/*input nome*/}
            <div className="mini-input">
              <label htmlFor="nome">Name</label>
              <input
                type="text"
                id="nome"
                name="nome"
                placeholder=""
                onChange={handleChange}
                value={formData.nome}
                required
              />
            </div>

            {/*input softskills*/}
            <div className="mini-input">
              <label htmlFor="softskills">Softskills</label>
              <textarea
                type="text"
                id="softkills"
                name="softskills"
                onChange={handleChange}
                value={formData.softskills}
                required
              />
            </div>

            {/*input hardskills*/}
            <div className="mini-input">
              <label htmlFor="hardskills">Hardskills</label>
              <textarea
                type="text"
                name="hardskills"
                id="hardskills"
                onChange={handleChange}
                value={formData.hardskills}
                required
              />
            </div>

            {/*fim outros inputs*/}
          </div>

          {/*fim inputs*/}
        </div>

        <div>
          <button className="botao-cadastro" type="submit">Register members</button>
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
          }} />}
      </Suspense>

      {dadosUsados && (
        <Modal objeto={{
          titulo: 'Member already registered. Please submit a different member.',
          botao1: {
            funcao: () => setDadosUsados(false), texto: 'Close'
          }
        }} />
      )}
    </div>
  );
};

export default Cadastro;
