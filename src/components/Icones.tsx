// Ícones da Yumi Mix: traço fino (1.5), pontas retas, como as linhas da grade.
type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true,
};

export function IconeSacola({ className = "size-6" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function IconeSeta({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconeVoltar({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function IconeMais({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconeMenos({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconeLixeira({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  );
}

export function IconeCheck({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconeRelogio({ className = "size-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconeUpload({ className = "size-6" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 16V4M7 9l5-5 5 5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
    </svg>
  );
}

/** Marca: moldura quadrada atravessada por camadas diagonais (impressão camada por camada). */
export function Marca({ className = "size-7" }: P) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" />
      <path d="M0.75 9.5 9.5 0.75M0.75 18.5 18.5 0.75M0.75 27.5 27.5 0.75M4.5 31.25 31.25 4.5M13.5 31.25 31.25 13.5M22.5 31.25 31.25 22.5" />
    </svg>
  );
}

export function IconeBusca({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}
