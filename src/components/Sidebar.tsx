import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { site } from '../config';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  function copyDiscord() {
    navigator.clipboard.writeText(site.links.discord);
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div>
          <NavLink to="/" className="sidebar-name">
            {site.author.name}
          </NavLink>
          <p className="sidebar-bio">{site.author.bio}</p>

          <nav className="sidebar-nav">
            <NavLink to="/" end>
              Writing
            </NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/projects">Projects</NavLink>
          </nav>

          <nav className="sidebar-nav sidebar-nav-elsewhere">
            <span className="sidebar-nav-label">Elsewhere</span>
            <a href={site.links.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a href={site.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
            <a href={site.links.email}>Email ↗</a>
            <button
              type="button"
              onClick={copyDiscord}
              title={`Copy Discord username: ${site.links.discord}`}
            >
              {copied ? `${site.links.discord} — copied` : 'Discord ⧉'}
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
