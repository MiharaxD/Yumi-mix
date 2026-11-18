"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CUSTOM_MAX_IMAGE_BYTES, CUSTOM_MAX_IMAGES } from "@/config";
import { Campo, CampoTexto } from "@/components/Campo";
import { IconeCheck, IconeSeta, IconeUpload } from "@/components/Icones";

type Errors = Record<string, string>;
type Picked = { file: File; url: string };

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function CustomRequestForm() {
  const [picked, setPicked] = useState<Picked[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // libera as prévias ao sair da página
  const pickedRef = useRef<Picked[]>([]);
  useEffect(() => {
    pickedRef.current = picked;
  }, [picked]);
  useEffect(() => () => pickedRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    e.target.value = "";
    const problems: string[] = [];
    const accepted: Picked[] = [];
    for (const file of incoming) {
      if (!ACCEPT.includes(file.type)) problems.push(`"${file.name}" não é JPG, PNG ou WEBP.`);
      else if (file.size > CUSTOM_MAX_IMAGE_BYTES) problems.push(`"${file.name}" passa de 5 MB.`);
      else accepted.push({ file, url: URL.createObjectURL(file) });
    }
    const room = CUSTOM_MAX_IMAGES - picked.length;
    if (accepted.length > room) {
      problems.push(`Cabem no máximo ${CUSTOM_MAX_IMAGES} imagens.`);
      accepted.splice(room).forEach((p) => URL.revokeObjectURL(p.url));
    }
    setPicked((prev) => [...prev, ...accepted]);
    setErrors((prev) => ({ ...prev, imagens: problems.join(" ") }));
  }

  function removePicked(index: number) {
    setPicked((prev) => {
      const gone = prev[index];
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (picked.length === 0) {
      setErrors((prev) => ({ ...prev, imagens: "Envie pelo menos 1 imagem." }));
      setFormError("Confira os campos destacados.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.delete("imagens");
    picked.forEach((p) => fd.append("imagens", p.file));

    setSubmitting(true);
    try {
      const res = await fetch("/api/personalizado", { method: "POST", body: fd });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; number?: number; error?: string; fieldErrors?: Errors };
      if (!res.ok || !body.ok) {
        setErrors(body.fieldErrors ?? {});
        setFormError(body.error ?? "Não conseguimos enviar. Tente de novo.");
        const first = Object.keys(body.fieldErrors ?? {})[0];
        if (first) document.getElementById(first)?.focus();
        setSubmitting(false);
        return;
      }
      setDone(body.number ?? 0);
    } catch {
      setFormError("Sem conexão com a loja. Confira a internet e tente de novo.");
      setSubmitting(false);
    }
  }

  if (done !== null) {
    return (
      <div className="painel max-w-xl p-7 sm:p-9" role="status">
          <span className="grid size-14 place-items-center rounded-full bg-tinta text-branco">
            <IconeCheck className="check-desenha size-7" />
          </span>
          <p className="titulo mt-5 text-[1.75rem] leading-tight">Pedido recebido{done ? ` (nº ${done})` : ""}.</p>
          <p className="mt-2 text-tinta-suave">
            Vamos estudar a peça e responder pelo contato que você deixou com o orçamento e o prazo. Nada é cobrado até
            você aprovar.
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 font-semibold underline">
            Voltar para a vitrine <IconeSeta className="size-4" />
          </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      {/* isca anti-spam: escondida de pessoas e leitores de tela */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="site">Site</label>
        <input id="site" name="site" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="painel min-w-0 p-5 sm:p-8">
        <legend className="titulo float-left mb-6 w-full text-[1.5rem] leading-none">A peça</legend>
        <div className="clear-both grid gap-4 sm:grid-cols-2">
          <CampoTexto
            className="sm:col-span-2"
            label="Descrição"
            name="description"
            error={errors.description}
            hint="Para que serve, onde vai ficar, algum detalhe que não pode faltar."
            rows={5}
          />
          <Campo label="Medidas aproximadas" name="dimensions" placeholder="ex.: 15 × 10 × 8 cm" error={errors.dimensions} />
          <Campo label="Material ou cor" name="materialColor" placeholder="ex.: branco fosco" error={errors.materialColor} />
          <Campo label="Quantidade" name="quantity" type="number" inputMode="numeric" min={1} max={500} defaultValue={1} error={errors.quantity} />
          <Campo label="Prazo desejado" name="desiredDate" placeholder="ex.: até 20/12, ou sem pressa" error={errors.desiredDate} />
        </div>

        <div className="mt-6">
          <p id="imagens-rotulo" className="rotulo">
            Imagens de referência <span className="font-normal text-tinta-suave">(1 a {CUSTOM_MAX_IMAGES}, JPG, PNG ou WEBP, até 5 MB cada)</span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {picked.map((p, i) => (
              <div key={p.url} className="relative">
                <div className="moldura relative aspect-square w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:) */}
                  <img src={p.url} alt={`Prévia: ${p.file.name}`} className="absolute inset-0 size-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removePicked(i)}
                  className="mt-1.5 w-full truncate rounded-full px-2 py-1 text-xs text-tinta-suave hover:bg-erro-fundo hover:text-erro"
                  aria-label={`Remover ${p.file.name}`}
                >
                  Remover
                </button>
              </div>
            ))}
            {picked.length < CUSTOM_MAX_IMAGES && (
              <button
                type="button"
                id="imagens"
                onClick={() => inputRef.current?.click()}
                aria-describedby={errors.imagens ? "imagens-erro" : "imagens-rotulo"}
                className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-foto border-2 border-dashed bg-papel text-sm font-semibold text-tinta-suave transition-colors hover:border-tinta/40 hover:bg-nevoa hover:text-tinta ${errors.imagens ? "border-erro" : "border-tinta/15"}`}
              >
                <IconeUpload />
                {picked.length === 0 ? "Escolher fotos" : "Mais uma"}
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            name="imagens"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onPick}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
          {errors.imagens && (
            <p id="imagens-erro" className="mt-2 text-sm font-medium text-erro">
              {errors.imagens}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="painel min-w-0 p-5 sm:p-8">
        <legend className="titulo float-left mb-6 w-full text-[1.5rem] leading-none">Quem está pedindo</legend>
        <div className="clear-both grid gap-4 sm:grid-cols-2">
          <Campo label="Nome" name="name" autoComplete="name" error={errors.name} />
          <Campo label="WhatsApp ou email" name="contact" autoComplete="email" error={errors.contact} hint="É por aqui que mandamos o orçamento." />
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={submitting} className="botao-principal px-8 py-3.5 font-bold">
          {submitting ? "Enviando…" : "Enviar pedido de orçamento"}
        </button>
        <div aria-live="assertive">
          {formError && <p className="text-sm font-medium text-erro">{formError}</p>}
        </div>
      </div>
    </form>
  );
}
