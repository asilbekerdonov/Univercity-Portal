import { useEffect, useRef, useState, type FormEvent } from "react";
import { emailApi, type SendEmailRequest } from "../api/client";
/**
 * Лендинг ALFA University College (AUC).
 *
 * Специально сделан как ОДИН файл (разметка + стили + данные + логика формы)
 * по просьбе — ничего не вынесено в отдельные .css/.ts файлы.
 *
 * Форма Contact Us пока НЕ подключена к Email Service — это сознательно
 * отложено (см. TODO в handleSubmit). Сейчас форма только валидирует ввод
 * и показывает локальный статус отправки.
 */

// ---------------------------------------------------------------------------
// Данные страницы
// ---------------------------------------------------------------------------

interface School {
  id: number;
  name: string;
  short: string;
  glyph: string;
}

const SCHOOLS: School[] = [
  { id: 1, name: "School of Visual Communication", short: "Design, multimedia & visual storytelling", glyph: "◐" },
  { id: 2, name: "School of Hospitality & Tourism Management", short: "Global hospitality & tourism leadership", glyph: "◆" },
  { id: 3, name: "School of Business, Management, Technology & Accounting", short: "Business, technology & finance", glyph: "▣" },
  { id: 4, name: "School of Engineering", short: "Applied & professional engineering", glyph: "▲" },
  { id: 5, name: "School of Healthcare", short: "Clinical & allied health sciences", glyph: "✚" },
  { id: 6, name: "School of Built Environment", short: "Architecture & construction", glyph: "◫" },
  { id: 7, name: "School of Education, Language & General Studies", short: "Education & languages", glyph: "◈" },
  { id: 8, name: "Centre for Postgraduate Studies", short: "Master's & PhD programmes", glyph: "✦" },
];

interface Advantage {
  id: number;
  title: string;
  description: string;
}

const ADVANTAGES: Advantage[] = [
  {
    id: 1,
    title: "Comprehensive Curriculum",
    description:
      "From digital marketing to multimedia and UX design — programmes built around where industries are heading, not where they've been.",
  },
  {
    id: 2,
    title: "Hands-on Experience",
    description:
      "Live projects, internships and direct collaboration with companies across Malaysia and beyond.",
  },
  {
    id: 3,
    title: "Flexible Learning",
    description:
      "Full-time, part-time and online pathways designed around real schedules, not the other way round.",
  },
  {
    id: 4,
    title: "Industry Experts",
    description:
      "Taught by practitioners who still work in the field they teach — theory tested against practice.",
  },
  {
    id: 5,
    title: "Global Community",
    description:
      "Students from 40+ countries, in the same classrooms, studios and labs.",
  },
];

interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: "1900+", label: "Students on campus" },
  { value: "40+", label: "Countries represented" },
  { value: "68+", label: "Programmes offered" },
  { value: "95%", label: "Graduate employment" },
];

// ---------------------------------------------------------------------------
// Форма
// ---------------------------------------------------------------------------

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

type SubmitState = "idle" | "sending" | "sent" | "error";

const EMPTY_FORM: ContactFormData = { name: "", email: "", message: "" };

// ---------------------------------------------------------------------------
// Хук для scroll-reveal (Intersection Observer)
// ---------------------------------------------------------------------------

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  as?: "div" | "article";
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`reveal ${visible ? "reveal--visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Компонент страницы
// ---------------------------------------------------------------------------

export default function Univercity() {
  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [status, setStatus] = useState<SubmitState>("idle");
  const [menuOpen, setMenuOpen] = useState(false);

  function validate(data: ContactFormData) {
    const next: Partial<Record<keyof ContactFormData, string>> = {};
    if (!data.name.trim()) next.name = "Please tell us your name.";
    if (!data.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      next.email = "That doesn't look like a valid email.";
    }
    if (!data.message.trim()) next.message = "Let us know what you'd like to ask.";
    return next;
  }

 async function handleSubmit(e: FormEvent) {
  e.preventDefault();

  const validation = validate(form);
  setErrors(validation);
  if (Object.keys(validation).length > 0) return;

  setStatus("sending");

  try {
    const payload: SendEmailRequest = {
      to: "asilbekerdonov4@gmail.com",
      subject: `New Contact Form: ${form.name}`,
      body: `
