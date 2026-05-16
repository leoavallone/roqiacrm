import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function SectionHeader({ title, description, children }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
