// components/Menu.js
import Link from 'next/link';

const Menu = () => {
  return (
    <div className="containerMenu">
        <div className='centered-container menuText' style={{fontSize: '30px'}}>
            <img src={'/images/logo.png'} alt="Logo" style={{width: '200px', margin: '-10px'}}/>
            <b className="gradient-text" style={{marginBottom: '30px'}}>Alpha Management</b>
        </div>
      <div className="menuGroup">
        <span>
            <Link href="/pages/financial/finances/table">
                <img src={'/images/finance_logo.png'} alt="Planning Logo" style={{width: '80px'}}/>
                Finance management
            </Link>
        </span>
        <span>
            <Link href="/pages/financial/plan/table">
                <img src={'/images/planning_logo.png'} alt="Planning Logo" style={{width: '80px'}}/>
                Acquisition planning
            </Link>
        </span>
      </div>
      <div className="menuGroup">
        <span>
            <Link href="/pages/wbs">
                <img src={'/images/wbs_logo.png'} alt="Planning Logo" style={{width: '80px'}}/><br/>
                Work Breakdown Structure
            </Link>
        </span>
        <span>
            <Link href="/pages/timeline/monitoring">
                <img src={'/images/timeline_logo.png'} alt="Planning Logo" style={{width: '80px'}}/>
                Timeline management
            </Link>
        </span>
        <span>
            <Link href="/pages/report">
                <img src={'/images/report_logo.png'} alt="Planning Logo" style={{width: '80px'}}/>
                Report generator
            </Link>
        </span>
      </div>
    </div>
  );
};

export default Menu;
