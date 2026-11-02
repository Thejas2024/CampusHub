import React from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  Globe,
  GraduationCap,
  Linkedin,
  PlayCircle,
  Code2,
  BrainCircuit,
  Coffee,
  Braces,
  BriefcaseBusiness,
  UsersRound,
  Star,
} from 'lucide-react';

import SectionHeading from '../components/SectionHeading.jsx';
import { jobs } from '../data/demoData.js';

const popular = [
  {
    icon: Code2,
    title: 'Full Stack Web Development',
    meta: '12 Weeks',
    level: 'Beginner to Advanced',
    tone: 'purple',
  },
  {
    icon: BrainCircuit,
    title: 'Data Science & AI',
    meta: '10 Weeks',
    level: 'Beginner to Advanced',
    tone: 'blue',
  },
  {
    icon: Coffee,
    title: 'Java Development',
    meta: '8 Weeks',
    level: 'Beginner to Advanced',
    tone: 'orange',
  },
  {
    icon: Braces,
    title: 'Python Programming',
    meta: '8 Weeks',
    level: 'Beginner to Advanced',
    tone: 'green',
  },
];

export default function Home() {
  return (
    <main>
      <section
        className="landing-hero page-width"
        id="home"
      >
        <div className="hero-copy">
          <div className="hero-badge">
            <Linkedin size={13} />
            India's Leading Student Learning & Placement Portal
          </div>

          <h1>
            Launch Your Dream Career With{' '}
            <span>CampusHub</span>
          </h1>

          <p className="hero-description">
            Your learning and placement companion. Build
            industry-ready skills, discover career opportunities,
            and take the next step toward your future.
          </p>

          <div className="hero-buttons">
            <a
              className="button-primary"
              href="#courses"
            >
              <Globe size={16} />
              Explore Courses
            </a>

            {/* DCL Portal now routes to the login page */}
            <Link
              className="button-outline"
              to="/login"
            >
              <GraduationCap size={16} />
              DCL Portal
              <ArrowRight size={15} />
            </Link>

            <Link
              className="button-outline"
              to="/login"
            >
              <GraduationCap size={16} />
              Campus Login
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="app-download">
            <span>YOUR CAREER STARTS HERE</span>
            <i />
            <span>Learn · Practice · Get placed</span>
          </div>

          <div className="hero-stats">
            <div>
              <strong>95%</strong>
              <small>Placement rate*</small>
            </div>

            <div>
              <strong>4.8K+</strong>
              <small>Hiring partners*</small>
            </div>

            <div>
              <strong>4.8★</strong>
              <small>Student rating*</small>
            </div>
          </div>

          <small className="demo-disclaimer">
            *Illustrative prototype figures — replace with verified data.
          </small>
        </div>

        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85"
              alt="Students collaborating on technology projects"
            />
          </div>

          <div className="floating-note note-top">
            <span className="note-icon">
              <GraduationCap size={17} />
            </span>

            <span>
              <b>Learn new skills</b>
              <small>One lesson at a time</small>
            </span>
          </div>

          <div className="floating-note note-bottom">
            <span className="note-icon note-green">
              <BriefcaseBusiness size={17} />
            </span>

            <span>
              <b>Career ready</b>
              <small>Find your opportunity</small>
            </span>
          </div>

          <div className="hero-orb" />
        </div>
      </section>

      <section
        className="courses-section page-width"
        id="courses"
      >
        <SectionHeading
          eyebrow="LEARN IN-DEMAND SKILLS"
          title="Popular courses"
          description="Explore learning paths designed to help you grow."
          action="View all courses"
          onAction={() => (location.href = '/portal/lms')}
        />

        <div className="popular-grid">
          {popular.map(({ icon: Icon, ...c }) => (
            <article
              className="popular-card"
              key={c.title}
            >
              <div className={`popular-icon ${c.tone}`}>
                <Icon size={24} />
              </div>

              <h3>{c.title}</h3>

              <div className="popular-meta">
                <span>
                  <PlayCircle size={13} />
                  {c.meta}
                </span>

                <span>
                  <GraduationCap size={13} />
                  {c.level}
                </span>
              </div>

              <Link to="/login">
                Explore course
                <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        className="placement-strip"
        id="placements"
      >
        <div className="page-width placement-inner">
          <div>
            <div className="eyebrow">
              YOUR NEXT CHAPTER
            </div>

            <h2>
              Skills today.{' '}
              <span>Career success tomorrow.</span>
            </h2>

            <p>
              Explore opportunities and keep your career momentum moving.
            </p>
          </div>

          <Link
            className="button-primary"
            to="/portal/careers"
          >
            Explore placements
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section
        className="why-section page-width"
        id="about"
      >
        <SectionHeading
          eyebrow="WHY CAMPUSHUB"
          title="Everything you need, in one place"
          description="A focused workspace for learning, career discovery, and progress."
        />

        <div className="benefit-grid">
          <div>
            <div className="benefit-icon">
              <Code2 />
            </div>

            <h3>Learn by doing</h3>

            <p>
              Track courses, lessons, and assessments from your
              personal learning hub.
            </p>
          </div>

          <div>
            <div className="benefit-icon">
              <BriefcaseBusiness />
            </div>

            <h3>Find opportunities</h3>

            <p>
              Explore roles, review required skills, and track
              applications in one place.
            </p>
          </div>

          <div>
            <div className="benefit-icon">
              <UsersRound />
            </div>

            <h3>Grow with support</h3>

            <p>
              Keep up with mentorship, complementary classes,
              and career preparation.
            </p>
          </div>
        </div>
      </section>

      <footer
        className="public-footer page-width"
        id="contact"
      >
        <div>
          <div className="footer-brand">
            <span>CampusHub</span> by TejTech
          </div>

          <p>
            Your gateway to learning, skills, and career opportunities.
          </p>
        </div>

        <div>
          <b>Explore</b>
          <Link to="/portal/lms">Courses</Link>
          <Link to="/portal/careers">Placements</Link>
          <Link to="/login">Student login</Link>
        </div>

        <div>
          <b>Support</b>
          <a href="mailto:support@campushub.example">
            Contact support
          </a>
          <a href="#about">About CampusHub</a>
        </div>

        <small>
          © 2026 CampusHub · Prototype experience
        </small>
      </footer>
    </main>
  );
}