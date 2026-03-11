import { Activity, ArrowRight, BookOpen, Target, CheckCircle, Shield, Briefcase, Heart, ActivitySquare, Database, Maximize } from 'lucide-react';
/* eslint-disable react/prop-types */

export default function LandingPage({ onLaunch, onDemo }) {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="flex items-center justify-between" style={{ padding: '24px 48px', borderBottom: '1px solid var(--card-border)', backgroundColor: 'white' }}>
        <div className="flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
          <Activity size={32} />
          <h2 style={{ margin: 0, color: 'inherit', fontWeight: 700 }}>CausalLens</h2>
        </div>
        <div className="flex items-center gap-6">
          <a href="#about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>About</a>
          <button className="btn-primary" onClick={onLaunch}>
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '100px 48px', textAlign: 'center', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '24px' }}>
            Measure the True Impact of <span style={{ color: 'var(--accent-color)' }}>Your Decisions.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '40px', lineHeight: 1.6 }}>
            Statistical rigor meets modern design. The first causal inference platform designed specifically for non-statisticians.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }} onClick={onLaunch}>
              Start Analysis <ArrowRight size={20} />
            </button>
            <button className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }} onClick={onDemo}>
              View Demo Data
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-8" style={{ marginTop: '60px' }}>
            <div className="simple-card" style={{ flex: 1, borderTop: '4px solid var(--success-color)' }}>
              <CheckCircle size={32} color="var(--success-color)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '2rem', margin: 0 }}>95%+</h3>
              <p style={{ margin: 0, fontWeight: 500 }}>Accuracy</p>
            </div>
            <div className="simple-card" style={{ flex: 1, borderTop: '4px solid var(--accent-color)' }}>
              <Shield size={32} color="var(--accent-color)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '2rem', margin: 0 }}>Rigorous</h3>
              <p style={{ margin: 0, fontWeight: 500 }}>Confidence Intervals</p>
            </div>
            <div className="simple-card" style={{ flex: 1, borderTop: '4px solid #8b5cf6' }}>
              <Database size={32} color="#8b5cf6" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '2rem', margin: 0 }}>Visual</h3>
              <p style={{ margin: 0, fontWeight: 500 }}>Data Abstraction</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section id="about" style={{ padding: '100px 48px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="grid-2 items-center">
            <div>
              <h4 style={{ color: 'var(--accent-color)', textTransform: 'uppercase', tracking: '0.1em' }}>The Challenge</h4>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Correlation ≠ Causation</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Your marketing campaign launched and sales went up. But did the campaign <strong>cause</strong> the increase? Or was it seasonal trends, competitor actions, or pure coincidence?
              </p>
              <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                CausalLens helps you answer this question with statistical rigor, accounting for confounding variables that would otherwise lead to incorrect conclusions.
              </p>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
              <Maximize size={80} color="#94a3b8" style={{ marginBottom: '20px' }} />
              <h3 style={{ color: '#475569' }}>Find the hidden truth in your data</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Methods Section */}
      <section style={{ padding: '80px 48px', backgroundColor: '#f8fafc', borderTop: '1px solid var(--card-border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h4 style={{ color: 'var(--accent-color)', textTransform: 'uppercase' }}>Methods</h4>
            <h2 style={{ fontSize: '2.5rem' }}>Multiple Approaches to Causal Inference</h2>
          </div>
          
          <div className="grid-2">
            <div className="simple-card flex gap-4" style={{ marginBottom: 0 }}>
              <div style={{ flexShrink: 0 }}><BookOpen size={24} color="var(--accent-color)" /></div>
              <div>
                <h3 style={{ marginBottom: '8px' }}>Difference-in-Differences</h3>
                <p style={{ margin: 0 }}>Compare treatment and control groups before and after intervention to isolate causal effects.</p>
              </div>
            </div>
            <div className="simple-card flex gap-4" style={{ marginBottom: 0 }}>
              <div style={{ flexShrink: 0 }}><Target size={24} color="#059669" /></div>
              <div>
                <h3 style={{ marginBottom: '8px' }}>Synthetic Control</h3>
                <p style={{ margin: 0 }}>Create counterfactual scenarios by extrapolating pre-intervention trends.</p>
              </div>
            </div>
            <div className="simple-card flex gap-4" style={{ marginBottom: 0 }}>
              <div style={{ flexShrink: 0 }}><ActivitySquare size={24} color="#dc2626" /></div>
              <div>
                <h3 style={{ marginBottom: '8px' }}>Regression Analysis</h3>
                <p style={{ margin: 0 }}>Control for confounding variables using multivariate regression techniques.</p>
              </div>
            </div>
            <div className="simple-card flex gap-4" style={{ marginBottom: 0 }}>
              <div style={{ flexShrink: 0 }}><Shield size={24} color="#8b5cf6" /></div>
              <div>
                <h3 style={{ marginBottom: '8px' }}>Confounding Detection</h3>
                <p style={{ margin: 0 }}>Identify and adjust for variables that may bias your causal estimates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section style={{ padding: '80px 48px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--accent-color)', textTransform: 'uppercase' }}>Applications</h4>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '60px' }}>Built for Every Domain</h2>
          
          <div className="grid-3">
            <div className="simple-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#eff6ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Briefcase size={32} color="var(--accent-color)" />
              </div>
              <h3 style={{ marginBottom: '16px' }}>Marketing</h3>
              <p>Measure campaign ROI and ad effectiveness accurately.</p>
            </div>
            <div className="simple-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#ecfdf5', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Heart size={32} color="#059669" />
              </div>
              <h3 style={{ marginBottom: '16px' }}>Healthcare</h3>
              <p>Evaluate treatment outcomes and precise clinical interventions.</p>
            </div>
            <div className="simple-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#fef2f2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <BookOpen size={32} color="#dc2626" />
              </div>
              <h3 style={{ marginBottom: '16px' }}>Policy</h3>
              <p>Assess regulatory program impacts and government policies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 48px', backgroundColor: '#0f172a', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '20px' }}>Ready to find the truth in your data?</h2>
          <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '40px' }}>
            Start analyzing with sample datasets or upload your own data. No statistics degree required.
          </p>
          <button className="btn-primary" style={{ padding: '18px 40px', fontSize: '1.2rem', backgroundColor: 'var(--accent-color)' }} onClick={onLaunch}>
            Get Started Now <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 48px', backgroundColor: '#020617', color: '#64748b', textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-2 mb-4" style={{ color: 'white' }}>
          <Activity size={24} />
          <h3 style={{ margin: 0, color: 'white' }}>CausalLens</h3>
        </div>
        <p>Truth Through Data. &copy; 2026</p>
      </footer>
    </div>
  );
}
