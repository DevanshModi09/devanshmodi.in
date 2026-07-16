import { site } from '../config';
import { education } from '../data/education';
import { skills } from '../data/skills';

export default function About() {
  return (
    <section className="page">
      <h1 className="page-title">About</h1>
      <div className="page-body">
        <p>Hey, I'm Devansh. Full stack developer.</p>
        <p>
          I mostly work with TypeScript, Node, and React — that's my day-to-day
          toolkit. I've been getting into DevOps and Go too. Just trying to get
          a little better every day.
        </p>
        <p>
          This site is where I write about it all — web dev, tooling, and the
          tech debates worth having.
        </p>
      </div>

      <h2 className="section-heading">Skills</h2>
      <div className="skills">
        {skills.map((group) => (
          <div key={group.category} className="skill-row">
            <span className="skill-category">{group.category}</span>
            <span className="skill-items">{group.items.join(' · ')}</span>
          </div>
        ))}
      </div>

      <h2 className="section-heading">Education</h2>
      <div className="education">
        {education.map((entry) => (
          <div key={entry.school} className="edu-item">
            <p className="edu-school">{entry.school}</p>
            <p className="edu-degree">{entry.degree}</p>
            <p className="edu-detail">{entry.detail}</p>
          </div>
        ))}
      </div>

      <h2 className="section-heading">Contact</h2>
      <div className="skills">
        <div className="skill-row">
          <span className="skill-category">Email</span>
          <a href={site.links.email}>devanshmodi250@gmail.com</a>
        </div>
        <div className="skill-row">
          <span className="skill-category">GitHub</span>
          <a href={site.links.github} target="_blank" rel="noreferrer">
            DevanshModi09
          </a>
        </div>
        <div className="skill-row">
          <span className="skill-category">LinkedIn</span>
          <a href={site.links.linkedin} target="_blank" rel="noreferrer">
            devansh-modi
          </a>
        </div>
        <div className="skill-row">
          <span className="skill-category">Discord</span>
          <span>{site.links.discord}</span>
        </div>
      </div>
    </section>
  );
}
