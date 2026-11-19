"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type DragEvent } from "react";
import {
  deleteImageAction,
  deleteProductAction,
  moveImageAction,
  removePrintFileAction,
  removeVideoAction,
  setArchivedAction,
  type FormState,
} from "../../product-actions";
import {
  IconeArquivar,
  IconeCubo,
  IconeDesce,
  IconeLixeira,
  IconeSobe,
  IconeUpload,
} from "@/components/Icones";

type Kind = "foto" | "video" | "arquivo3d";

/** Envia um arquivo com barra de progresso (fetch não informa progresso de upload). */
function uploadFile(productId: string, kind: Kind, file: File, onProgress: (pct: number) => void): Promise<string | null> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/produtos/${productId}/midia`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve(null);
      try {
        resolve((JSON.parse(xhr.responseText) as { error?: string }).error ?? "Não deu para enviar.");
      } catch {
        resolve("Não deu para enviar.");
      }
    };
    xhr.onerror = () => resolve("Sem conexão. Tente de novo.");
    const fd = new FormData();
    fd.set("kind", kind);
    fd.set("file", file);
    xhr.send(fd);
  });
}

const fmtMB = (b: number) => `${(b / 1024 / 1024).toFixed(b < 10 * 1024 * 1024 ? 1 : 0).replace(".", ",")} MB`;

/** Área de soltar arquivo, que também abre o seletor ao clicar (alternativa ao arrastar). */
function DropZone({
  accept,
  multiple,
  label,
  hint,
  busy,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  label: string;
  hint: string;
  busy: boolean;
  onFiles: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (!busy) onFiles([...e.dataTransfer.files]);
  };
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      className={`rounded-foto p-6 text-center transition-colors ${over ? "bg-dourado-claro" : "bg-papel"}`}
    >
      <IconeUpload className="mx-auto size-7 text-tinta-suave" />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="botao-contorno mt-3 px-4 py-2.5 text-sm"
      >
        {label}
      </button>
      <p className="mt-2 text-xs text-tinta-suave">{hint}</p>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function useUploads(productId: string) {
  const router = useRouter();
  const [progress, setProgress] = useState<{ name: string; pct: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function send(kind: Kind, files: File[]) {
    setErrors([]);
    const errs: string[] = [];
    for (const f of files) {
      setProgress({ name: f.name, pct: 0 });
      const err = await uploadFile(productId, kind, f, (pct) => setProgress({ name: f.name, pct }));
      if (err) errs.push(err);
      router.refresh();
    }
    setProgress(null);
    setErrors(errs);
  }
  return { progress, errors, send };
}

function Progresso({ progress }: { progress: { name: string; pct: number } | null }) {
  if (!progress) return null;
  return (
    <div className="mt-3" role="status">
      <p className="truncate text-sm">
        Enviando {progress.name}… <span className="text-tinta-suave">{progress.pct}%</span>
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-nevoa">
        <div className="h-full rounded-full bg-tinta transition-[width] duration-200" style={{ width: `${progress.pct}%` }} />
      </div>
    </div>
  );
}

function Erros({ errors }: { errors: string[] }) {
  return (
    <div aria-live="polite">
      {errors.map((e) => (
        <p key={e} className="mt-2 text-sm font-medium text-erro">
          {e}
        </p>
      ))}
    </div>
  );
}

export function ProductPhotos({
  productId,
  images,
  videoUrl,
}: {
  productId: string;
  images: { id: string; url: string; alt: string }[];
  videoUrl: string | null;
}) {
  const fotos = useUploads(productId);
  const video = useUploads(productId);
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<FormState>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  return (
    <section className="painel p-5 sm:p-7" aria-labelledby="t-fotos">
      <h2 id="t-fotos" className="titulo text-[1.375rem] leading-none">
        Fotos e vídeo
      </h2>
      <p className="mt-2 text-sm text-tinta-suave">A primeira foto é a capa. Use as setas para mudar a ordem.</p>

      {images.length > 0 && (
        <ol className={`mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${pending ? "opacity-60" : ""}`}>
          {images.map((img, i) => (
            <li key={img.id} className="relative">
              <div className="moldura relative aspect-square overflow-hidden rounded-foto">
                <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-branco px-2.5 py-1 text-xs font-bold shadow-cartao">Capa</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={pending || i === 0}
                    onClick={() => run(() => moveImageAction(img.id, -1))}
                    aria-label={`Mover foto ${i + 1} para antes`}
                    className="botao-redondo size-11 disabled:opacity-30"
                  >
                    <IconeSobe className="size-4 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    disabled={pending || i === images.length - 1}
                    onClick={() => run(() => moveImageAction(img.id, 1))}
                    aria-label={`Mover foto ${i + 1} para depois`}
                    className="botao-redondo size-11 disabled:opacity-30"
                  >
                    <IconeDesce className="size-4 -rotate-90" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => confirm("Remover esta foto?") && run(() => deleteImageAction(img.id))}
                  aria-label={`Remover foto ${i + 1}`}
                  className="botao-redondo size-11 text-tinta-suave hover:text-erro"
                >
                  <IconeLixeira className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-5">
        <DropZone
          accept="image/jpeg,image/png,image/webp"
          multiple
          label="Escolher fotos"
          hint="Ou arraste aqui. JPG, PNG ou WEBP, até 10 MB cada. Fotos quadradas ficam melhores."
          busy={Boolean(fotos.progress)}
          onFiles={(fs) => fotos.send("foto", fs)}
        />
        <Progresso progress={fotos.progress} />
        <Erros errors={fotos.errors} />
      </div>

      <div className="mt-6">
        <h3 className="rotulo">Vídeo (opcional)</h3>
        {videoUrl ? (
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <video src={videoUrl} controls muted playsInline preload="metadata" className="aspect-square w-48 rounded-foto bg-nevoa object-cover" />
            <button
              type="button"
              disabled={pending}
              onClick={() => confirm("Remover o vídeo?") && run(() => removeVideoAction(productId))}
              className="botao-contorno px-4 py-2.5 text-sm"
            >
              <IconeLixeira className="size-4" /> Remover vídeo
            </button>
          </div>
        ) : null}
        <div className="mt-3">
          <DropZone
            accept="video/mp4,video/quicktime,video/webm"
            label={videoUrl ? "Trocar vídeo" : "Escolher vídeo"}
            hint="MP4, MOV ou WEBM, até 60 MB. Aparece como último item da galeria."
            busy={Boolean(video.progress)}
            onFiles={(fs) => fs[0] && video.send("video", [fs[0]])}
          />
          <Progresso progress={video.progress} />
          <Erros errors={video.errors} />
        </div>
      </div>
    </section>
  );
}

export function PrintFileCard({
  productId,
  file,
}: {
  productId: string;
  file: { name: string; bytes: number; downloadPath: string } | null;
}) {
  const up = useUploads(productId);
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <section className="painel p-5 sm:p-7" aria-labelledby="t-3mf">
      <h2 id="t-3mf" className="titulo flex items-center gap-2 text-[1.375rem] leading-none">
        <IconeCubo className="size-5" /> Arquivo para imprimir
      </h2>
      <p className="mt-2 text-sm text-tinta-suave">O .3mf do Bambu Studio. Só aparece aqui no painel, nunca na loja.</p>

      {file ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-foto bg-papel p-4">
          <span className="grid size-11 place-items-center rounded-full bg-branco">
            <IconeCubo className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{file.name}</span>
            <span className="text-sm text-tinta-suave">{fmtMB(file.bytes)}</span>
          </span>
          <a href={file.downloadPath} className="botao-contorno px-4 py-2.5 text-sm">
            Baixar
          </a>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              confirm("Remover o arquivo 3D deste produto?") &&
              start(async () => {
                await removePrintFileAction(productId);
                router.refresh();
              })
            }
            aria-label="Remover arquivo 3D"
            className="botao-redondo size-11 text-tinta-suave hover:text-erro"
          >
            <IconeLixeira className="size-4" />
          </button>
        </div>
      ) : (
        <p className="mt-4 rounded-foto bg-erro-fundo px-4 py-3 text-sm font-medium text-erro">
          Sem arquivo ainda: o botão de imprimir dos pedidos fica desativado para esta peça.
        </p>
      )}

      <div className="mt-4">
        <DropZone
          accept=".3mf"
          label={file ? "Trocar arquivo" : "Escolher .3mf"}
          hint="Arquivo .3mf, até 200 MB. Salve no Bambu Studio já com placas e configurações prontas."
          busy={Boolean(up.progress)}
          onFiles={(fs) => fs[0] && up.send("arquivo3d", [fs[0]])}
        />
        <Progresso progress={up.progress} />
        <Erros errors={up.errors} />
      </div>
    </section>
  );
}

export function ProductDanger({ productId, archived }: { productId: string; archived: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, setState] = useState<FormState>({});

  const run = (fn: () => Promise<FormState>) =>
    start(async () => {
      setState(await fn());
      router.refresh();
    });

  return (
    <section className="painel p-5 sm:p-7" aria-labelledby="t-remover">
      <h2 id="t-remover" className="titulo text-[1.375rem] leading-none">
        {archived ? "Produto arquivado" : "Tirar da loja"}
      </h2>
      <p className="mt-2 text-sm text-tinta-suave">
        {archived
          ? "Não aparece na loja nem pode ser comprado. Os pedidos antigos continuam completos."
          : "Arquivar esconde a peça da loja na hora, sem perder nada. Dá para reativar depois."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setArchivedAction(productId, !archived))}
          className={archived ? "botao-principal px-5 py-3 text-sm" : "botao-contorno px-5 py-3 text-sm"}
        >
          <IconeArquivar className="size-4" /> {archived ? "Voltar para a loja" : "Arquivar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            confirm("Excluir de vez? Fotos, vídeo e arquivo 3D também são apagados. Não dá para desfazer.") &&
            run(() => deleteProductAction(productId))
          }
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-erro transition-colors hover:bg-erro-fundo"
        >
          <IconeLixeira className="size-4" /> Excluir de vez
        </button>
      </div>
      <div aria-live="polite">
        {state.error && <p className="mt-3 text-sm font-medium text-erro">{state.error}</p>}
        {state.ok && state.message && <p className="mt-3 text-sm font-medium">{state.message}</p>}
      </div>
    </section>
  );
}
