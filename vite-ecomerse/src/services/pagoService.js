import insforge from "./insforgeClient";

export const crearCheckoutSession = async ({ pedidoId, items, userEmail }) => {
  const lineItems = items
    .filter((i) => i.stripe_price_id)
    .map((i) => ({ priceId: i.stripe_price_id, quantity: i.cantidad }));

  if (lineItems.length === 0) {
    throw new Error("Ningun producto tiene precio configurado en Stripe");
  }

  const { data, error } = await insforge.payments.stripe.createCheckoutSession("test", {
    mode: "payment",
    lineItems,
    successUrl: `${window.location.origin}/pago-exito?pedido=${pedidoId}`,
    cancelUrl: `${window.location.origin}/pago-cancelado?pedido=${pedidoId}`,
    subject: { type: "user", id: items[0]?.usuarioId },
    customerEmail: userEmail ?? null,
    metadata: { order_id: pedidoId },
    idempotencyKey: `order:${pedidoId}`,
  });

  if (error) throw error;
  return data;
};
