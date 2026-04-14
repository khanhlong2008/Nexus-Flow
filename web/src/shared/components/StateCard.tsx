interface StateCardProps {
  message: string;
}

export function StateCard({ message }: StateCardProps) {
  return <div className="card-state">{message}</div>;
}