Name: ${form.name}
Email: ${form.email}
Message: ${form.message}
      `,
      is_html: false,
    };

    const response = await emailApi.send(payload);
    
    setStatus("sent");
    setForm(EMPTY_FORM);
    console.log("✅ Email sent:", response.message_id);
    
  } catch (error) {
    console.error("❌ Error sending email:", error);
    setStatus("error");
  }
}
  function updateField(field: keyof ContactFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status === "sent" || status === "error") setStatus("idle");
  }

  return (
    <div className="auc">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

        .auc {
          --primary: #1a2332;
          --ink: #0f151f;
          --secondary: #2c3e50;
          --accent: #3498db;
          --accent-dark: #1a5276;
          --gold: #f1c40f;
          --gold-light: #f7dc6f;
          --gold-deep: #b8860b;
          --white: #ffffff;
          --gray-light: #f8f9fa;
          --gray: #6c757d;
          --text-dark: #2c3e50;
          --text-light: #ecf0f1;
          --gradient-primary: linear-gradient(135deg, #1a2332 0%, #2c3e50 100%);
          --gradient-gold: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);

          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--text-dark);
          background: var(--white);
          overflow-x: hidden;
        }

        .auc * { box-sizing: border-box; margin: 0; padding: 0; }
        .auc h1, .auc h2, .auc h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .auc a { color: inherit; text-decoration: none; }
        .auc button { font-family: inherit; cursor: pointer; border: none; }
        .auc img, .auc svg { display: block; max-width: 100%; }

        .auc .container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* --- reveal animation --- */
        .auc .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auc .reveal--visible { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .auc .reveal { transition: none; }
        }

        /* --- header --- */
        .auc .site-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(26, 35, 50, 0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(241, 196, 15, 0.15);
        }
        .auc .site-header .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 76px;
        }
        .auc .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auc .brand-mark {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--gradient-gold);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif;
          font-weight: 700;
          color: var(--ink);
          font-size: 18px;
        }
        .auc .brand-name {
          color: var(--white);
          font-family: 'Fraunces', serif;
          font-size: 18px;
          line-height: 1.1;
        }
        .auc .brand-sub {
          color: var(--gold-light);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .auc .nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
        }
        .auc .nav-links a {
          color: var(--text-light);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
          position: relative;
        }
        .auc .nav-links a:hover { color: var(--gold-light); }
        .auc .nav-cta {
          padding: 10px 22px;
          border-radius: 999px;
          background: var(--gradient-gold);
          color: var(--ink);
          font-weight: 600;
          font-size: 14px;
        }
        .auc .menu-toggle {
          display: none;
          background: none;
          color: var(--white);
          font-size: 24px;
        }

        @media (max-width: 860px) {
          .auc .nav-links, .auc .nav-cta.desktop-only { display: none; }
          .auc .menu-toggle { display: block; }
          .auc .mobile-menu {
            display: flex;
            flex-direction: column;
            gap: 4px;
            background: var(--primary);
            padding: 8px 24px 20px;
            border-bottom: 1px solid rgba(241, 196, 15, 0.15);
          }
          .auc .mobile-menu a {
            color: var(--text-light);
            padding: 12px 0;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            font-size: 15px;
          }
        }

        /* --- hero --- */
        .auc .hero {
          position: relative;
          background: var(--gradient-primary);
          color: var(--white);
          padding: 100px 0 140px;
          overflow: hidden;
        }
        .auc .hero::before {
          content: '';
          position: absolute;
          inset: -20% -10% auto auto;
          width: 640px; height: 640px;
          background: radial-gradient(circle, rgba(52,152,219,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .auc .hero-grid {
          position: relative;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 56px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .auc .hero-grid { grid-template-columns: 1fr; }
          .auc .hero-seal { margin: 0 auto; }
        }
        .auc .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 22px;
        }
        .auc .eyebrow::before {
          content: '';
          width: 28px; height: 1px;
          background: var(--gold);
        }
        .auc .hero h1 {
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          line-height: 1.08;
          margin-bottom: 22px;
        }
        .auc .hero h1 em {
          font-style: normal;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .auc .hero p.lead {
          font-size: 17px;
          line-height: 1.7;
          color: rgba(236, 240, 241, 0.82);
          max-width: 520px;
          margin-bottom: 36px;
        }
        .auc .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .auc .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 15px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .auc .btn:hover { transform: translateY(-2px); }
        .auc .btn-gold {
          background: var(--gradient-gold);
          color: var(--ink);
          box-shadow: 0 10px 30px -8px rgba(241, 196, 15, 0.5);
        }
        .auc .btn-ghost {
          border: 1px solid rgba(255,255,255,0.28);
          color: var(--white);
        }
        .auc .btn-ghost:hover { border-color: var(--gold-light); }

        /* signature element: rotating seal */
        .auc .hero-seal {
          width: 240px; height: 240px;
          position: relative;
        }
        .auc .hero-seal svg { width: 100%; height: 100%; }
        .auc .seal-ring { animation: spin 34s linear infinite; transform-origin: 50% 50%; }
        @media (prefers-reduced-motion: reduce) { .auc .seal-ring { animation: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auc .seal-core {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
        }
        .auc .seal-core .est { color: var(--gold-light); font-size: 11px; letter-spacing: 0.12em; }
        .auc .seal-core .glyph { font-family: 'Fraunces', serif; font-size: 40px; color: var(--white); }

        /* --- stats strip --- */
        .auc .stats-strip {
          position: relative;
          margin-top: -76px;
          z-index: 5;
        }
        .auc .stats-card {
          background: var(--white);
          border-radius: 20px;
          box-shadow: 0 24px 60px -20px rgba(15, 21, 31, 0.35);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 720px) {
          .auc .stats-card { grid-template-columns: repeat(2, 1fr); }
        }
        .auc .stat {
          padding: 32px 20px;
          text-align: center;
          border-right: 1px solid var(--gray-light);
        }
        .auc .stat:last-child { border-right: none; }
        .auc .stat .value {
          font-family: 'Fraunces', serif;
          font-size: 34px;
          color: var(--accent-dark);
        }
        .auc .stat .label {
          font-size: 12.5px;
          color: var(--gray);
          margin-top: 4px;
        }

        /* --- sections --- */
        .auc section { padding: 120px 0 60px; }
        .auc .section-head { max-width: 620px; margin-bottom: 56px; }
        .auc .section-head .eyebrow { color: var(--accent-dark); }
        .auc .section-head .eyebrow::before { background: var(--accent); }
        .auc .section-head h2 { font-size: clamp(1.8rem, 3.4vw, 2.5rem); color: var(--primary); }
        .auc .section-head p { color: var(--gray); margin-top: 14px; line-height: 1.7; }

        /* about numbers repeated in prose */
        .auc .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
        }
        @media (max-width: 860px) { .auc .about-grid { grid-template-columns: 1fr; } }
        .auc .about-copy p { color: var(--gray); line-height: 1.8; margin-bottom: 18px; }
        .auc .about-copy strong { color: var(--primary); }
        .auc .about-panel {
          background: var(--gradient-primary);
          border-radius: 24px;
          padding: 40px;
          color: var(--white);
        }
        .auc .about-panel ul { list-style: none; display: grid; gap: 18px; }
        .auc .about-panel li { display: flex; align-items: baseline; gap: 14px; }
        .auc .about-panel .num { font-family: 'Fraunces', serif; color: var(--gold-light); font-size: 22px; }

        /* schools grid */
        .auc .schools-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1000px) { .auc .schools-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .auc .schools-grid { grid-template-columns: 1fr; } }
        .auc .school-card {
          border: 1px solid var(--gray-light);
          border-radius: 16px;
          padding: 26px 22px;
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }
        .auc .school-card:hover {
          border-color: var(--gold);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -24px rgba(26, 35, 50, 0.3);
        }
        .auc .school-glyph {
          font-size: 22px;
          color: var(--accent-dark);
          margin-bottom: 14px;
        }
        .auc .school-card h3 { font-size: 16px; color: var(--primary); line-height: 1.35; margin-bottom: 8px; }
        .auc .school-card p { font-size: 13.5px; color: var(--gray); line-height: 1.5; }

        /* why AUC */
        .auc .why-list { display: grid; gap: 2px; background: var(--gray-light); border-radius: 18px; overflow: hidden; }
        .auc .why-item {
          background: var(--white);
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 20px;
          padding: 26px 28px;
          align-items: start;
        }
        .auc .why-index {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          color: var(--gold-deep);
        }
        .auc .why-item h3 { font-size: 17px; color: var(--primary); margin-bottom: 6px; }
        .auc .why-item p { color: var(--gray); font-size: 14.5px; line-height: 1.65; }

        /* contact */
        .auc .contact-section { background: var(--gray-light); border-radius: 28px; padding: 64px; margin: 0 24px; }
        .auc .contact-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 56px; }
        @media (max-width: 900px) { .auc .contact-grid { grid-template-columns: 1fr; } .auc .contact-section { padding: 40px 24px; margin: 0; border-radius: 0; } }
        .auc .contact-info h2 { color: var(--primary); font-size: 1.9rem; margin-bottom: 16px; }
        .auc .contact-info p { color: var(--gray); line-height: 1.7; margin-bottom: 28px; }
        .auc .contact-detail { display: flex; gap: 14px; margin-bottom: 18px; align-items: flex-start; }
        .auc .contact-detail .ico { color: var(--gold-deep); font-size: 16px; margin-top: 2px; }
        .auc .contact-detail .value { color: var(--primary); font-size: 14.5px; line-height: 1.6; }

        .auc .contact-form { background: var(--white); border-radius: 20px; padding: 36px; box-shadow: 0 20px 50px -30px rgba(15,21,31,0.4); }
        .auc .field { margin-bottom: 20px; }
        .auc .field label { display: block; font-size: 13px; font-weight: 600; color: var(--primary); margin-bottom: 8px; }
        .auc .field input, .auc .field textarea {
          width: 100%;
          padding: 13px 16px;
          border: 1px solid #dfe3e8;
          border-radius: 10px;
          font-size: 14.5px;
          font-family: inherit;
          color: var(--text-dark);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .auc .field input:focus, .auc .field textarea:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
        }
        .auc .field textarea { resize: vertical; min-height: 110px; }
        .auc .field-error { display: block; color: #c0392b; font-size: 12.5px; margin-top: 6px; }
        .auc .submit-row { display: flex; align-items: center; gap: 16px; }
        .auc .btn-submit {
          background: var(--gradient-gold);
          color: var(--ink);
          padding: 14px 30px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
        }
        .auc .btn-submit:disabled { opacity: 0.6; cursor: default; }
        .auc .form-status { font-size: 13.5px; }
        .auc .form-status.ok { color: #1e8449; }
        .auc .form-status.err { color: #c0392b; }

        /* footer */
        .auc footer { background: var(--ink); color: rgba(236,240,241,0.6); padding: 40px 0; margin-top: 60px; }
        .auc footer .container { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .auc footer .foot-brand { color: var(--gold-light); font-family: 'Fraunces', serif; }
      `}</style>

      {/* ---------- Header ---------- */}
      <header className="site-header">
        <div className="container">
          <div className="brand">
            <span className="brand-mark">AU</span>
            <div>
              <div className="brand-name">ALFA University College</div>
              <div className="brand-sub">Subang Jaya · Malaysia</div>
            </div>
          </div>

          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#schools">Schools</a></li>
            <li><a href="#why">Why AUC</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>

          <a href="#contact" className="nav-cta desktop-only">Enquire Now</a>

          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-menu">
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#schools" onClick={() => setMenuOpen(false)}>Schools</a>
            <a href="#why" onClick={() => setMenuOpen(false)}>Why AUC</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero" style={{ paddingTop: "100px" }}>
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Est. 1999 · Top 5 Private University, THE 2024</span>
            <h1>
              A global college education, <em>rooted in Malaysia.</em>
            </h1>
            <p className="lead">
              7 schools, 68+ programmes and students from 40+ countries —
              ALFA University College prepares graduates for industries that
              don't wait for textbooks to catch up.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-gold">Start your application →</a>
              <a href="#schools" className="btn btn-ghost">Explore Schools</a>
            </div>
          </div>

          <div className="hero-seal" aria-hidden="true">
            <svg viewBox="0 0 240 240">
              <defs>
                <path id="sealCircle" d="M 120,120 m -95,0 a 95,95 0 1,1 190,0 a 95,95 0 1,1 -190,0" />
              </defs>
              <g className="seal-ring">
                <circle cx="120" cy="120" r="112" fill="none" stroke="rgba(241,196,15,0.35)" strokeWidth="1" />
                <text fill="#f7dc6f" fontSize="12" letterSpacing="3">
                  <textPath href="#sealCircle" startOffset="0%">
                    ALFA UNIVERSITY COLLEGE • EST. 1999 • MALAYSIA •
                  </textPath>
                </text>
              </g>
              <circle cx="120" cy="120" r="78" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            </svg>
            <div className="seal-core">
              <span className="glyph">AU</span>
              <span className="est">SUBANG JAYA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Stats strip ---------- */}
      <div className="container stats-strip">
        <Reveal className="stats-card">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <div className="value">{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </div>

      {/* ---------- About ---------- */}
      <section id="about" className="container">
        <Reveal className="section-head">
          <span className="eyebrow">About AUC</span>
          <h2>Two decades of building careers, not just degrees</h2>
        </Reveal>

        <div className="about-grid">
          <Reveal as="div" className="about-copy">
            <p>
              Founded in <strong>1999</strong>, ALFA University College has
              grown into one of Malaysia's most internationally diverse
              campuses — home to <strong>1,900+ students</strong> from{" "}
              <strong>40+ countries</strong> and supported by a faculty of{" "}
              <strong>200+ staff</strong>.
            </p>
            <p>
              Across <strong>7 schools and a language centre</strong>, AUC
              offers <strong>68+ programmes</strong> spanning Foundation,
              Diploma, Bachelor's, Master's and PhD levels — with{" "}
              <strong>20+ MQA-accredited programmes</strong> and an{" "}
              <strong>ISO 9001:2015</strong> quality certification.
            </p>
          </Reveal>

          <Reveal as="div" className="about-panel" delay={120}>
            <ul>
              <li><span className="num">Top 5</span><span>Private University in Malaysia — THE 2024</span></li>
              <li><span className="num">95%</span><span>Graduate employment rate</span></li>
              <li><span className="num">MQA</span><span>Accredited across core programmes</span></li>
              <li><span className="num">ISO</span><span>9001:2015 certified institution</span></li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------- Schools ---------- */}
      <section id="schools" className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Schools &amp; Faculties</span>
          <h2>Seven schools. One shared standard.</h2>
          <p>Each school is built around the industry it feeds — not a shared template stretched across all of them.</p>
        </Reveal>

        <div className="schools-grid">
          {SCHOOLS.map((school, i) => (
            <Reveal as="article" className="school-card" key={school.id} delay={i * 60}>
              <div className="school-glyph">{school.glyph}</div>
              <h3>{school.name}</h3>
              <p>{school.short}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Why AUC ---------- */}
      <section id="why" className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Why AUC</span>
          <h2>What actually makes the difference</h2>
        </Reveal>

        <div className="why-list">
          {ADVANTAGES.map((a, i) => (
            <Reveal as="div" className="why-item" key={a.id} delay={i * 50}>
              <span className="why-index">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="container">
        <div className="contact-section">
          <div className="contact-grid">
            <Reveal as="div" className="contact-info">
              <span className="eyebrow" style={{ color: "var(--accent-dark)" }}>Get in touch</span>
              <h2>Have a question before you apply?</h2>
              <p>
                Send us a message and our admissions team will get back to
                you — usually within one working day.
              </p>

              <div className="contact-detail">
                <span className="ico">📍</span>
                <span className="value">No. 8, Jalan SS15/8, 47500 Subang Jaya, Selangor, Malaysia</span>
              </div>
              <div className="contact-detail">
                <span className="ico">☎</span>
                <span className="value">+603-5621 2345</span>
              </div>
              <div className="contact-detail">
                <span className="ico">✉</span>
                <span className="value">info@alfa.edu.my</span>
              </div>
            </Reveal>

            <Reveal as="div" className="contact-form" delay={100}>
              <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="auc-name">Name</label>
                  <input
                    id="auc-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    autoComplete="name"
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="field">
                  <label htmlFor="auc-email">Email</label>
                  <input
                    id="auc-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    autoComplete="email"
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="field">
                  <label htmlFor="auc-message">Message</label>
                  <textarea
                    id="auc-message"
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                  />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                </div>

                <div className="submit-row">
                  <button type="submit" className="btn-submit" disabled={status === "sending"}>
                    {status === "sending" ? "Sending…" : "Send Message"}
                  </button>

                  {status === "sent" && (
                    <span className="form-status ok">Thanks — we'll be in touch shortly.</span>
                  )}
                  {status === "error" && (
                    <span className="form-status err">Something went wrong. Please try again.</span>
                  )}
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer>
        <div className="container">
          <span><span className="foot-brand">ALFA</span> University College</span>
          <span>© {new Date().getFullYear()} ALFA University College. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}