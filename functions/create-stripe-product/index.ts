import { createClient } from "npm:@insforge/sdk";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_TEST_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function stripeRequest(path: string, body: Record<string, unknown>) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body as Record<string, string>).toString(),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

function toFormData(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, toFormData(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === "object" && v !== null) {
          Object.assign(result, toFormData(v as Record<string, unknown>, `${fullKey}[${i}]`));
        } else {
          result[`${fullKey}[${i}]`] = String(v);
        }
      });
    } else if (value !== undefined && value !== null) {
      result[fullKey] = String(value);
    }
  }
  return result;
}

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "STRIPE_TEST_SECRET_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const userToken = authHeader ? authHeader.replace("Bearer ", "") : null;

    const client = createClient({
      baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
      accessToken: userToken,
    });

    const { data: { user } } = await client.auth.getCurrentUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await client.auth.getProfile(user.id);
    if (profile?.profile?.rol !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { product_id, name, price_cents, description } = await req.json();

    if (!product_id || !name || !price_cents) {
      return new Response(
        JSON.stringify({ error: "product_id, name, and price_cents are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const productBody = toFormData({
      name,
      metadata: { product_id },
      ...(description ? { description } : {}),
    });
    const stripeProduct = await stripeRequest("/products", productBody);

    const priceBody = toFormData({
      product: stripeProduct.id,
      unit_amount: Math.round(price_cents),
      currency: "pen",
      metadata: { product_id },
    });
    const stripePrice = await stripeRequest("/prices", priceBody);

    await client.database
      .from("products")
      .update({
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
      })
      .eq("id", product_id);

    return new Response(
      JSON.stringify({
        productId: stripeProduct.id,
        priceId: stripePrice.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
