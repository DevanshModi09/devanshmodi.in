export interface SkillGroup {
  category: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Go'] },
  { category: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS'] },
  {
    category: 'Backend',
    items: ['Node.js', 'PostgreSQL', 'Prisma', 'REST APIs'],
  },
  { category: 'DevOps / Cloud', items: ['Docker', 'AWS (EC2, S3)', 'Git'] },
];
