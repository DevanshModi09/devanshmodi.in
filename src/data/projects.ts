export interface Project {
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  tech: string[];
  link?: string;
}

export const projects: Project[] = [
  {
    name: 'Vimhero',
    tagline: 'Learn Vim by doing, not by memorizing a cheat sheet.',
    description:
      'A terminal app that teaches you Vim in 45 days through daily hands-on challenges — so the keybindings actually stick.',
    highlights: [
      '45-day structured challenge track',
      'Bite-sized daily drills',
      'Runs entirely in your terminal',
    ],
    tech: ['Go', 'TUI'],
    link: 'https://github.com/DevanshModi09/vimhero',
  },
  {
    name: 'Ratracer',
    tagline: 'Real-time typing races against real people.',
    description:
      'A multiplayer typing competition — everyone races the same passage live, fastest and most accurate wins.',
    highlights: [
      'Live multiplayer races',
      'Real-time WPM & accuracy tracking',
      'Built for speed',
    ],
    tech: [
      'TypeScript',
      'Node.js',
      'React',
      'Zustand',
      'Socket.io',
      'PostgreSQL',
      'Prisma',
    ],
    link: 'https://github.com/DevanshModi09/ratracer',
  },
  {
    name: 'Devanshmodi.in',
    tagline: 'This site.',
    description:
      'Personal site for writing, projects, and everything else — hand-built, no CMS.',
    highlights: [],
    tech: ['React', 'TypeScript', 'Vite'],
    link: 'https://devanshmodi.in',
  },
];
