import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

import { validateMerchantKey } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing API Key" }, { status: 401 });
    }

    const apiKey = authHeader.split(" ")[1];
    const merchantId = await validateMerchantKey(apiKey);

    if (!merchantId) {
      return NextResponse.json({ error: "Unauthorized: Invalid API Key" }, { status: 401 });
    }

    const { amount, currency, metadata, description } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // Insert invoice into Supabase
    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .insert([
        {
          merchant_id: merchantId,
          amount,
          currency: currency || "WIRE",
          status: "pending",
          description,
          metadata: metadata || {},
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const merchant_id = searchParams.get("merchant_id");

  if (!merchant_id) {
    return NextResponse.json({ error: "merchant_id is required" }, { status: 400 });
  }

  const { data: invoices, error } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .eq("merchant_id", merchant_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(invoices);
}
