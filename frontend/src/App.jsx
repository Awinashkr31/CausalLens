import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Activity, Database, Settings2, BarChart2, AlertCircle, CheckCircle } from 'lucide-react';
import LandingPage from './LandingPage';

const API_BASE = 'http://127.0.0.1:8000';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('upload');
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

  if (currentView === 'landing') {
    return <LandingPage onLaunch={() => setCurrentView('app')} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="flex items-center gap-2 mb-6" style={{color: 'var(--accent-color)'}}>
          <Activity size={28} />
          <h2 style={{margin: 0, color: 'inherit'}}>CausalLens</h2>
        </div>
        
        <p className="mb-6" style={{fontSize: '0.9rem'}}>An easy-to-use platform for measuring impact and causal inference.</p>

        <div className="flex-col gap-2">
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={18} /> Step 1: Upload Data
          </button>
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => datasetId && setActiveTab('config')}
            disabled={!datasetId}
          >
            <Settings2 size={18} /> Step 2: Configure
          </button>
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => results && setActiveTab('results')}
            disabled={!results}
          >
            <BarChart2 size={18} /> Step 3: View Results
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        {error && (
          <div className="simple-card mb-6" style={{ borderLeft: '4px solid var(--danger-color)', backgroundColor: '#fef2f2' }}>
            <div className="flex items-center gap-2" style={{color: 'var(--danger-color)'}}>
              <AlertCircle size={20} />
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* --- UPLOAD TAB --- */}
        {activeTab === 'upload' && (
          <div className="animate-fade-in">
            <h1>Step 1: Upload Dataset</h1>
            <p className="mb-6">Upload your data in CSV format to begin analysis. You must have a treatment column and an outcome column.</p>

            <div className="simple-card" style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #cbd5e1', background: '#f8fafc' }}>
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
              <div className="simple-card mt-6 flex items-center justify-between" style={{borderLeft: '4px solid var(--success-color)', backgroundColor: '#ecfdf5'}}>
                <div className="flex items-center gap-4">
                  <CheckCircle color="var(--success-color)" size={32} />
                  <div>
                    <h4 style={{margin: 0, color: 'var(--success-color)'}}>Data Loaded Successfully</h4>
                    <p style={{margin: 0, fontSize: '0.9rem', color: '#065f46'}}>Found {rowCount} rows and {columns.length} columns.</p>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setActiveTab('config')} style={{background: 'var(--success-color)'}}>
                  Proceed to Step 2 →
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- CONFIG TAB --- */}
        {activeTab === 'config' && (
          <div className="animate-fade-in">
            <h1>Step 2: Model Configuration</h1>
            <p className="mb-6">Select which columns from your data represent the &quot;cause&quot; (treatment) and the &quot;effect&quot; (outcome).</p>
            
            <div className="grid-2">
              <div className="simple-card">
                <h3>Variables</h3>
                <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>Map your data columns to the causal model.</p>
                
                <div className="form-group">
                  <label className="form-label">1. Treatment Variable (The Cause, e.g., ad_shown=1 or 0)</label>
                  <select 
                    className="form-select" 
                    value={config.treatment} 
                    onChange={e => setConfig({...config, treatment: e.target.value})}
                  >
                    <option value="">Select Treatment Column...</option>
                    {columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">2. Outcome Variable (The Effect, e.g., sales)</label>
                  <select 
                    className="form-select" 
                    value={config.outcome} 
                    onChange={e => setConfig({...config, outcome: e.target.value})}
                  >
                    <option value="">Select Outcome Column...</option>
                    {columns.filter(c => c.name !== config.treatment).map(c => 
                      <option key={c.name} value={c.name}>{c.name}</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">3. Confounding Variables (Controls like age, income)</label>
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
                    {columns.filter(c => c.name !== config.treatment && c.name !== config.outcome).length === 0 && (
                      <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>No extra variables available</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-col gap-4">
                <div className="simple-card">
                  <h3>Statistical Methods</h3>
                  <p className="mb-4" style={{fontSize: '0.9rem'}}>Select how we should calculate the impact.</p>
                  
                  <div className="checkbox-group" style={{background: 'white', border: 'none', padding: 0}}>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={config.methods.includes('ols')} onChange={() => toggleMethod('ols')} />
                      Standard Regression (OLS)
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={config.methods.includes('psm')} onChange={() => toggleMethod('psm')} />
                      Propensity Score Matching (PSM)
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={config.methods.includes('iptw')} onChange={() => toggleMethod('iptw')} />
                      Inverse Probability Weighting (IPTW)
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={config.methods.includes('dml')} onChange={() => toggleMethod('dml')} />
                      Double Machine Learning (AI-powered)
                    </label>
                  </div>
                </div>

                <div className="simple-card" style={{border: '2px solid var(--accent-color)', background: '#eff6ff'}}>
                  <h3>Ready to Run</h3>
                  <p className="mb-4" style={{fontSize: '0.9rem', color: '#1e3a8a'}}>Check your configuration. Once you are satisfied, hit the compute button below.</p>
                  <button 
                    className="btn-primary" 
                    style={{width: '100%', padding: '14px', fontSize: '1.1rem'}} 
                    onClick={handleRunAnalysis}
                    disabled={loading || !config.treatment || !config.outcome}
                  >
                    {loading ? 'Running Estimators...' : 'Compute Impact Effect →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- RESULTS TAB --- */}
        {activeTab === 'results' && results && (
          <div className="animate-fade-in">
            <h1>Step 3: Results</h1>
            <p className="mb-6">The calculated Average Treatment Effect (ATE) represents the estimated causal impact.</p>

            <div className="simple-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Treatment Effect Table</h3>
                <span className="badge badge-numerical">ATE</span>
              </div>
              <div style={{overflowX: 'auto'}}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Statistical Method</th>
                      <th>Effect Estimate (ATE)</th>
                      <th>Standard Error</th>
                      <th>P-Value (Significance)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((res, idx) => (
                      <tr key={idx}>
                        <td style={{fontWeight: 600, color: '#1e293b'}}>{res.method}</td>
                        <td style={{color: res.ate > 0 ? '#059669' : res.ate < 0 ? '#dc2626' : '#1e293b', fontWeight: 700, fontSize: '1.1rem'}}>
                          {res.ate > 0 ? '+' : ''}{res.ate.toFixed(4)}
                        </td>
                        <td style={{color: '#64748b'}}>{res.se ? res.se.toFixed(4) : '-'}</td>
                        <td style={{color: '#64748b'}}>{res.p_value ? (res.p_value < 0.05 ? <span style={{color: '#059669', fontWeight: 'bold'}}>{res.p_value.toFixed(3)} (Sig)</span> : res.p_value.toFixed(3)) : '-'}</td>
                      </tr>
                    ))}
                    {results.results.length === 0 && (
                      <tr><td colSpan="4" style={{textAlign: 'center', color: '#94a3b8'}}>No methods ran successfully.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid-2">
              <div className="simple-card">
                <h3>Data Overlap Graph</h3>
                <p className="mt-2 mb-4" style={{fontSize: '0.9rem'}}>This chart shows if treated and control groups are comparable.</p>
                {results.diagnostics.overlap_plot ? (
                  <img 
                    src={results.diagnostics.overlap_plot} 
                    alt="Propensity Score Overlap" 
                    style={{width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0'}} 
                  />
                ) : (
                  <p>No overlap plot available.</p>
                )}
              </div>

              <div className="simple-card">
                <h3>Covariate Balance</h3>
                <p className="mt-2 mb-4" style={{fontSize: '0.9rem'}}>Ideally, Standardized Mean Differences (SMD) should be less than 0.1.</p>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="data-table" style={{marginTop: 0}}>
                    <thead>
                      <tr>
                        <th>Variable</th>
                        <th>SMD Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.diagnostics.balance.map((b, idx) => (
                        <tr key={idx}>
                          <td style={{fontWeight: 500}}>{b.Covariate}</td>
                          <td style={{color: b.SMD > 0.1 ? '#dc2626' : '#059669', fontWeight: 600}}>
                            {b.SMD.toFixed(3)} {b.SMD <= 0.1 && '✓'}
                          </td>
                        </tr>
                      ))}
                      {results.diagnostics.balance.length === 0 && (
                        <tr><td colSpan="2" style={{textAlign: 'center', color: '#94a3b8'}}>No covariates checked.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
