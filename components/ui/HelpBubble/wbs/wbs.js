const HelpBubble = ({ setShowHelp }) => {
  return (
    <div className="overlay">
      <div className="modalHelp">
        <div>
          <h2>Help</h2>
          The <b>Work Breakdown Structure (WBS)</b> is the foundation of the project.<br/><br/>
          Here, you split your work into areas, and subdivide these areas into items (packages of work).<br/>
          These areas and items will be used in most of this website's tools.<br/><br/>
          The <b>"New Area"</b> block can be used to create an area, with a representative color.<br/>
          Please avoid darker colors, as the color of an area is used as the background color in tables.<br/><br/>
          Below each area, you can create a new item, in the <b>"New item"</b> block. <br/>
          Two items cannot have the same name, even if they are in different areas.
        </div>
        <button className='botao-padrao'onClick={()=> setShowHelp(false)}>Back</button>
      </div>
    </div>
  );
}

export default HelpBubble;