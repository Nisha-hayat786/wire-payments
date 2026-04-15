import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api-handler";
import type { AuthContext, HandlerContext } from "@/lib/api-handler";

/**
 * [POST] Create a new high-fidelity invoice.
 * Supports metadata, custom expiration, and institutional settlement mappings.
 */
export const POST = withApiHandler(
  async (req, { auth }: HandlerContext) => {
    const { amount, currency, metadata, description, redirect_url, expires_in_seconds } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "A positive amount is required" }, { status: 400 });
    }

    // Default expiration is 24 hours unless specified
    const ttl = (expires_in_seconds || 86400) * 1000;
    const expiresAt = new Date(Date.now() + ttl).toISOString();

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert([
        {
          merchant_id: auth!.merchantId,
          amount,
          currency: currency || "WIRE",
          status: "pending",
          description: description || "Institutional Transfer",
          redirect_url: redirect_url || null,
          metadata: metadata || {},
          expires_at: expiresAt,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  },
  { rateLimitTier: "AUTHENTICATED" }
);

/**
 * [GET] List merchant invoices with enterprise-grade filtering and pagination.
 */
export const GET = withApiHandler(
  async (req, { auth }: HandlerContext) => {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");

    let query = supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .eq("merchant_id", auth!.merchantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: invoices, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  },
  { rateLimitTier: "AUTHENTICATED" }
);
