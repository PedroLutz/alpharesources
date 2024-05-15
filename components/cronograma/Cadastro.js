// components/Cadastro.js
import React, { useState, useEffect} from 'react';
import { handleSubmit , fetchData } from '../../functions/crud'

const Cadastro = () => {
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
    const data = await fetchData('wbs/get');
    setElementos(data.elementos);
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

  const handleAreaChange = (e, isDp) => {
    const areaSelecionada = e.target.value;
    const itensDaArea = elementos.filter(item => item.area === areaSelecionada).map(item => item.item);
    if(isDp){ 
      setItensPorAreaDp(itensDaArea);
      setFormData({
        ...formData,
        dp_area: areaSelecionada,
        dp_item: '',
      });
    } else { 
      setItensPorArea(itensDaArea);
      setFormData({
        ...formData,
        area: areaSelecionada,
        item: '', 
      });
    };
  };

  const cleanInputs = () => {
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
  }


  const enviar = async (e) => {
    e.preventDefault();
    const data = await fetchData('cronograma/get/all');
    const cronogramas = data.cronogramas;

    const dadosJaUsados = cronogramas.some(
      (item) => item.area === formData.area && item.item === formData.item
    );

    if (dadosJaUsados) {
      setDadosUsados(true);
      return;
    }
    const formDataPlano = {...formData, plano: true, situacao: 'concluida'};
    const formDataGantt = {...formData, plano: false, inicio: null, termino: null, situacao: 'iniciar'}

    const objPlano = { route: 'cronograma', dados: formDataPlano, registroSucesso: setRegisterSuccess }
    handleSubmit(objPlano);
    const objGantt = { ...objPlano, dados: formDataGantt}
    handleSubmit(objGantt);
  }
  
  return (
    <div className="centered-container">
      <h1>Timeline component register</h1>
      <form onSubmit={enviar}>
        <div>
          <div className="centered-container mini-input">
            <select
                  name="area"
                  onChange={(event) => handleAreaChange(event, false)}
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

            <label htmlFor="dp_area"style={{width: '260px'}} >Dependencies</label>
            <select
                  name="dp_area"
                  onChange={(event) => handleAreaChange(event, true)}
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
          <button className="botao-cadastro" type="button" onClick={()=> cleanInputs()}>Clean inputs</button>
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
