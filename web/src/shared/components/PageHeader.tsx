interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="section-head">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}
