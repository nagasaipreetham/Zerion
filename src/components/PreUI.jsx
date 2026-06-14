import ConstructionScene from './UnderConstruction';
import './PreUI.css';

export default function PreUI() {
  return (
    <section className="preui-section" id="preui">
      <div className="preui-flex-container">
        <div className="preui-left">
          <h2 className="preui-main-title">PreUI</h2>
          <p className="preui-sub-title">
            <span className="highlight-text">Under Development</span>
          </p>
          <p className="preui-desc">
            PreUI is a ready-to-use UI component library providing copy-pasteable code with detailed implementation instructions.
          </p>
        </div>
        <div className="preui-right">
          <ConstructionScene />
        </div>
      </div>
    </section>
  );
}
