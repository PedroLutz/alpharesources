// components/Cadastro.js
import React, { useState, useEffect} from 'react';

const Cadastro = ({ onCadastro }) => {
  const [elementos, setElementos] = useState([]);
  const [dadosUsados, setDadosUsados] = useState(false);
  const [itensPorArea, setItensPorArea] = useState([]);
  const [itensPorAreaDp, setItensPorAreaDp] = useState([]);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [formData, setFormData] = useState({
    plano: '',
    item: '',
    area: '',
    inicio: '',
    termino: '',
    dp_item: '',
    dp_area: '',
    situacao: '',
  });
  
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

  useEffect(() => {
    fetchElementos();
  }, []);

  const handleCloseModal = () => {
    setRegisterSuccess(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  const handleAreaChangeDp = (e) => {
    const areaSelecionadaDp = e.target.value;
    const itensDaAreaDp = elementos.filter(item => item.area === areaSelecionadaDp).map(item => item.item);
    setItensPorAreaDp(itensDaAreaDp);

    // Atualiza o estado formData para refletir a nova área selecionada
    setFormData({
      ...formData,
      dp_area: areaSelecionadaDp,
      dp_item: '', // Limpa o campo de itens quando a área é alterada
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/cronograma/get', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        const cronogramas = data.cronogramas;

        // Verificar se a combinação de "area" e "item" já foi usada
        const dadosJaUsados = cronogramas.some(
          (item) => item.area === formData.area && item.item === formData.item
        );

        if (dadosJaUsados) {
          setDadosUsados(true);
          return;
        }

      } else {
        console.error('Error in fetching cronograma data');
      }
    } catch (error) {
      console.error('Error in fetching cronograma data', error);
    }
  
    try {
      // Enviar os dados com plano: true e situacao: 'concluida'
      const response1 = await fetch('/api/cronograma/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          plano: true,
          situacao: 'concluida',
        }),
      });
  
      if (response1.ok) {
        console.log('Cronograma registrado com sucesso!');
  
        if (typeof onCadastro === 'function') {
          onCadastro(formData);
        }
  
        // Chama a função de cadastro passada como prop
        // Limpa os campos após o envio do formulário
        setFormData({
          plano: '',
          item: '',
          area: '',
          inicio: '',
          termino: '',
          dp_item: '',
          dp_area: '',
          situacao: '',
        });
  
        setRegisterSuccess(true);
      } else {
        console.error('Error when registering the release');
      }
  
      // Enviar os dados com plano: false e situacao: 'iniciar'
      const response2 = await fetch('/api/cronograma/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          plano: false,
          inicio: null,
          termino: null,
          situacao: 'iniciar',
        }),
      });
  
      if (response2.ok) {
        console.log('Cronograma registrado para iniciar!');
      } else {
        console.error('Error when registering the release to start');
      }
    } catch (error) {
      console.error('Error when registering the release', error);
    }
  };
  
  return (
    <div className="centered-container">
      <h1>Timeline component register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="centered-container mini-input">
            <select
                  name="area"
                  onChange={handleAreaChange}
                  style={{width:'264px', height: '33px'}}
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
              style={{ width: '264px', height: '33px' }}
              value={formData.item}
              required
            >
              <option value="" disabled>Select an item</option>
              {itensPorArea.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>

            <label htmlFor="inicio" style={{width: '260px'}}>Start</label>
            <input
              type="date"
              id="inicio"
              name="inicio"
              placeholder=""
              onChange={handleChange}
              value={formData.inicio}
              required
            />

            <label htmlFor="termino" style={{width: '260px'}}>End</label>
            <input
              type="date"
              id="termino"
              name="termino"
              placeholder=""
              onChange={handleChange}
              value={formData.termino}
              required
            />
            <label htmlFor="dependencies"style={{width: '260px'}} >Dependencies</label>

            <select
                  name="dp_area"
                  onChange={handleAreaChangeDp}
                  style={{width:'264px', height: '33px'}}
                  value={formData.dp_area}
                >
                  <option value="" disabled>Select an area</option>
                  {[...new Set(elementos.map(item => item.area))].map((area, index) => (
                    <option key={index} value={area}>{area}</option>
              ))};
            </select>

            <select
              name="dp_item"
              onChange={handleChange}
              style={{ width: '264px', height: '33px' }}
              value={formData.dp_item}
            >
              <option value="" disabled>Select an item</option>
              {itensPorAreaDp.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <button className="botao-cadastro" type="submit">Register timeline component</button>
        </div>
      </form>

      {dadosUsados && (
    <div className="overlay">
      <div className="modal">
        <p>Task already registered. Please select a different task.</p>
        <button className="botao-cadastro" onClick={() => setDadosUsados(false)}>
          Close
        </button>
      </div>
    </div>
  )}

    {registerSuccess && !dadosUsados && (
      <div className="overlay">
        <div className="modal">
          <p>{registerSuccess ? 'Register successful!' : 'Register failed.'}</p>
          <button className="botao-cadastro" onClick={handleCloseModal}>
            Close
          </button>
        </div>
      </div>
    )}

    </div>
  );
};

export default Cadastro;
