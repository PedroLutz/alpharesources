import React, { useState, Suspense } from 'react';

const Cadastro = ({ onCadastro }) => {
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [formData, setFormData] = useState({
      nome: '',
      softskills: '',
      hardskills: '',
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
        const response = await fetch('/api/responsabilidades/membros/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          console.log('Member successfully registered!');

          if (typeof onCadastro === 'function') {
            onCadastro(formData);
          }

          setFormData({
            nome: '',
            softskills: '',
            hardskills: '',
          });

          setRegisterSuccess(true);
        } else {
          console.error('Error when registering the member');
        }
      } catch (error) {
        console.error('Error when registering the member', error);
      }
    };

    // Modal component
    const Modal = () => (
      <div className="overlay">
        <div className="modal">
          <p>{registerSuccess ? 'Register successful!' : 'Register failed.'}</p>
          <button className="botao-cadastro" onClick={handleCloseModal}>Close</button>
        </div>
      </div>
    );

    return (
      <div className="centered-container financeiro">
        <h2>Register Member</h2>

        <form onSubmit={handleSubmit}>
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
          {registerSuccess && <Modal />}
        </Suspense>
      </div>
    );
};

export default Cadastro;
