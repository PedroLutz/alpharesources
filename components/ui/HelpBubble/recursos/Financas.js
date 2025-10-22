const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Financial Releases Data</b> is used for tracking all financial movements.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Type</b>: the nature of the release (<b style={{color: 'green'}}>income</b>, <b style={{color: 'red'}}>cost</b> or <b style={{color: 'blue'}}>exchange</b>).</li>
                        <li><b>Description, value, date</b>: self explanatory.</li>
                        <li><b>Area</b>: the WBS area the release relates to.</li>
                        <li><b>Origin</b> or credited account: The account where the release originated from. In costs, it's usually the team's finances, for example.</li>
                        <li><b>Destination</b> or debited account: The account where the release went to. In incomes, it's usually the team's finances, for example.</li>
                    </ul>
                    </div>
                    Obs: <b style={{color: 'blue'}}> Exchanges</b> count both as an income and as a cost, making it so that they count for reports, but do not interfere with the ammount of cash available. They are meant to represent sponsored products and services (where the team does not directly come in contact with the financial value of the release).
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;