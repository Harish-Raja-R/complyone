import React from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  LockKeyhole,
  MonitorCheck,
  ShieldCheck,
  Sparkles,
  Workflow
} from 'lucide-react';
import { PixelLiquidBg } from '@/components/unlumen-ui/pixel-liquid-bg';
import complyOneLogo from '../assets/complyone-logo.png';
import dashboardPreview from '../../logo-render-check.png';

const LANDING_DARK_PALETTE = ['#020617', '#0f766e', '#164e63', '#312e81', '#ca8a04'];
const LANDING_LIGHT_PALETTE = ['#f8fafc', '#ccfbf1', '#dbeafe', '#fde68a', '#f5d0fe'];

const platformPillars = [
  {
    icon: ClipboardCheck,
    title: 'Control Library',
    text: 'Map regulations, requirements, controls, policies, and evidence into one governed operating model.'
  },
  {
    icon: FileSearch,
    title: 'Audit Readiness',
    text: 'Keep every obligation attached to owners, proof, due dates, and review trails before audit week arrives.'
  },
  {
    icon: BarChart3,
    title: 'Risk Intelligence',
    text: 'Surface priority risk movement with live posture metrics for executives and compliance teams.'
  }
];

const workflowSteps = [
  'Import regulations',
  'Assign controls',
  'Collect evidence',
  'Review risk',
  'Report readiness'
];

const Landing = ({ onLoginClick }) => {
  return (
    <PixelLiquidBg
      className="landing-page"
      darkPalette={LANDING_DARK_PALETTE}
      lightPalette={LANDING_LIGHT_PALETTE}
      pixelSize={18}
      resolution={0.3}
      mouseForce={6}
      cursorSize={140}
    >
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="ComplyOne home">
          <span className="landing-brand-mark">
            <img src={complyOneLogo} alt="" />
          </span>
          <span>
            <strong>ComplyOne</strong>
            <small>Governance OS</small>
          </span>
        </a>

        <nav className="landing-nav-links" aria-label="Landing navigation">
          <a href="#platform">Platform</a>
          <a href="#workflow">Workflow</a>
          <a href="#security">Security</a>
        </nav>

        <button className="btn btn-secondary landing-nav-cta" type="button" onClick={onLoginClick}>
          Sign in
        </button>
      </header>

      <main id="top">
        <section className="landing-hero">
          <img className="landing-hero-media" src={dashboardPreview} alt="" />
          <div className="landing-hero-overlay" />
          <div className="landing-hero-inner">
            <div className="landing-hero-content">
              <span className="premium-chip landing-kicker">
                <Sparkles size={16} /> Enterprise compliance command center
              </span>
              <h1>ComplyOne</h1>
              <p>
                A modern governance workspace for teams that need controls, risks, audits,
                tasks, policies, and evidence moving in one trusted system.
              </p>
              <div className="landing-hero-actions">
                <button className="btn btn-primary landing-primary-cta" type="button" onClick={onLoginClick}>
                  Enter workspace <ArrowRight size={19} />
                </button>
                <a className="landing-secondary-link" href="#platform">
                  Explore platform
                </a>
              </div>
            </div>
            <div className="landing-hero-metrics" aria-label="ComplyOne highlights">
              <span><strong>360</strong> control visibility</span>
              <span><strong>Live</strong> risk posture</span>
              <span><strong>Audit</strong> ready evidence</span>
            </div>
          </div>
        </section>

        <section className="landing-section landing-platform" id="platform">
          <div className="landing-section-heading">
            <span className="dashboard-title-eyebrow">Platform</span>
            <h2>Designed for compliance work that cannot afford drift.</h2>
            <p>
              ComplyOne connects day-to-day execution with board-level assurance so every team can see what is owned, late, risky, or ready.
            </p>
          </div>

          <div className="landing-card-grid">
            {platformPillars.map((item) => {
              const Icon = item.icon;
              return (
                <article className="landing-feature-card glass-panel" key={item.title}>
                  <span className="landing-feature-icon"><Icon size={22} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-section landing-workflow" id="workflow">
          <div className="landing-workflow-copy">
            <span className="dashboard-title-eyebrow">Workflow</span>
            <h2>From regulation intake to executive reporting.</h2>
            <p>
              The product flow mirrors how compliance teams actually operate: capture obligations, assign accountable work, gather proof, measure exposure, and brief leadership.
            </p>
          </div>
          <div className="landing-flow glass-panel">
            {workflowSteps.map((step, index) => (
              <div className="landing-flow-step" key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section landing-security" id="security">
          <div className="landing-security-panel">
            <div>
              <span className="dashboard-title-eyebrow">Security</span>
              <h2>Built for controlled access and accountable decisions.</h2>
              <p>
                Role-based navigation, authenticated API requests, evidence trails, and notification workflows help keep compliance work visible without making it noisy.
              </p>
            </div>
            <div className="landing-security-list">
              <span><ShieldCheck size={18} /> Role-aware workspace</span>
              <span><LockKeyhole size={18} /> Secure session flow</span>
              <span><MonitorCheck size={18} /> Live dashboard posture</span>
              <span><Workflow size={18} /> Connected audit workflow</span>
            </div>
          </div>
        </section>

        <section className="landing-final-cta">
          <CheckCircle2 size={24} />
          <h2>Ready to move from compliance tracking to compliance command?</h2>
          <button className="btn btn-primary landing-primary-cta" type="button" onClick={onLoginClick}>
            Continue to login <ArrowRight size={19} />
          </button>
        </section>
      </main>
    </PixelLiquidBg>
  );
};

export default Landing;
