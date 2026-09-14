import { createClient } from "npm:@insforge/sdk";

export default async function (req: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { producto_id, cantidad } = await req.json();

    if (!producto_id || !cantidad || cantidad <= 0) {
      return new Response(
        JSON.stringify({ error: "producto_id and positive cantidad are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const userToken = authHeader ? authHeader.replace("Bearer ", "") : null;

    const client = createClient({
      baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
      accessToken: userToken,
    });

    const { data, error } = await client.rpc("decrement_stock", {
      p_producto_id: producto_id,
      p_cantidad: cantidad,
    });

    if (error) {
      const status = error.message?.includes("Insufficient stock") ? 409 : 500;
      return new Response(
        JSON.stringify({ error: error.message }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, newStock: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
