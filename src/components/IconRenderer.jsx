import * as Icons from 'lucide-react';

export function IconRenderer({ name, ...props }) {
  const Icon = Icons[name];
  if (!Icon) return <Icons.CircleHelp {...props} />;
  return <Icon {...props} />;
}
