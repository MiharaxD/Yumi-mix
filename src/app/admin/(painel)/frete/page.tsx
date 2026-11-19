import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";
import { centsToInput } from "@/lib/money";
import { melhorEnvioConfigured } from "@/lib/melhor-envio";
import { emailConfigured } from "@/lib/email";
import { IconeCheck } from "@/components/Icones";
import { PageTitle } from "../ui";
import { ShippingSettingsForm } from "./ShippingSettingsForm";

export const metadata: Metadata = { title: "Frete" };

function Status({ ok, titulo, okText, offText }: { ok: boolean; titulo: string; okText: string; offText: string }) {
  return (
    <div className="flex items-start gap-3 rounded-foto bg-papel p-4">
      <span className={`grid size-8 shrink-0 place-items-center rounded-full ${ok ? "bg-tinta text-branco" : "bg-cinza text-tinta-suave"}`}>
        {ok ? <IconeCheck className="size-4" /> : <span className="size-2 rounded-full bg-current" />}
      </span>
      <span className="text-sm">
        <span className="block font-bold">{titulo}</span>
        <span className="text-tinta-suave">{ok ? okText : offText}</span>
      </span>
    </div>
  );
}

export default async function FretePage() {
  const s = await getStoreSettings();
  const sandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle>Frete</PageTitle>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Status
          ok={melhorEnvioConfigured()}
          titulo={`Melhor Envio${sandbox ? " (testes)" : ""}`}
          okText="Frete cotado em tempo real pelo CEP."
          offText="Sem token: usando o valor fixo. Cole MELHOR_ENVIO_TOKEN no .env.local."
        />
        <Status
          ok={emailConfigured()}
          titulo="Email de rastreio"
          okText="O cliente recebe o código ao você marcar como enviado."
          offText="Sem Resend: o código fica salvo, mas o email não sai. Cole RESEND_API_KEY e EMAIL_FROM."
        />
      </div>
      <ShippingSettingsForm
        initial={{
          originCep: s.originCep ? `${s.originCep.slice(0, 5)}-${s.originCep.slice(5)}` : "",
          freeOn: s.freeShippingThresholdCents !== null,
          freeThreshold: centsToInput(s.freeShippingThresholdCents ?? 20000),
          fallbackShipping: centsToInput(s.fallbackShippingCents),
          fallbackDays: s.fallbackShippingDays,
        }}
      />
      <p className="mt-4 text-sm text-tinta-suave">
        O frete embutido, o peso e a caixa de cada peça ficam na página do produto.
      </p>
    </div>
  );
}
