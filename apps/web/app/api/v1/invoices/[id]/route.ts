import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api-handler";
import type { AuthContext, HandlerContext } from "@/lib/api-handler";

/**
 * [GET] Fetch granular details for a specific invoice.
 */
export const GET = withApiHandler(
  async (req: Request, { auth }: HandlerContext) => {
    // Extract ID from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("merchant_id", auth!.merchantId) // Ensure ownership
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found or unauthorized access" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: invoice });
  },
  { rateLimitTier: "AUTHENTICATED" }
);
