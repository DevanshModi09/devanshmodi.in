import { projects } from '../data/projects';

export default function Projects() {
  return (
    <section className="page">
      <h1 className="page-title">Projects</h1>
      {projects.map((project) => (
        <article key={project.name} className="project">
          <h2 className="project-name">
            {project.link ? (
              <a href={project.link} target="_blank" rel="noreferrer">
                {project.name} ↗
              </a>
            ) : (
              project.name
            )}
          </h2>
          <p className="project-tagline">{project.tagline}</p>
          <p className="project-description">{project.description}</p>
          {project.highlights.length > 0 && (
            <ul className="project-highlights">
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}
          <p className="project-tech">{project.tech.join(' · ')}</p>
        </article>
      ))}
    </section>
  );
}
