import insforge from "./insforgeClient";

const STRIPE_TEST_PRICE_ID = import.meta.env.VITE_STRIPE_TEST_PRICE_ID;

export const crearCheckoutSession = async ({ pedidoId, items, userEmail }) => {
  if (!STRIPE_TEST_PRICE_ID) {
    throw new Error("VITE_STRIPE_TEST_PRICE_ID no configurado en .env");
  }

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);

  const { data, error } = await insforge.payments.stripe.createCheckoutSession("test", {
    mode: "payment",
    lineItems: [{ priceId: STRIPE_TEST_PRICE_ID, quantity: totalItems }],
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
