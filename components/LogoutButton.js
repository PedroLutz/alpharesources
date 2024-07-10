const Logout = ({autenticacao}) => {
    const {autenticar, autenticado} = autenticacao;

    const deslogar = () => {
        sessionStorage.setItem('tempoDeSessao', null)
        autenticar(false);
    }

    return (
        <button className="botao_logout"onClick={deslogar}>Logoff</button>
    )
}

export default Logout;