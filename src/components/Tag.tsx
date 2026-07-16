import type { SimpleIcon } from 'simple-icons';
import {
  siDocker,
  siExpress,
  siGo,
  siJavascript,
  siNodedotjs,
  siPostgresql,
  siReact,
  siTypescript,
} from 'simple-icons';

const icons: Record<string, SimpleIcon> = {
  javascript: siJavascript,
  js: siJavascript,
  typescript: siTypescript,
  ts: siTypescript,
  node: siNodedotjs,
  nodejs: siNodedotjs,
  'node.js': siNodedotjs,
  express: siExpress,
  react: siReact,
  go: siGo,
  golang: siGo,
  docker: siDocker,
  postgres: siPostgresql,
  postgresql: siPostgresql,
};

interface TagProps {
  name: string;
}

export default function Tag({ name }: TagProps) {
  const icon = icons[name.toLowerCase()];

  return (
    <span className="tag">
      {icon && (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={icon.path} fill="currentColor" />
        </svg>
      )}
      {name}
    </span>
  );
}
