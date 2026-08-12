import React, { useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Fingerprint,
  LockKeyhole,
  MonitorCheck,
  Orbit,
  Play,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Workflow,
  Zap
} from 'lucide-react';
import { PixelLiquidBg } from '@/components/unlumen-ui/pixel-liquid-bg';
import complyOneLogo from '../assets/complyone-logo.png';

const LANDING_DARK_PALETTE = ['#020617', '#115e59', '#164e63', '#312e81', '#f59e0b'];
const LANDING_LIGHT_PALETTE = ['#f8fafc', '#99f6e4', '#bfdbfe', '#fde68a', '#fbcfe8'];

const platformPillars = [
  {
    icon: ClipboardCheck,
    title: 'Control Library',
    text: 'Turn scattered obligations into one living system of controls, owners, mappings, and review cycles.',
    accent: '01'
  },
  {
    icon: FileSearch,
    title: 'Evidence Studio',
    text: 'Collect proof before the panic. Each artifact knows which requirement, audit, policy, and owner it belongs to.',
    accent: '02'
  },
  {
    icon: BarChart3,
    title: 'Risk Pulse',
    text: 'Watch posture change in real time with priority signals that make executive reporting feel calm.',
    accent: '03'
  }
];

const workflowSteps = [
  { title: 'Import regulations', text: 'Capture obligations from every framework.' },
  { title: 'Design controls', text: 'Map requirements into accountable work.' },
  { title: 'Collect evidence', text: 'Attach proof, cadence, and owners.' },
  { title: 'Review risk', text: 'See drift before it becomes audit pain.' },
  { title: 'Report readiness', text: 'Brief leadership with one clean source.' }
];

const orbitItems = ['SOC 2', 'ISO 27001', 'HIPAA', 'PCI DSS', 'GDPR', 'NIST'];

