import { useState } from "react";
const FormularioLogin = () => {
    const [usuario, setUsuario] = useState("");
    const [usuarioBanco, setUsuarioBanco] = useState("");
    const [senha, setSenha] = useState("");
  
    const handleSubmit = (e) => {
      e.preventDefault();
  
      // Validar os dados do formulário
      if (usuario.trim() === "" || senha.trim() === "") {
        alert("Preencha todos os campos!");
        return;
      }
  
      // Autenticar o usuário
      const autenticar = async () => {
        const response = await fetch('/api/login', {
        method: 'GET',
      });

      if (response.status === 200) {
        const data = await response.json();
        setUsuarioBanco(data.usuario[0]);
      } else {
        console.error('Error in searching for timeline data');
      }
  
      console.log(usuarioBanco.senha, usuarioBanco.usuario)
      if (senha === usuarioBanco.senha || usuario === usuarioBanco.usuario) {
        setAutenticado(true);
      } else {
        alert("Usuário ou senha inválidos!");
      }
      };
  
      autenticar();
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <input type="text" placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} className="form-control" />
            </div>
            <div className="col-md-6">
              <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="form-control" />
            </div>
          </div>
          <div className="row align-items-center">
            <div className="col-md-12">
              <button type="submit" className="btn btn-primary">Entrar</button>
            </div>
          </div>
        </div>
      </form>
    );
  };
  export default FormularioLogin;