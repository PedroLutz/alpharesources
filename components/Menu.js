import Link from 'next/link';

const Menu = () => {
  return (
    <div className="containerMenu">
        {/*Logo e nome*/}
        <div className='centered-container menuText'>
            <img src={'/images/logo.png'} alt="Logo" style={{width: '200px', margin: '-10px'}}/>
            <b className="gradient-text">Alpha Management</b>
        </div>

        {/*Itens do Menu, linha 1*/}
        <div className="menuGroup">
            {/*Item finanças*/}
            <span>
                <Link href="/pages/financial/finances/table">
                    <img src={'/images/finance_logo.png'} alt="Planning Logo" className="logoItem"/>
                    Finance management
                </Link>
            </span>
            {/*Item Plano de Aquisição*/}
            <span>
                <Link href="/pages/financial/plan/table">
                    <img src={'/images/planning_logo.png'} alt="Planning Logo" className="logoItem"/>
                    Acquisition planning
                </Link>
            </span>
        </div>

        {/*Itens do Menu, linha 2*/}
        <div className="menuGroup">
            {/*Item WBS*/}
            <span>
                <Link href="/pages/wbs">
                    <img src={'/images/wbs_logo.png'} alt="Planning Logo" className="logoItem"/><br/>
                    Work Breakdown Structure
                </Link>
            </span>
            {/*Item Cronograma*/}
            <span>
                <Link href="/pages/timeline/monitoring">
                    <img src={'/images/timeline_logo.png'} alt="Planning Logo" className="logoItem"/>
                    Timeline management
                </Link>
            </span>
            {/*Item Report
            <span>
                <Link href="/pages/report">
                    <img src={'/images/report_logo.png'} alt="Planning Logo" className="logoItem"/>
                    Report generator
                </Link>
            </span>
            */}
        </div>
    </div>
  );
};

export default Menu;
