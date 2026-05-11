interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-bold tracking-tighter select-none ${className ?? ""}`}
    >
      <span className="text-primary">&lt;</span>
      <span className="text-foreground">KF</span>
      <span className="text-primary">/&gt;</span>
    </span>
  );
}
