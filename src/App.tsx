import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  CircleGauge,
  CircuitBoard,
  Cog,
  FlaskConical,
  Gauge,
  Layers3,
  Menu,
  MoveRight,
  Play,
  Ruler,
  Settings2,
  ShieldCheck,
  Sparkles,
  Thermometer,
  X,
  Zap,
} from 'lucide-react';

type Field = { key: string; label: string; symbol: string; defaultValue: string; units: string[] };
type CalculatorConfig = {
  id: string;
  title: string;
  category: string;
  formula: string;
  description: string;
  accent: string;
  icon: typeof Activity;
  fields: Field[];
  resultUnit: string;
  calculate: (values: Record<string, number>) => number;
};

const calculators: CalculatorConfig[] = [
  { id: 'force', title: 'Force', category: 'Mechanics', formula: 'F = ma', description: 'The push or pull that changes an object’s motion.', accent: 'orange', icon: Activity, fields: [{ key: 'mass', label: 'Mass', symbol: 'm', defaultValue: '12', units: ['kg', 'g', 'lb'] }, { key: 'acceleration', label: 'Acceleration', symbol: 'a', defaultValue: '9.81', units: ['m/s²', 'ft/s²'] }], resultUnit: 'N', calculate: v => v.mass * v.acceleration },
  { id: 'torque', title: 'Torque', category: 'Mechanics', formula: 'τ = rF', description: 'The rotational force produced around an axis.', accent: 'orange', icon: Cog, fields: [{ key: 'radius', label: 'Lever arm', symbol: 'r', defaultValue: '0.25', units: ['m', 'mm', 'in'] }, { key: 'force', label: 'Force', symbol: 'F', defaultValue: '180', units: ['N', 'kN', 'lbf'] }], resultUnit: 'N·m', calculate: v => v.radius * v.force },
  { id: 'work', title: 'Work', category: 'Mechanics', formula: 'W = Fd', description: 'Energy transferred when a force moves an object.', accent: 'orange', icon: MoveRight, fields: [{ key: 'force', label: 'Force', symbol: 'F', defaultValue: '80', units: ['N', 'kN', 'lbf'] }, { key: 'distance', label: 'Distance', symbol: 'd', defaultValue: '4.5', units: ['m', 'cm', 'ft'] }], resultUnit: 'J', calculate: v => v.force * v.distance },
  { id: 'power', title: 'Power', category: 'Machines', formula: 'P = W / t', description: 'How quickly work is completed or energy is transferred.', accent: 'blue', icon: Zap, fields: [{ key: 'work', label: 'Work', symbol: 'W', defaultValue: '360', units: ['J', 'kJ', 'ft·lbf'] }, { key: 'time', label: 'Time', symbol: 't', defaultValue: '12', units: ['s', 'min', 'h'] }], resultUnit: 'W', calculate: v => v.work / v.time },
  { id: 'pressure', title: 'Pressure', category: 'Mechanics', formula: 'P = F / A', description: 'Force distributed over a defined surface area.', accent: 'orange', icon: Gauge, fields: [{ key: 'force', label: 'Force', symbol: 'F', defaultValue: '2400', units: ['N', 'kN', 'lbf'] }, { key: 'area', label: 'Area', symbol: 'A', defaultValue: '0.015', units: ['m²', 'cm²', 'in²'] }], resultUnit: 'Pa', calculate: v => v.force / v.area },
  { id: 'density', title: 'Density', category: 'Materials', formula: 'ρ = m / V', description: 'Mass contained in a unit volume of material.', accent: 'green', icon: Layers3, fields: [{ key: 'mass', label: 'Mass', symbol: 'm', defaultValue: '7.85', units: ['kg', 'g', 'lb'] }, { key: 'volume', label: 'Volume', symbol: 'V', defaultValue: '0.001', units: ['m³', 'cm³', 'L'] }], resultUnit: 'kg/m³', calculate: v => v.mass / v.volume },
  { id: 'stress', title: 'Stress', category: 'Materials', formula: 'σ = F / A', description: 'Internal force carried per unit area of a material.', accent: 'green', icon: ShieldCheck, fields: [{ key: 'force', label: 'Load', symbol: 'F', defaultValue: '12000', units: ['N', 'kN', 'lbf'] }, { key: 'area', label: 'Cross-section', symbol: 'A', defaultValue: '0.0004', units: ['m²', 'mm²', 'in²'] }], resultUnit: 'Pa', calculate: v => v.force / v.area },
  { id: 'strain', title: 'Strain', category: 'Materials', formula: 'ε = ΔL / L', description: 'The deformation of a body relative to its original length.', accent: 'green', icon: Ruler, fields: [{ key: 'change', label: 'Change in length', symbol: 'ΔL', defaultValue: '0.8', units: ['mm', 'm', 'in'] }, { key: 'length', label: 'Original length', symbol: 'L', defaultValue: '200', units: ['mm', 'm', 'in'] }], resultUnit: 'mm/mm', calculate: v => v.change / v.length },
  { id: 'gear', title: 'Gear Ratio', category: 'Machines', formula: 'GR = T₂ / T₁', description: 'The speed and torque relationship between two gears.', accent: 'blue', icon: Cog, fields: [{ key: 'driven', label: 'Driven teeth', symbol: 'T₂', defaultValue: '64', units: ['teeth'] }, { key: 'driver', label: 'Driver teeth', symbol: 'T₁', defaultValue: '16', units: ['teeth'] }], resultUnit: ': 1', calculate: v => v.driven / v.driver },
  { id: 'spring', title: 'Spring Force', category: 'Materials', formula: 'F = kx', description: 'The restoring force produced by a stretched or compressed spring.', accent: 'green', icon: Activity, fields: [{ key: 'stiffness', label: 'Spring stiffness', symbol: 'k', defaultValue: '240', units: ['N/m', 'N/mm', 'lbf/in'] }, { key: 'extension', label: 'Extension', symbol: 'x', defaultValue: '0.035', units: ['m', 'mm', 'in'] }], resultUnit: 'N', calculate: v => v.stiffness * v.extension },
  { id: 'ma', title: 'Mechanical Advantage', category: 'Machines', formula: 'MA = Fout / Fin', description: 'How much a machine multiplies the input force.', accent: 'blue', icon: CircuitBoard, fields: [{ key: 'output', label: 'Output force', symbol: 'Fout', defaultValue: '1200', units: ['N', 'kN', 'lbf'] }, { key: 'input', label: 'Input force', symbol: 'Fin', defaultValue: '300', units: ['N', 'kN', 'lbf'] }], resultUnit: ': 1', calculate: v => v.output / v.input },
  { id: 'fos', title: 'Factor of Safety', category: 'Materials', formula: 'FoS = σᵧ / σₐ', description: 'A margin between material strength and working stress.', accent: 'green', icon: ShieldCheck, fields: [{ key: 'yield', label: 'Yield strength', symbol: 'σᵧ', defaultValue: '250', units: ['MPa', 'GPa', 'psi'] }, { key: 'allowable', label: 'Working stress', symbol: 'σₐ', defaultValue: '100', units: ['MPa', 'GPa', 'psi'] }], resultUnit: ': 1', calculate: v => v.yield / v.allowable },
];