const Landing = ({ onLoginClick }) => {
  useEffect(() => {
    const revealItems = [...document.querySelectorAll('.landing-reveal')];
    const tiltItems = [...document.querySelectorAll('.landing-tilt')];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -60px 0px' }
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
      observer.observe(item);
    });

    const handleTilt = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      event.currentTarget.style.setProperty('--tilt-x', `${(-y * 7).toFixed(2)}deg`);
      event.currentTarget.style.setProperty('--tilt-y', `${(x * 7).toFixed(2)}deg`);
      event.currentTarget.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
    };

    const resetTilt = (event) => {
      event.currentTarget.style.setProperty('--tilt-x', '0deg');
      event.currentTarget.style.setProperty('--tilt-y', '0deg');
    };

    tiltItems.forEach((item) => {
      item.addEventListener('mousemove', handleTilt);
      item.addEventListener('mouseleave', resetTilt);
    });

    return () => {
      observer.disconnect();
      tiltItems.forEach((item) => {
        item.removeEventListener('mousemove', handleTilt);
        item.removeEventListener('mouseleave', resetTilt);
      });
    };
  }, []);

  return (
    <PixelLiquidBg
      className="landing-page"
      darkPalette={LANDING_DARK_PALETTE}
      lightPalette={LANDING_LIGHT_PALETTE}
      pixelSize={16}
      resolution={0.32}
      mouseForce={7}
      cursorSize={150}
    >
      <header className="landing-nav landing-reveal">
        <a className="landing-brand" href="#top" aria-label="ComplyOne home">
          <span className="landing-brand-mark">
            <img src={complyOneLogo} alt="" />
          </span>
          <span>
            <strong>ComplyOne</strong>
            <small>Compliance, but alive</small>
          </span>
        </a>

        <nav className="landing-nav-links" aria-label="Landing navigation">
          <a href="#platform">Platform</a>
          <a href="#motion">Motion</a>
          <a href="#workflow">Workflow</a>
          <a href="#security">Security</a>
        </nav>

        <button className="btn btn-secondary landing-nav-cta" type="button" onClick={onLoginClick}>
          Sign in <ArrowRight size={16} />
        </button>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="landing-orb landing-orb-one" />
          <div className="landing-orb landing-orb-two" />
          <div className="landing-hero-grid" aria-hidden="true" />

          <div className="landing-hero-inner">
            <div className="landing-hero-content landing-reveal">
              <span className="premium-chip landing-kicker">
                <Sparkles size={16} /> Enterprise compliance command center
              </span>
              <h1>
                Compliance that moves before the audit does.
              </h1>
              <p>
                ComplyOne turns regulations, controls, risk, evidence, policies, and audits into one kinetic workspace — precise enough for governance, lively enough for the people doing the work.
              </p>
              <div className="landing-hero-actions">
                <button className="btn btn-primary landing-primary-cta" type="button" onClick={onLoginClick}>
                  Enter workspace <ArrowRight size={19} />
                </button>
                <a className="landing-secondary-link" href="#platform">
                  <Play size={16} /> Watch the flow
                </a>
              </div>
            </div>

            <div className="landing-command-stage landing-tilt landing-reveal" aria-label="Animated compliance dashboard preview">
              <div className="landing-stage-topbar">
                <span />
                <span />
                <span />
                <strong>Readiness orbit</strong>
              </div>
              <div className="landing-radar">
                <div className="landing-radar-ring landing-radar-ring-one" />
                <div className="landing-radar-ring landing-radar-ring-two" />
                <div className="landing-radar-ring landing-radar-ring-three" />
                <div className="landing-radar-sweep" />
                <div className="landing-radar-core">
                  <ShieldCheck size={30} />
                  <strong>94%</strong>
                  <span>ready</span>
                </div>
                {orbitItems.map((item, index) => (
                  <span className={`landing-orbit-chip landing-orbit-chip-${index + 1}`} key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <div className="landing-stage-cards">
                <span><Zap size={16} /> 17 controls improved</span>
                <span><TimerReset size={16} /> 4 reviews due</span>
                <span><Fingerprint size={16} /> 128 evidence trails</span>
              </div>
            </div>
          </div>

          <div className="landing-marquee" aria-hidden="true">
            <div>
              <span>map controls</span>
              <span>collect evidence</span>
              <span>reduce drift</span>
              <span>brief leadership</span>
              <span>ship audits calmly</span>
              <span>map controls</span>
              <span>collect evidence</span>
              <span>reduce drift</span>
            </div>
          </div>
        </section>

        <section className="landing-section landing-platform" id="platform">
          <div className="landing-section-heading landing-reveal">
            <div>
              <span className="dashboard-title-eyebrow">Platform</span>
              <h2>Simple surfaces for complicated governance work.</h2>
            </div>
            <p>
              Inspired by the warmth of human-centered sites and the punch of expressive portfolios, this page gives ComplyOne its own signal: organized, alive, and unmistakably operational.
            </p>
          </div>

          <div className="landing-card-grid">
            {platformPillars.map((item) => {
              const Icon = item.icon;
              return (
                <article className="landing-feature-card landing-tilt landing-reveal" key={item.title}>
                  <span className="landing-feature-accent">{item.accent}</span>
                  <span className="landing-feature-icon"><Icon size={22} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-section landing-motion-band" id="motion">
          <div className="landing-motion-copy landing-reveal">
            <span className="dashboard-title-eyebrow">Motion system</span>
            <h2>Not decoration. Direction.</h2>
            <p>
              Scroll reveals stage the story. Hover tilt gives cards a physical feel. The liquid pixel field reacts to the cursor, so the interface feels attentive without becoming noisy.
            </p>
          </div>
          <div className="landing-bento">
            <div className="landing-bento-card landing-bento-large landing-reveal">
              <Orbit size={24} />
              <strong>Live framework orbit</strong>
              <span>Obligations loop around the workspace instead of sitting in dead spreadsheets.</span>
            </div>
            <div className="landing-bento-card landing-reveal">
              <span className="landing-pulse-dot" />
              <strong>Scroll-triggered reveals</strong>
            </div>
            <div className="landing-bento-card landing-reveal">
              <span className="landing-hover-token">hover me</span>
              <strong>Magnetic micro-interactions</strong>
            </div>
          </div>
        </section>

        <section className="landing-section landing-workflow" id="workflow">
          <div className="landing-workflow-copy landing-reveal">
            <span className="dashboard-title-eyebrow">Workflow</span>
            <h2>From regulation intake to executive calm.</h2>
            <p>
              The product flow mirrors how compliance teams actually operate: capture obligations, assign accountable work, gather proof, measure exposure, and brief leadership.
            </p>
          </div>
          <div className="landing-flow landing-reveal">
            {workflowSteps.map((step, index) => (
              <div className="landing-flow-step" key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{step.title}</strong>
                  <small>{step.text}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section landing-security" id="security">
          <div className="landing-security-panel landing-reveal">
            <div>
              <span className="dashboard-title-eyebrow">Security</span>
              <h2>Controlled access. Accountable decisions. Less audit theater.</h2>
              <p>
                Role-based navigation, authenticated API requests, evidence trails, and notification workflows keep compliance visible without making it frantic.
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

        <section className="landing-final-cta landing-reveal">
          <CheckCircle2 size={24} />
          <h2>Ready to make compliance feel like a command center?</h2>
          <p>Step in, assign the work, and let the system keep the signal moving.</p>
          <button className="btn btn-primary landing-primary-cta" type="button" onClick={onLoginClick}>
            Continue to login <ArrowRight size={19} />
          </button>
        </section>
      </main>
    </PixelLiquidBg>
  );
};

export default Landing;
