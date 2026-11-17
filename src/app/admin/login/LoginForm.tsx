"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "../actions";
import { Campo } from "@/components/Campo";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <Campo label="Senha do painel" name="password" type="password" autoComplete="current-password" required autoFocus error={state.error} />
      <button type="submit" disabled={pending} className="botao-principal px-6 py-3 font-bold">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