const categories = [
  { name: 'Mechanics', count: 4, icon: Activity, color: 'orange', copy: 'Motion, forces & energy' },
  { name: 'Materials', count: 5, icon: Layers3, color: 'green', copy: 'Strength & deformation' },
  { name: 'Machines', count: 3, icon: Cog, color: 'blue', copy: 'Power transmission' },
  { name: 'Thermodynamics', count: 0, icon: Thermometer, color: 'slate', copy: 'Coming next' },
];

const formatResult = (value: number) => Math.abs(value) >= 1000 ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value.toLocaleString(undefined, { maximumFractionDigits: 4 });

function Diagram({ calculator, values }: { calculator: CalculatorConfig; values: Record<string, number> }) {
  const isGear = calculator.id === 'gear' || calculator.id === 'ma';
  const isSpring = calculator.id === 'spring';
  const isStrain = calculator.id === 'strain';
  return (
    <div className="diagram-wrap">
      <div className="diagram-label"><span className="pulse-dot" /> LIVE VISUALIZATION</div>
      {isGear ? (
        <svg viewBox="0 0 300 150" className="diagram-svg" aria-label="Gear visualization">
          <g className="gear-spin slow" transform="translate(105 76)"><circle r="48" className="gear-fill" /><circle r="12" className="gear-hole" /><path d="M0-62V-42M62 0H42M0 62V42M-62 0H-42" className="gear-teeth" /></g>
          <g className="gear-spin fast" transform="translate(210 76)"><circle r="28" className="gear-fill blue" /><circle r="8" className="gear-hole" /><path d="M0-38V-26M38 0H26M0 38V26M-38 0H-26" className="gear-teeth" /></g>
          <text x="105" y="140" className="diagram-text">DRIVEN</text><text x="210" y="140" className="diagram-text">DRIVER</text>
        </svg>
      ) : isSpring ? (
        <svg viewBox="0 0 300 150" className="diagram-svg" aria-label="Spring visualization">
          <path d="M30 75H68L78 45L94 105L110 45L126 105L142 45L158 105L174 45L190 105L206 75H270" className="spring-line spring-move" /><path d="M45 35V115M30 35H60M30 115H60" className="diagram-measure" /><text x="36" y="27" className="diagram-text">x</text>
        </svg>
      ) : isStrain ? (
        <svg viewBox="0 0 300 150" className="diagram-svg" aria-label="Strain visualization"><rect x="50" y="63" width="180" height="24" rx="5" className="bar-base" /><rect x="50" y="63" width="180" height="24" rx="5" className="bar-active strain-stretch" /><path d="M50 110H230M50 104V116M230 104V116" className="diagram-measure" /><text x="132" y="132" className="diagram-text">ΔL</text><path d="M50 48V30M230 48V30M50 36H230" className="diagram-measure" /></svg>
      ) : (
        <svg viewBox="0 0 300 150" className="diagram-svg" aria-label="Force visualization"><rect x="118" y="68" width="64" height="42" rx="4" className="block" /><path d="M28 88H110" className="force-line" /><path d="M94 75L110 88L94 101" className="force-arrow" /><path d="M150 45V66" className="measure-line" /><path d="M142 54H158" className="measure-line" /><text x="36" y="73" className="diagram-text">F</text><text x="164" y="52" className="diagram-text">a</text><path d="M150 112V125" className="measure-line" /></svg>
      )}
      <div className="diagram-readout"><span>Input behavior</span><strong>{calculator.id === 'gear' ? `${formatResult(values.driven / values.driver)}× torque` : calculator.id === 'fos' ? 'Safety margin' : 'Proportional response'}</strong></div>
    </div>
  );
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All tools');
  const [selectedId, setSelectedId] = useState('force');
  const [values, setValues] = useState<Record<string, string>>({ mass: '12', acceleration: '9.81' });
  const [units, setUnits] = useState<Record<string, string>>({ mass: 'kg', acceleration: 'm/s²' });
  const [engineeringMode, setEngineeringMode] = useState(false);
  const [converterOpen, setConverterOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const selected = calculators.find(item => item.id === selectedId) ?? calculators[0];
  const numericValues = useMemo(() => Object.fromEntries(selected.fields.map(field => [field.key, Number(values[field.key]) || 0])), [selected, values]);
  const result = selected.calculate(numericValues);
  const filtered = activeCategory === 'All tools' ? calculators : calculators.filter(item => item.category === activeCategory);

  const chooseCalculator = (calculator: CalculatorConfig) => {
    setSelectedId(calculator.id);
    setValues(Object.fromEntries(calculator.fields.map(field => [field.key, field.defaultValue])));
    setUnits(Object.fromEntries(calculator.fields.map(field => [field.key, field.units[0]])));
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="nav-inner">
          <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span className="brand-mark"><Ruler size={18} /></span><span>MECH<span className="brand-accent">CALC</span></span></button>
          <div className={`nav-links ${mobileMenu ? 'open' : ''}`}><a href="#tools">Tools</a><a href="#how-it-works">How it works</a><button className="nav-convert" onClick={() => setConverterOpen(true)}><CircleGauge size={15} /> Unit converter</button></div>
          <div className="nav-actions"><span className="status-chip"><span className="status-dot" /> Engine ready</span><button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open menu">{mobileMenu ? <X size={20} /> : <Menu size={20} />}</button></div>
        </div>
      </header>

      <main>
        <section className="hero"><div className="hero-grid" /><div className="hero-inner"><div className="eyebrow"><span className="eyebrow-line" /> ENGINEERING TOOLKIT <span className="eyebrow-line" /></div><h1>Make every calculation<br /><span>move with certainty.</span></h1><p>A focused set of tools for the forces, materials, and machines behind the things we build.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}>Open calculator <ArrowRight size={16} /></button><button className="text-button" onClick={() => setEngineeringMode(true)}> <Sparkles size={15} /></button></div><div className="hero-note"><Check size={14} /> SI units by default <span /> <Check size={14} /> Clear working, every time</div></div><div className="hero-graphic"><div className="orbital orbital-one" /><div className="orbital orbital-two" /><div className="graphic-center"><span>F</span><small>∑</small></div><div className="graphic-tag tag-one">01 / FORCE</div><div className="graphic-tag tag-two">Σ = SOLVE</div><div className="axis axis-x" /><div className="axis axis-y" /></div></section>

        <section className="category-strip" id="tools"><div className="section-kicker">EXPLORE BY DISCIPLINE</div><div className="category-grid">{categories.map(category => { const Icon = category.icon; return <button key={category.name} className={`category-card ${activeCategory === category.name ? 'selected' : ''} ${category.count === 0 ? 'disabled' : ''}`} onClick={() => category.count && setActiveCategory(category.name)}><span className={`category-icon ${category.color}`}><Icon size={18} /></span><span className="category-copy"><strong>{category.name}</strong><small>{category.copy}</small></span>{category.count > 0 ? <span className="category-count">{String(category.count).padStart(2, '0')}</span> : <span className="coming">Soon</span>}</button>})}</div></section>

        <section className="workspace" id="calculator"><div className="workspace-head"><div><div className="section-kicker">{activeCategory === 'All tools' ? 'ALL CALCULATORS' : activeCategory.toUpperCase()}</div><h2>Pick a tool. Get a result.</h2></div><div className="workspace-meta"><span><span className="live-dot" /> {filtered.length} tools available</span><button className={`engineering-toggle ${engineeringMode ? 'on' : ''}`} onClick={() => setEngineeringMode(!engineeringMode)}><span className="toggle-track"><span /></span> Engineering mode</button></div></div><div className="tool-layout"><aside className="tool-list"><div className="list-search"><Calculator size={15} /><span>Choose a calculation</span></div>{filtered.map(calculator => { const Icon = calculator.icon; return <button key={calculator.id} className={`tool-item ${selected.id === calculator.id ? 'active' : ''}`} onClick={() => chooseCalculator(calculator)}><span className={`tool-icon ${calculator.accent}`}><Icon size={16} /></span><span><strong>{calculator.title}</strong><small>{calculator.formula}</small></span><ChevronDown size={15} className="tool-chevron" /></button>})}</aside><div className="calculator-panel"><div className="panel-title"><div><span className={`mini-label ${selected.accent}`}>{selected.category.toUpperCase()}</span><h3>{selected.title}</h3><p>{selected.description}</p></div><span className="formula-badge">{selected.formula}</span></div><div className="panel-body"><div className="inputs"><div className="input-heading"><span>INPUT VALUES</span><small>Enter your values below</small></div>{selected.fields.map(field => <label className="input-row" key={field.key}><span className="field-label"><b>{field.symbol}</b>{field.label}</span><span className="input-control"><input type="number" value={values[field.key] ?? field.defaultValue} onChange={event => setValues({ ...values, [field.key]: event.target.value })} /><select value={units[field.key] ?? field.units[0]} onChange={event => setUnits({ ...units, [field.key]: event.target.value })}>{field.units.map(unit => <option key={unit}>{unit}</option>)}</select></span></label>)}<button className="calculate-button" onClick={() => setValues({ ...values })}><Play size={15} fill="currentColor" /> Calculate result <span>↵</span></button></div><div className="result-column"><div className="result-card"><div className="result-top"><span>CALCULATED RESULT</span><span className="result-check"><Check size={12} /> Ready</span></div><div className="result-number">{Number.isFinite(result) ? formatResult(result) : '—'} <small>{selected.resultUnit}</small></div><div className="result-underline" /><div className="result-formula"><span>Formula used</span><strong>{selected.formula}</strong></div></div><Diagram calculator={selected} values={numericValues} /></div></div>{engineeringMode && <div className="engineering-panel"><div className="engineering-title"><span className="spark-icon"><Sparkles size={14} /></span><div><strong>Engineering mode</strong><small>Step-by-step working</small></div></div><div className="working-steps"><div><span>01</span><b>{selected.formula}</b><small>Equation</small></div><div><span>02</span><b>{selected.fields.map(field => `${field.symbol} = ${values[field.key] || '0'} ${units[field.key]}`).join('  ·  ')}</b><small>Known values</small></div><div><span>03</span><b>{selected.fields.length === 2 ? `${values[selected.fields[0].key] || '0'} × ${values[selected.fields[1].key] || '0'}` : 'Substitute values'}</b><small>Substitution</small></div><div className="final-step"><span>04</span><b>{formatResult(result)} {selected.resultUnit}</b><small>Final answer</small></div></div></div>}</div></div></section>

        <section className="principles" id="how-it-works"><div className="principles-copy"><div className="section-kicker">BUILT FOR CLARITY</div><h2>From inputs to insight,<br /><span>without the black box.</span></h2><p>Every tool shows its formula, explains the principle, and gives you a visual cue for what is happening. Because understanding the answer is as important as getting it.</p><button className="outline-button" onClick={() => setEngineeringMode(true)}>See the working <ArrowRight size={15} /></button></div><div className="principle-cards"><div className="principle-card"><span className="principle-number">01</span><div className="principle-icon"><Settings2 size={18} /></div><h3>Set your inputs</h3><p>Work in familiar SI units or switch to what your project requires.</p></div><div className="principle-card"><span className="principle-number">02</span><div className="principle-icon"><Calculator size={18} /></div><h3>Run the equation</h3><p>See the relationship between each value and the final result.</p></div><div className="principle-card"><span className="principle-number">03</span><div className="principle-icon"><FlaskConical size={18} /></div><h3>Understand the result</h3><p>Use the visual model to connect the math to the real world.</p></div></div></section>
      </main>

      <footer><div className="footer-brand"><span className="brand-mark"><Ruler size={16} /></span><strong>MECH<span>CALC</span></strong></div><span>Fundamentals, made practical.</span><span>© 2024 MechCalc</span></footer>
      {converterOpen && <UnitConverter onClose={() => setConverterOpen(false)} />}
    </div>
  );
}

