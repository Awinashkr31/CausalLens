import { Activity, ArrowRight, BookOpen, Target, CheckCircle, Shield, Briefcase, Heart, ActivitySquare, Database, Maximize } from 'lucide-react';
/* eslint-disable react/prop-types */

export default function LandingPage({ onLaunch, onDemo }) {
  return (
    <div className="landing-container animate-fade-in">
      {/* Navbar — uses CSS class for responsive behavior */}
      <nav className="landing-nav">
        <div className="flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
          <Activity size={28} />
          <h2 style={{ margin: 0, color: 'inherit', fontWeight: 800 }}>CausalLens</h2>
        </div>
        <div className="landing-nav-links">
          <a href="#about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>About</a>
          <button className="btn-primary" onClick={onLaunch}>
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-pad text-center" style={{ marginTop: '70px' }}>
        <div className="max-w-xl">
          <h1 style={{ lineHeight: 1.1, marginBottom: '24px' }}>
            Measure the True Impact of <span className="text-gradient">Your Decisions.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', marginBottom: '40px', lineHeight: 1.6, fontWeight: 500 }}>
            Statistical rigor meets modern design. The first causal inference platform designed specifically for non-statisticians.
          </p>
          <div className="flex items-center justify-center gap-4 hero-actions">
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }} onClick={onLaunch}>
              Start Analysis <ArrowRight size={20} />
            </button>
            <button className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem', width: 'auto' }} onClick={onDemo}>
              View Demo Data
            </button>
          </div>
          
          <div className="grid-3 mt-6" style={{ marginTop: '80px' }}>
            <div className="simple-card" style={{ borderTop: '4px solid var(--success-color)' }}>
              <CheckCircle size={32} color="var(--success-color)" className="mb-4" />
              <h3 style={{ fontSize: '2rem', margin: 0 }}>95%+</h3>
              <p style={{ margin: 0, fontWeight: 600 }}>Accuracy</p>
            </div>
            <div className="simple-card" style={{ borderTop: '4px solid var(--accent-color)' }}>
              <Shield size={32} color="var(--accent-color)" className="mb-4" />
              <h3 style={{ fontSize: '2rem', margin: 0 }}>Rigorous</h3>
              <p style={{ margin: 0, fontWeight: 600 }}>Confidence Intervals</p>
            </div>
            <div className="simple-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <Database size={32} color="#8b5cf6" className="mb-4" />
              <h3 style={{ fontSize: '2rem', margin: 0 }}>Visual</h3>
              <p style={{ margin: 0, fontWeight: 600 }}>Data Abstraction</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section id="about" className="section-pad" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="grid-2 items-center">
            <div>
              <h4>The Challenge</h4>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', marginBottom: '1.5rem' }}>Correlation ≠ Causation</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Your marketing campaign launched and sales went up. But did the campaign <strong>cause</strong> the increase? Or was it seasonal trends, competitor actions, or pure coincidence?
              </p>
              <p style={{ fontSize: '1.1rem' }}>
                CausalLens helps you answer this question with statistical rigor, accounting for confounding variables that would otherwise lead to incorrect conclusions.
              </p>
            </div>
            <div className="simple-card text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
              <Maximize size={80} color="var(--accent-color)" className="mb-4" style={{ opacity: 0.8, display: 'inline-block' }} />
              <h3>Find the hidden truth in your data</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Methods Section */}
      <section className="section-pad">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="text-center mb-6" style={{ marginBottom: '60px' }}>
            <h4>Methods</h4>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>Multiple Approaches to Causal Inference</h2>
          </div>
          
          <div className="grid-2">
            <div className="simple-card flex gap-4" style={{ marginBottom: 0 }}>
              <div style={{ flexShrink: 0 }}><BookOpen size={28} color="var(--accent-color)" /></div>
              <div>
                <h3 className="mb-2">Difference-in-Differences</h3>
                <p style={{ margin: 0 }}>Compare treatment and control groups before and after intervention to isolate causal effects.</p>
              </div>
            </div>
            <div className="simple-card flex gap-4" style={{ marginBottom: 0 }}>
              <div style={{ flexShrink: 0 }}><Target size={28} color="#059669" /></div>
              <div>
                <h3 className="mb-2">Synthetic Control</h3>
                <p style={{ margin: 0 }}>Create counterfactual scenarios by extrapolating pre-intervention trends.</p>
              </div>
            </div>
            <div className="simple-card flex gap-4" style={{ marginBottom: 0 }}>
              <div style={{ flexShrink: 0 }}><ActivitySquare size={28} color="#dc2626" /></div>
              <div>
                <h3 className="mb-2">Regression Analysis</h3>
                <p style={{ margin: 0 }}>Control for confounding variables using multivariate regression techniques.</p>
              </div>
            </div>
            <div className="simple-card flex gap-4" style={{ marginBottom: 0 }}>
              <div style={{ flexShrink: 0 }}><Shield size={28} color="#8b5cf6" /></div>
              <div>
                <h3 className="mb-2">Confounding Detection</h3>
                <p style={{ margin: 0 }}>Identify and adjust for variables that may bias your causal estimates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="section-pad" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="text-center mb-6" style={{ marginBottom: '60px' }}>
            <h4>Applications</h4>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>Built for Every Domain</h2>
          </div>
          
          <div className="grid-3">
            <div className="simple-card text-center">
              <div style={{ backgroundColor: '#e0e7ff', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Briefcase size={32} color="var(--accent-color)" />
              </div>
              <h3 className="mb-4">Marketing</h3>
              <p>Measure campaign ROI and ad effectiveness accurately.</p>
            </div>
            <div className="simple-card text-center">
              <div style={{ backgroundColor: '#d1fae5', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Heart size={32} color="#059669" />
              </div>
              <h3 className="mb-4">Healthcare</h3>
              <p>Evaluate treatment outcomes and precise clinical interventions.</p>
            </div>
            <div className="simple-card text-center">
              <div style={{ backgroundColor: '#fef2f2', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <BookOpen size={32} color="#dc2626" />
              </div>
              <h3 className="mb-4">Policy</h3>
              <p>Assess regulatory program impacts and government policies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-pad text-center" style={{ backgroundColor: '#0f172a', color: 'white' }}>
        <div className="max-w-xl">
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', color: 'white', marginBottom: '24px' }}>Ready to find the truth in your data?</h2>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#cbd5e1', marginBottom: '40px' }}>
            Start analyzing with sample datasets or upload your own data. No statistics degree required.
          </p>
          <button className="btn-primary" style={{ padding: '18px 40px', fontSize: '1.2rem' }} onClick={onLaunch}>
            Get Started Now <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 5%', backgroundColor: '#020617', color: '#64748b', textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-2 mb-4" style={{ color: 'white' }}>
          <Activity size={24} />
          <h3 style={{ margin: 0, color: 'white' }}>CausalLens</h3>
        </div>
        <p>Truth Through Data. &copy; 2026</p>
      </footer>
    </div>
  );
}
