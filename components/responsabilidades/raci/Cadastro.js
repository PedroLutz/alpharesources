import React, { useState, Suspense, useEffect } from 'react';

const Cadastro = ({ onCadastro }) => {
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [nomesMembros, setNomesMembros] = useState([]);
    const [formData, setFormData] = useState({
        area: "",
        item: "",
        responsabilidades: ""
    });
    const [elementos, setElementos] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementos.filter(item => item.area === areaSelecionada).map(item => item.item);
        setItensPorArea(itensDaArea);
    
        // Atualiza o estado formData para refletir a nova área selecionada
        setFormData({
          ...formData,
          area: areaSelecionada,
          item: '', // Limpa o campo de itens quando a área é alterada
        });
      };

    const handleCloseModal = () => {
      setRegisterSuccess(false);
    };

    const handleChange = (e) => {
      setFormData(({
        ...formData,
        [e.target.name]: e.target.value,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const response = await fetch('/api/responsabilidades/raci/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({...formData,
            responsabilidades: Object.keys(formData).filter(key => key.startsWith('input')).map(key => formData[key]).join(', ')}),
        });

        if (response.ok) {
          console.log('RACI item successfully registered!');

          if (typeof onCadastro === 'function') {
            onCadastro(formData);
          }

          setFormData({
            area: "",
            item: "",
            responsabilidades: ""
          });

          setRegisterSuccess(true);
        } else {
          console.error('Error when registering the RACI item');
        }
      } catch (error) {
        console.error('Error when registering the RACI item', error);
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

    const fetchElementos = async () => {
        try {
          const response = await fetch('/api/wbs/get', {
            method: 'GET',
          });
    
          if (response.status === 200) {
            const data = await response.json();
            setElementos(data.elementos);
    
          } else {
            console.error('Error in searching for financal releases data');
          }
        } catch (error) {
          console.error('Error in searching for financal releases data', error);
        }
      };

    const fetchNomesMembros = async () => {
        try {
          const response = await fetch('/api/responsabilidades/membros/get', {
            method: 'GET',
          });
    
          if (response.status === 200) {
            const data = await response.json();
            setNomesMembros(data.nomes);
          } else {
            console.error('Error in searching for RACI items data');
          }
        } catch (error) {
          console.error('Error in searching for RACI items data', error);
        }
      };

      const generateInputNames = () => {
        const firstNames = new Map();
        const inputNames = [];
      
        nomesMembros.forEach((membro) => {
          const nomeCompleto = membro.nome;
          const firstName = nomeCompleto.split(' ')[0];
          const lastName = nomeCompleto.split(' ')[1];
      
          if (firstNames.has(firstName)) {
            const existingHeader = firstNames.get(firstName);
            inputNames.push(`${existingHeader} ${lastName}`);
          } else {
            firstNames.set(firstName, nomeCompleto.split(' ')[0]);
            inputNames.push(nomeCompleto.split(' ')[0]);
          }
        });
      
        return inputNames;
      };
      const inputNames = generateInputNames();

      const generateFormData = () => {
        inputNames.forEach((membro) => {
            setFormData(({
                ...formData,
                [`input${getCleanName(membro)}`]: ''
            }));
        });
        setFormData(({
            ...formData,
            responsabilidades: Object.keys(formData).filter(key => key.startsWith('input')).map(key => formData[key]).join(', ')
          }));
        console.log(formData);
      }

      const getCleanName = (str) => {
        const removeAccents = (str) => {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          };
        return removeAccents(str.split(" ").join(""));
      }

      useEffect(() => {
        fetchNomesMembros();
        fetchElementos();
        generateFormData();;
      }, []);

    return (
      <div className="centered-container financeiro">
        <h2>Register RACI item</h2>

        <form onSubmit={handleSubmit}>
           {/*Inputs*/}
        <div>

          {/*outros inputs*/}
          <div className="centered-container">
            
            {inputNames.map((membro, index) => (
              <div className="mini-input">
              <label htmlFor={"input" + getCleanName(membro)}>{membro}</label>
                <select
                    type="text"
                    id={"input" + getCleanName(membro)}
                    name={"input" + getCleanName(membro)}
                    placeholder=""
                    onChange={handleChange}
                    defaultValue={""}
                    value={formData["input" + getCleanName(membro)]}
                    required
                >
                    <option value="" disabled>Select responsibility</option>
                    <option value="R">Responsible</option>
                    <option value="A">Accountable</option>
                    <option value="C">Consulted</option>
                    <option value="I">Informed</option>
                </select>
            </div>

            ))}
            <select
                  name="area"
                  onChange={handleAreaChange}
                  value={formData.area}
                  required
                >
                  <option value="" disabled>Select an area</option>
                  {[...new Set(elementos.map(item => item.area))].map((area, index) => (
                    <option key={index} value={area}>{area}</option>
              ))};
            </select>

            <select
              name="item"
              onChange={handleChange}
              value={formData.item}
              required
            >
              <option value="" disabled>Select an item</option>
              {itensPorArea.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
            
          {/*fim outros inputs*/}
          </div>

        {/*fim inputs*/}
        </div>

          <div>
            <button className="botao-cadastro" onClick={() => {console.log(formData)}} type="submit">Register RACI item</button>
            <button className="botao-cadastro" type="button" onClick={() => {console.log(formData)}}>Console Log</button>
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
