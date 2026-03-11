import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Activity, Database, Settings2, BarChart2, AlertCircle, CheckCircle, Info } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [datasetId, setDatasetId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  
  const [config, setConfig] = useState({
    treatment: '',
    outcome: '',
    covariates: [],
    methods: ['ols', 'psm', 'iptw'] // defaults
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDatasetId(res.data.dataset_id);
      setColumns(res.data.columns);
      setRowCount(res.data.rows);
      setActiveTab('config');
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!config.treatment || !config.outcome) {
      setError("Please select treatment and outcome variables.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const payload = {
        dataset_id: datasetId,
        ...config
      };
      
      const res = await axios.post(`${API_BASE}/analyze/`, payload);
      setResults(res.data);
      setActiveTab('results');
    } catch (err) {
      setError(err.response?.data?.detail || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleCovariate = (colName) => {
    setConfig(prev => {
      const covs = prev.covariates.includes(colName) 
        ? prev.covariates.filter(c => c !== colName)
        : [...prev.covariates, colName];
      return { ...prev, covariates: covs };
    });
  };

  const toggleMethod = (method) => {
    setConfig(prev => {
      const meths = prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method];
      return { ...prev, methods: meths };
    });
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={28} color="#6366f1" />
          <h2>CausalLens</h2>
        </div>
        
        <p className="mb-6" style={{fontSize: '0.85rem'}}>Platform for rigorous causal inference and evaluating interventions.</p>

        <div className="flex-col gap-2">
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
            style={{borderColor: activeTab === 'about' ? '#6366f1' : 'transparent', textAlign: 'left', display: 'flex'}}
          >
            <Info size={18} /> Methodology
          </button>
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
            style={{borderColor: activeTab === 'upload' ? '#6366f1' : 'transparent', textAlign: 'left', display: 'flex'}}
          >
            <UploadCloud size={18} /> Data Ingestion
          </button>
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => datasetId && setActiveTab('config')}
            disabled={!datasetId}
            style={{borderColor: activeTab === 'config' ? '#6366f1' : 'transparent', textAlign: 'left', display: 'flex'}}
          >
            <Settings2 size={18} /> Model Config
          </button>
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => results && setActiveTab('results')}
            disabled={!results}
            style={{borderColor: activeTab === 'results' ? '#6366f1' : 'transparent', textAlign: 'left', display: 'flex'}}
          >
            <BarChart2 size={18} /> View Results
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        {error && (
          <div className="glass-card mb-6" style={{ borderLeft: '4px solid var(--danger-color)' }}>
            <div className="flex items-center gap-2" style={{color: 'var(--danger-color)'}}>
              <AlertCircle size={20} />
              <strong style={{color: 'white'}}>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* --- ABOUT TAB --- */}
        {activeTab === 'about' && (
          <div className="animate-fade-in">
            <h1>About CausalLens</h1>
            <p className="mb-6" style={{fontSize: '1.1rem'}}>
              CausalLens is a causal inference platform designed to help researchers, analysts, and decision-makers measure the true impact of interventions while accounting for confounding variables.
            </p>
            
            <div className="glass-card mb-6">
              <h3>What We Do</h3>
              <p className="mt-2 text-primary">
                Whether you&apos;re measuring marketing campaign effectiveness, healthcare treatment outcomes, or policy impacts, our platform provides rigorous statistical methods in an accessible interface.
              </p>
            </div>

            <h2 className="mt-6 mb-4">Statistical Methods</h2>
            <div className="grid-3 mb-6">
              <div className="glass-card">
                <h4 style={{color: '#a5b4fc', marginBottom: '8px'}}>Difference-in-Differences (DiD)</h4>
                <p style={{fontSize: '0.9rem', marginBottom: '12px'}}>
                  Compares changes in outcomes over time between a treatment group and a control group. Controls for time-invariant differences and common trends.
                </p>
                <div className="badge badge-numerical">Best for: Time-series data</div>
              </div>

              <div className="glass-card">
                <h4 style={{color: '#6ee7b7', marginBottom: '8px'}}>Synthetic Control Method</h4>
                <p style={{fontSize: '0.9rem', marginBottom: '12px'}}>
                  Creates a synthetic counterfactual by extrapolating pre-intervention trends. Answers: &quot;What would have happened without the intervention?&quot;
                </p>
                <div className="badge badge-categorical">Best for: Single treated unit</div>
              </div>

              <div className="glass-card">
                <h4 style={{color: '#fca5a5', marginBottom: '8px'}}>Regression with Controls</h4>
                <p style={{fontSize: '0.9rem', marginBottom: '12px'}}>
                  Standard OLS regression controlling for observed confounders. Isolates treatment effects by adjusting for other variables.
                </p>
                <div className="badge badge-numerical" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5'}}>Best for: Cross-sectional data</div>
              </div>
            </div>

            <div className="glass-card mb-6" style={{borderLeft: '4px solid #8b5cf6'}}>
              <h3 style={{marginBottom: '12px'}}>Understanding Confounding Variables</h3>
              <p style={{marginBottom: '12px'}}>
                A confounding variable influences both the treatment and the outcome, potentially creating spurious associations. For example:
              </p>
              <ul style={{marginLeft: '24px', marginBottom: '16px', color: 'var(--text-secondary)'}}>
                <li style={{marginBottom: '8px'}}>Age might affect both treatment assignment and recovery time in healthcare.</li>
                <li style={{marginBottom: '8px'}}>Seasonal trends might coincide with marketing campaigns.</li>
                <li style={{marginBottom: '8px'}}>Economic conditions might influence policy implementation and outcomes.</li>
              </ul>
              <p>
                Our platform helps you identify and adjust for these confounders using appropriate statistical techniques.
              </p>
            </div>

            <h2 className="mt-6 mb-4">Getting Started</h2>
            <div className="grid-2 mb-6">
              <ol style={{paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: '2'}}>
                <li>Upload your data or select a sample dataset.</li>
                <li>Choose your analysis method based on your data structure.</li>
                <li>Define your outcome variable and treatment indicator.</li>
                <li>Specify control variables to adjust for confounding.</li>
                <li>Review results with visualizations and statistical summaries.</li>
                <li>Get recommendations on interpretation and causal validity.</li>
              </ol>
            </div>

            <button className="btn-primary mt-4" onClick={() => setActiveTab('upload')}>
              Start Your Analysis →
            </button>
          </div>
        )}

        {/* --- UPLOAD TAB --- */}
        {activeTab === 'upload' && (
          <div className="animate-fade-in">
            <h1>Upload Dataset</h1>
            <p className="mb-6">Upload your observational or experimental data (CSV format) to begin analysis.</p>

            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', borderStyle: 'dashed' }}>
              <Database size={48} color="#94a3b8" style={{margin: '0 auto 16px'}} />
              <h3>Select a CSV File</h3>
              <p className="mb-4">Dataset should contain unit IDs, treatment indicator, covariates, and outcomes.</p>
              
              <label className="btn-primary" style={{cursor: 'pointer'}}>
                {loading ? 'Uploading...' : 'Browse Files'}
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload} 
                  style={{display: 'none'}} 
                  disabled={loading}
                />
              </label>
            </div>

            {datasetId && (
              <div className="glass-card mt-6 flex items-center justify-between" style={{borderLeft: '4px solid var(--success-color)'}}>
                <div className="flex items-center gap-2">
                  <CheckCircle color="var(--success-color)" size={24} />
                  <div>
                    <h4 style={{margin: 0}}>Dataset Loaded Successfully</h4>
                    <p style={{margin: 0, fontSize: '0.85rem'}}>{rowCount} observations across {columns.length} columns</p>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setActiveTab('config')}>
                  Proceed to Configuration →
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- CONFIG TAB --- */}
        {activeTab === 'config' && (
          <div className="animate-fade-in">
            <h1>Model Configuration</h1>
            <p className="mb-6">Define the causal graph by specifying the treatment, outcome, and confounding covariates.</p>
            
            <div className="grid-2">
              <div className="glass-card">
                <h3>Variables</h3>
                <div className="form-group mt-4">
                  <label className="form-label">Treatment Indicator (0/1)</label>
                  <select 
                    className="form-select" 
                    value={config.treatment} 
                    onChange={e => setConfig({...config, treatment: e.target.value})}
                  >
                    <option value="">Select Treatment...</option>
                    {columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Outcome Variable (Y)</label>
                  <select 
                    className="form-select" 
                    value={config.outcome} 
                    onChange={e => setConfig({...config, outcome: e.target.value})}
                  >
                    <option value="">Select Outcome...</option>
                    {columns.filter(c => c.name !== config.treatment).map(c => 
                      <option key={c.name} value={c.name}>{c.name}</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pre-Treatment Covariates (Confounders)</label>
                  <div className="glass-card" style={{ maxHeight: '200px', overflowY: 'auto', padding: '12px' }}>
                    <div className="checkbox-group">
                      {columns
                        .filter(c => c.name !== config.treatment && c.name !== config.outcome)
                        .map(c => (
                        <label key={c.name} className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={config.covariates.includes(c.name)}
                            onChange={() => toggleCovariate(c.name)}
                          />
                          {c.name} <span className={`badge ${c.type === 'numeric' ? 'badge-numerical' : 'badge-categorical'}`}>{c.type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-col gap-4">
                <div className="glass-card">
                  <h3>Estimator Selection</h3>
                  <p className="mb-4" style={{fontSize: '0.85rem'}}>Select which identification strategies to unbias the estimates.</p>
                  
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={config.methods.includes('ols')} onChange={() => toggleMethod('ols')} />
                      OLS with Covariate Adjustment
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={config.methods.includes('psm')} onChange={() => toggleMethod('psm')} />
                      Propensity Score Matching (1:1 NN)
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={config.methods.includes('iptw')} onChange={() => toggleMethod('iptw')} />
                      Inverse Probability of Treatment Weighting
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={config.methods.includes('dml')} onChange={() => toggleMethod('dml')} />
                      Double Machine Learning (EconML)
                    </label>
                  </div>
                </div>

                <div className="glass-card" style={{background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)'}}>
                  <h3>Execute Pipeline</h3>
                  <p className="mb-4" style={{fontSize: '0.85rem'}}>This will train the models in the backend and compute the ATE alongside diagnostic tests.</p>
                  <button 
                    className="btn-primary" 
                    style={{width: '100%'}} 
                    onClick={handleRunAnalysis}
                    disabled={loading || !config.treatment || !config.outcome || config.covariates.length === 0}
                  >
                    {loading ? 'Running Estimators...' : 'Compute Causal Impact'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- RESULTS TAB --- */}
        {activeTab === 'results' && results && (
          <div className="animate-fade-in">
            <h1>Causal Analysis Results</h1>
            <p className="mb-6">Average Treatment Effect (ATE) estimates and diagnostic evaluations.</p>

            <div className="glass-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Treatment Effect Estimates</h3>
                <span className="badge badge-numerical">ATE</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>ATE Estimate</th>
                    <th>Standard Error</th>
                    <th>P-Value</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((res, idx) => (
                    <tr key={idx}>
                      <td style={{fontWeight: 500}}>{res.method}</td>
                      <td style={{color: res.ate > 0 ? '#6ee7b7' : res.ate < 0 ? '#fca5a5' : 'white', fontWeight: 600}}>
                        {res.ate.toFixed(4)}
                      </td>
                      <td>{res.se ? res.se.toFixed(4) : '-'}</td>
                      <td>{res.p_value ? (res.p_value < 0.001 ? '< 0.001' : res.p_value.toFixed(3)) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid-2">
              <div className="glass-card">
                <h3>Propensity Score Overlap</h3>
                <p className="mt-2 mb-4">Verifying the Common Support Assumption.</p>
                {results.diagnostics.overlap_plot && (
                  <img 
                    src={results.diagnostics.overlap_plot} 
                    alt="Propensity Score Overlap" 
                    style={{width: '100%', borderRadius: '8px', background: 'white'}} 
                  />
                )}
              </div>

              <div className="glass-card">
                <h3>Covariate Balance (SMD)</h3>
                <p className="mt-2 mb-4">Standardized Mean Differences (pre-matching).</p>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Covariate</th>
                        <th>SMD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.diagnostics.balance.map((b, idx) => (
                        <tr key={idx}>
                          <td>{b.Covariate}</td>
                          <td style={{color: b.SMD > 0.1 ? '#fca5a5' : '#6ee7b7'}}>
                            {b.SMD.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4" style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                  * Rule of thumb: SMD &lt; 0.1 indicates well-balanced covariates.
                </p>
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
