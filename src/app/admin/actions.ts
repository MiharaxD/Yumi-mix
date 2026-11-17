"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { adminConfigured, checkPassword, endSession, isAdmin, startSession } from "@/lib/admin-auth";
import { canTransitionCustom, canTransitionOrder, CUSTOM_STATUS_LABEL, isCustomStatus, isOrderStatus, ORDER_STATUS_LABEL } from "@/lib/status";
import { parseBRLToCents } from "@/lib/money";
import { markOrderPaid } from "@/lib/orders";

export type ActionState = { ok?: boolean; error?: string; message?: string };

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!adminConfigured()) {
    return { error: "Defina ADMIN_PASSWORD e ADMIN_SESSION_SECRET em .env.local e reinicie o servidor." };
  }
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 500)); // freia tentativa e erro
    return { error: "Senha incorreta." };
  }
  await startSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

async function guard(): Promise<ActionState | null> {
  if (!(await isAdmin())) return { error: "Sessão expirada. Entre de novo." };
  return null;
}

export async function updateOrderStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const denied = await guard();
  if (denied) return denied;

  const id = String(formData.get("orderId") ?? "");
  const to = String(formData.get("status") ?? "");
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) return { error: "Pedido não encontrado." };
  if (!canTransitionOrder(order.status, to) || !isOrderStatus(to)) {
    return { error: "Essa mudança de status não é permitida." };
  }

  if (to === "pago") {
    // mesmo caminho do webhook: grava a notificação uma vez só
    await markOrderPaid(id);
  } else {
    const updated = await prisma.order.updateMany({ where: { id, status: order.status }, data: { status: to } });
    if (updated.count === 0) return { error: "O pedido mudou enquanto você editava. Recarregue a página." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/pedidos/${id}`);
  return { ok: true, message: `Status alterado para ${ORDER_STATUS_LABEL[to]}.` };
}

export async function saveQuoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const denied = await guard();
  if (denied) return denied;

  const id = String(formData.get("requestId") ?? "");
  const cents = parseBRLToCents(String(formData.get("price") ?? ""));
  if (cents === null || cents <= 0) return { error: "Informe um valor válido, ex.: 149,90." };

  const req = await prisma.customRequest.findUnique({ where: { id }, select: { status: true } });
  if (!req) return { error: "Solicitação não encontrada." };
  if (req.status !== "nova" && req.status !== "orcada") {
    return { error: "O orçamento só pode ser alterado antes da resposta do cliente." };
  }

  await prisma.customRequest.update({ where: { id }, data: { quotedPriceCents: cents } });
  revalidatePath("/admin/personalizados");
  return { ok: true, message: "Orçamento salvo." };
}

export async function updateCustomStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const denied = await guard();
  if (denied) return denied;

  const id = String(formData.get("requestId") ?? "");
  const to = String(formData.get("status") ?? "");
  const req = await prisma.customRequest.findUnique({ where: { id }, select: { status: true, quotedPriceCents: true } });
  if (!req) return { error: "Solicitação não encontrada." };
  if (!isCustomStatus(to) || !canTransitionCustom(req.status, to, req.quotedPriceCents)) {
    return {
      error:
        to === "orcada" && !req.quotedPriceCents
          ? "Registre o preço orçado antes de marcar como orçada."
          : "Essa mudança de status não é permitida.",
    };
  }

  const updated = await prisma.customRequest.updateMany({ where: { id, status: req.status }, data: { status: to } });
  if (updated.count === 0) return { error: "A solicitação mudou enquanto você editava. Recarregue a página." };

  revalidatePath("/admin/personalizados");
  return { ok: true, message: `Status alterado para ${CUSTOM_STATUS_LABEL[to]}.` };
}
