import type { InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClass =
  "w-full min-w-0 rounded-campo border-0 bg-papel px-4 py-3.5 text-base text-tinta shadow-[inset_0_0_0_1.5px_transparent] transition-[box-shadow,background-color] placeholder:text-tinta-suave hover:bg-nevoa focus:bg-branco focus:shadow-[inset_0_0_0_2px_var(--color-tinta)] focus:outline-none aria-invalid:bg-erro-fundo aria-invalid:shadow-[inset_0_0_0_1.5px_var(--color-erro)]";

type Base = { label: string; name: string; error?: string; hint?: ReactNode; className?: string };

function Wrapper({ label, name, error, hint, className = "", children }: Base & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="rotulo mb-2 block">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${name}-dica`} className="mt-1.5 text-xs text-tinta-suave">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-erro`} className="mt-1.5 text-sm font-medium text-erro">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(name: string, error?: string, hint?: ReactNode) {
  return error ? `${name}-erro` : hint ? `${name}-dica` : undefined;
}

export function Campo({
  label,
  name,
  error,
  hint,
  className,
  ...rest
}: Base & InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint} className={className}>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={inputClass}
        {...rest}
      />
    </Wrapper>
  );
}

export function CampoTexto({
  label,
  name,
  error,
  hint,
  className,
  ...rest
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint} className={className}>
      <textarea
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={`${inputClass} min-h-32 resize-y`}
        {...rest}
      />
    </Wrapper>
  );
}

export function CampoSelect({
  label,
  name,
  error,
  hint,
  className,
  children,
  ...rest
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint} className={className}>
      <select
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={`${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23121212'%20stroke-width='1.75'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E")] bg-[length:1.1rem] bg-[right_0.8rem_center] bg-no-repeat pr-10`}
        {...rest}
      >
        {children}
      </select>
    </Wrapper>
  );
}