function UnitConverter({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState('Length');
  const [input, setInput] = useState('1');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('mm');
  const unitSets: Record<string, string[]> = { Length: ['m', 'mm', 'cm', 'in', 'ft'], Mass: ['kg', 'g', 'lb'], Force: ['N', 'kN', 'lbf'], Pressure: ['Pa', 'kPa', 'MPa', 'psi'] };
  const factors: Record<string, Record<string, number>> = { Length: { m: 1, mm: 1000, cm: 100, in: 39.3701, ft: 3.28084 }, Mass: { kg: 1, g: 1000, lb: 2.20462 }, Force: { N: 1, kN: 0.001, lbf: 0.224809 }, Pressure: { Pa: 1, kPa: 0.001, MPa: 0.000001, psi: 0.000145038 } };
  const converted = (Number(input) || 0) * (factors[kind][to] / factors[kind][from]);
  const changeKind = (next: string) => { setKind(next); setFrom(unitSets[next][0]); setTo(unitSets[next][1]); };
  return <div className="modal-backdrop" onClick={onClose}><div className="converter-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">QUICK CONVERSION</span><h2>Unit converter</h2></div><button onClick={onClose} aria-label="Close converter"><X size={18} /></button></div><div className="converter-tabs">{Object.keys(unitSets).map(item => <button key={item} className={kind === item ? 'active' : ''} onClick={() => changeKind(item)}>{item}</button>)}</div><label className="converter-field">Value<input type="number" value={input} onChange={event => setInput(event.target.value)} /></label><div className="conversion-row"><select value={from} onChange={event => setFrom(event.target.value)}>{unitSets[kind].map(item => <option key={item}>{item}</option>)}</select><ArrowRight size={18} /><select value={to} onChange={event => setTo(event.target.value)}>{unitSets[kind].map(item => <option key={item}>{item}</option>)}</select></div><div className="conversion-result"><span>{input || '0'} {from} equals</span><strong>{formatResult(converted)} <small>{to}</small></strong></div><div className="modal-note"><Check size={14} /> Based on standard engineering conversion factors</div></div></div>;
}

export default App;
