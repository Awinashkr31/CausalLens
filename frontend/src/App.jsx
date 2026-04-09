import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Activity, Database, Settings2, BarChart2, AlertCircle, CheckCircle, ActivitySquare, Menu, X } from 'lucide-react';
import LandingPage from './LandingPage';

// In production, frontend is served by FastAPI on the same origin.
// In development, use Vite proxy (configured in vite.config.js).
const API_BASE = '';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('upload');
  const [datasetId, setDatasetId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [config, setConfig] = useState({
    treatment: '',
    outcome: '',
    covariates: [],
    methods: ['ols', 'psm', 'iptw'], // defaults
    subgroup_variable: '',
    hyperparameters: {
      psm_n_neighbors: 1,
      psm_caliper: 0.1,
      dml_n_estimators: 50,
      dml_max_depth: 5
    }
  });


  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Close mobile menu when navigating
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

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
      
      // Auto-select variables if heuristic guesses exist or aggressively select covariates
      let defaultTreatment = res.data.defaults ? res.data.defaults.treatment : '';
      let defaultOutcome = res.data.defaults ? res.data.defaults.outcome : '';
      let defaultCovariates = res.data.defaults ? res.data.defaults.covariates : [];

      // If no covariates were guessed, aggressively select all available numeric columns
      if (!defaultCovariates || defaultCovariates.length === 0) {
          defaultCovariates = res.data.columns
              .filter(c => c.type === 'numeric' && c.name !== defaultTreatment && c.name !== defaultOutcome)
              .map(c => c.name);
      }

      setConfig(prev => ({
        ...prev,
        treatment: defaultTreatment || '',
        outcome: defaultOutcome || '',
        covariates: defaultCovariates || [],
        subgroup_variable: res.data.defaults?.subgroup || ''
      }));

      setActiveTab('config');
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/demo/`);
      setDatasetId(res.data.dataset_id);
      setColumns(res.data.columns);
      setRowCount(res.data.rows);
      
      // Auto-select variables if defaults exist
      if (res.data.defaults) {
        setConfig(prev => ({
          ...prev,
          treatment: res.data.defaults.treatment,
          outcome: res.data.defaults.outcome,
          covariates: res.data.defaults.covariates,
          subgroup_variable: res.data.defaults.subgroup || ''
        }));
      }


      setActiveTab('config');
      setCurrentView('app');
    } catch (err) {
      setError(err.response?.data?.detail || "Demo load failed");
      setCurrentView('app');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!config.treatment) {
      setError("Please select a Treatment Variable (The Cause).");
      return;
    }
    if (!config.outcome) {
      setError("Please select an Outcome Variable (The Effect).");
      return;
    }
    if (config.covariates.length === 0) {
      setError("Please select at least one Confounding Variable (Control) to ensure a fair comparison.");
      return;
    }
    if (config.methods.length === 0) {
      setError("Please select at least one Statistical Method to run.");
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
    return <LandingPage onLaunch={() => setCurrentView('app')} onDemo={handleLoadDemo} />;
  }

  return (
    <div className="app-container animate-fade-in">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="flex items-center gap-2" style={{color: 'var(--accent-color)'}}>
          <Activity size={24} />
          <h3 style={{margin: 0, color: 'inherit', fontWeight: 800}}>CausalLens</h3>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay visible" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="flex items-center gap-2 mb-6" style={{color: 'var(--accent-color)'}}>
          <Activity size={28} />
          <h2 style={{margin: 0, color: 'inherit', fontWeight: 800, fontSize: '1.4rem'}}>CausalLens</h2>
        </div>
        
        <p className="mb-6" style={{fontSize: '0.9rem'}}>An easy-to-use platform for measuring causal impact.</p>

        <div className="flex-col gap-2">
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('upload')}
          >
            <UploadCloud size={18} /> Step 1: Upload Data
          </button>
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => datasetId && handleTabSwitch('config')}
            disabled={!datasetId}
          >
            <Settings2 size={18} /> Step 2: Configure
          </button>
          <button 
            className={`btn-secondary flex items-center gap-2 ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => results && handleTabSwitch('results')}
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
            <div className="flex items-center gap-2" style={{color: 'var(--danger-color)', flexWrap: 'wrap'}}>
              <AlertCircle size={20} style={{flexShrink: 0}} />
              <strong>Error:</strong> <span>{error}</span>
            </div>
          </div>
        )}

        {/* --- UPLOAD TAB --- */}
        {activeTab === 'upload' && (
          <div className="animate-fade-in">
            <h1>Step 1: Upload Dataset</h1>
            <p className="mb-6">Upload your data in CSV format to begin analysis. You must have a treatment column and an outcome column.</p>

            <div className="simple-card" style={{ textAlign: 'center', padding: 'clamp(30px, 5vw, 60px) 20px', border: '2px dashed #cbd5e1', background: '#f8fafc' }}>
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
              <div className="simple-card mt-6 flex items-center gap-4" style={{borderLeft: '4px solid var(--success-color)', backgroundColor: '#ecfdf5', flexWrap: 'wrap', justifyContent: 'space-between'}}>
                <div className="flex items-center gap-4" style={{minWidth: 0}}>
                  <CheckCircle color="var(--success-color)" size={32} style={{flexShrink: 0}} />
                  <div>
                    <h4 style={{margin: 0, color: 'var(--success-color)'}}>Data Loaded Successfully</h4>
                    <p style={{margin: 0, fontSize: '0.9rem', color: '#065f46'}}>Found {rowCount} rows and {columns.length} columns.</p>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setActiveTab('config')} style={{background: 'var(--success-color)', flexShrink: 0}}>
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
                  <label className="form-label">2.5 Subgroup Analysis (Optional: Compare impact across segments)</label>
                  <select 
                    className="form-select" 
                    value={config.subgroup_variable} 
                    onChange={e => setConfig({...config, subgroup_variable: e.target.value})}
                  >
                    <option value="">None (Run for Everyone)</option>
                    {columns.filter(c => c.name !== config.treatment && c.name !== config.outcome).map(c => 
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
                        <span>{c.name}</span> <span className={`badge ${c.type === 'numeric' ? 'badge-numerical' : 'badge-categorical'}`}>{c.type}</span>
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

                <div className="simple-card">
                  <h3>Advanced Settings</h3>
                  <p className="mb-4" style={{fontSize: '0.9rem'}}>Tweak hyperparameters for the selected models.</p>
                  
                  {config.methods.includes('psm') && (
                    <div className="form-group mb-4">
                      <label className="form-label" style={{fontSize: '0.85rem'}}>PSM: Number of Nearest Neighbors</label>
                      <input 
                        type="number" 
                        min="1" 
                        className="form-select" 
                        value={config.hyperparameters.psm_n_neighbors} 
                        onChange={e => setConfig({...config, hyperparameters: {...config.hyperparameters, psm_n_neighbors: parseInt(e.target.value) || 1}})}
                        style={{padding: '8px'}}
                      />
                    </div>
                  )}

                  {config.methods.includes('dml') && (
                    <div className="form-group">
                      <label className="form-label" style={{fontSize: '0.85rem'}}>DML: Random Forest Max Depth</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="20"
                        className="form-select" 
                        value={config.hyperparameters.dml_max_depth} 
                        onChange={e => setConfig({...config, hyperparameters: {...config.hyperparameters, dml_max_depth: parseInt(e.target.value) || 5}})}
                        style={{padding: '8px'}}
                      />
                    </div>
                  )}
                  {!(config.methods.includes('psm') || config.methods.includes('dml')) && (
                    <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>No advanced settings for current selection.</span>
                  )}
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

            {/* --- Key Takeaway / Plain English Translation --- */}
            {(() => {
              const validResults = results.results.filter(r => r.ate !== null && !isNaN(r.ate));
              if (validResults.length === 0) return null;
              
              const avgAte = validResults.reduce((sum, r) => sum + r.ate, 0) / validResults.length;
              const isPositive = avgAte > 0;
              const isSignificant = validResults.some(r => r.p_value !== null && r.p_value < 0.05);
              const magnitude = Math.abs(avgAte).toFixed(2);
              
              let conclusion = "";
              if (isPositive) {
                conclusion = `On average across all statistical models, applying "${config.treatment}" causes "${config.outcome}" to INCREASE by approximately ${magnitude} units.`;
              } else if (avgAte < 0) {
                conclusion = `On average across all statistical models, applying "${config.treatment}" causes "${config.outcome}" to DECREASE by approximately ${magnitude} units.`;
              } else {
                conclusion = `On average, applying "${config.treatment}" has exactly ZERO causal impact on "${config.outcome}".`;
              }

              return (
                <div className="simple-card mb-6" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderLeft: isPositive ? '6px solid var(--success-color)' : '6px solid var(--danger-color)' }}>
                  <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <ActivitySquare size={24} color={isPositive ? "var(--success-color)" : "var(--danger-color)"} /> 
                    Key Takeaway
                  </h3>
                  <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 500, color: '#1e293b', marginBottom: '8px' }}>
                    {conclusion}
                  </p>
                  <p style={{ fontSize: '1rem', color: '#64748b', margin: 0 }}>
                    {isSignificant 
                      ? "The data shows strong statistical significance (P-Value < 0.05), meaning you can be highly confident this effect is real and not just a coincidence."
                      : "We recommend reviewing the Confidence Intervals below; some models did not find strong statistical significance, meaning the true effect might vary."}
                  </p>
                </div>
              );
            })()}

            {/* --- Sensitivity Analysis / Robustness Check --- */}
            {results.diagnostics.refutation && (
              <div className="simple-card mb-6" style={{ borderLeft: '6px solid #6366f1', background: '#f5f3ff' }}>
                <h3 style={{ marginBottom: '8px', color: '#4338ca' }}>Robustness Check (Sensitivity Analysis)</h3>
                <p style={{ margin: 0, fontSize: '1rem', color: '#3730a3' }}>
                  {results.diagnostics.refutation.is_robust 
                    ? `✅ PASSED: Our "Random Noise Test" confirms your results are stable. Adding random variables to the model changed the impact by only ${(results.diagnostics.refutation.pct_change * 100).toFixed(1)}%, which is well within safe limits.`
                    : `⚠️ CAUTION: Your results might be sensitive to hidden factors. Adding random noise changed the impact by ${(results.diagnostics.refutation.pct_change * 100).toFixed(1)}%, which exceeds our 20% stability threshold.`}
                </p>
              </div>
            )}

            <div className="simple-card mb-6">
              <div className="flex items-center justify-between mb-4" style={{flexWrap: 'wrap', gap: '8px'}}>
                <h3 style={{margin: 0}}>Treatment Effect Table</h3>
                <span className="badge badge-numerical">ATE</span>
              </div>
              <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '8px'}}>
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
                        {res.error ? (
                          <td colSpan="3" style={{color: '#dc2626', fontWeight: 500, fontSize: '0.95rem', background: '#fef2f2'}}>
                            ⚠️ Failed: {res.error}
                          </td>
                        ) : (
                          <>
                            <td style={{color: res.ate > 0 ? '#059669' : res.ate < 0 ? '#dc2626' : '#1e293b', fontWeight: 700, fontSize: '1.1rem'}}>
                              {res.ate > 0 ? '+' : ''}{res.ate.toFixed(4)}
                            </td>
                            <td style={{color: '#64748b'}}>{res.se ? res.se.toFixed(4) : '-'}</td>
                            <td style={{color: '#64748b'}}>{res.p_value ? (res.p_value < 0.05 ? <span style={{color: '#059669', fontWeight: 'bold'}}>{res.p_value.toFixed(3)} (Sig)</span> : res.p_value.toFixed(3)) : '-'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                    {results.results.length === 0 && (
                      <tr><td colSpan="4" style={{textAlign: 'center', color: '#94a3b8'}}>No methods ran successfully.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="simple-card mb-6">
              <h3>Covariate Balance</h3>
              <p className="mt-2 mb-4" style={{fontSize: '0.9rem'}}>Ideally, Standardized Mean Differences (SMD) should be less than 0.1.</p>
              <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '8px' }}>
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

            {/* --- Subgroup Analysis Results --- */}
            {results.subgroup_results && results.subgroup_results.length > 0 && (
              <div className="simple-card mb-6">
                <h3 style={{ marginBottom: '16px' }}>Impact by Segment ({config.subgroup_variable})</h3>
                <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '8px'}}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Group / Segment</th>
                        <th>Effect (ATE)</th>
                        <th>Significance</th>
                        <th>Sample Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.subgroup_results.map((sg, idx) => (
                        <tr key={idx}>
                          <td style={{fontWeight: 600}}>{sg.subgroup}</td>
                          <td style={{color: sg.ate > 0 ? '#059669' : '#dc2626', fontWeight: 700}}>
                            {sg.ate > 0 ? '+' : ''}{sg.ate.toFixed(3)}
                          </td>
                          <td>
                            {sg.p_value < 0.05 ? <span className="badge badge-numerical" style={{background: '#ecfdf5', color: '#065f46'}}>Significant</span> : <span className="badge" style={{background: '#f1f5f9', color: '#64748b'}}>Neutral</span>}
                          </td>
                          <td style={{color: '#64748b'}}>{sg.sample_size} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* --- Diagnostic Summary / Plain English Translation --- */}
            {(() => {
              const balances = results.diagnostics.balance;
              if (!balances || balances.length === 0) return null;
              
              const totalCovs = balances.length;
              const imbalancedCovs = balances.filter(b => b.SMD > 0.1);
              const isBalanced = imbalancedCovs.length === 0;

              return (
                <div className="simple-card mb-6" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ marginBottom: '8px', color: '#334155' }}>Diagnostic Conclusion</h3>
                  {isBalanced ? (
                    <p style={{ margin: 0, color: '#065f46' }}>
                      <strong>Excellent Data Quality:</strong> Your Treated and Control groups are beautifully balanced across all <strong>{totalCovs}</strong> confounding variables. 
                      Because there are no major differences between the two groups (no Standardized Mean Differences over 0.1), you can be highly confident that the calculated causal impact is accurate and not biased by underlying differences in the populations.
                    </p>
                  ) : (
                     <p style={{ margin: 0, color: '#991b1b' }}>
                      <strong>Warning - Potential Bias:</strong> We found that <strong>{imbalancedCovs.length}</strong> out of {totalCovs} confounding variables are <strong>not balanced</strong> between your Treated and Control groups ({imbalancedCovs.map(c => c.Covariate).join(', ')}). 
                      <br/><br/>
                      Because the populations differ significantly on these metrics, the pure Average Treatment Effect might be slightly biased. Our advanced models (like Propensity Score Matching) attempt to adjust for this mathematically, but you should interpret the final causal impact with some caution.
                    </p>
                  )}
                </div>
              );
            })()}

          </div>
        )}

      </div>
    </div>
  );
}

export default App;
