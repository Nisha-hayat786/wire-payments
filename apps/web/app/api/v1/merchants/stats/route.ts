import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateMerchantKey } from "@/lib/security";

/**
 * [GET] Aggregated Merchant Metrics.
 * Provides institutional reporting on throughput, success rates, and volume.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = authHeader.split(" ")[1];
    const merchantId = await validateMerchantKey(apiKey);

    if (!merchantId) {
       return NextResponse.json({ error: "Invalid Key" }, { status: 401 });
    }

    // Aggregate statistics
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("amount, status, created_at")
      .eq("merchant_id", merchantId);

    if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const totalVolume = paidInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
    const successRate = totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0;

    return NextResponse.json({
      metrics: {
        total_volume: totalVolume.toFixed(4),
        currency: "WIRE",
        success_rate: `${successRate.toFixed(2)}%`,
        total_count: totalInvoices,
        paid_count: paidInvoices.length,
        network_status: "Operational"
      },
      merchant_id: merchantId
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
