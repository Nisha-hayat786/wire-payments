import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { dispatchWebhook } from "@/lib/webhooks";
import { withApiHandler } from "@/lib/api-handler";
import type { HandlerContext } from "@/lib/api-handler";

/**
 * [POST] Trigger a test webhook event (ping).
 * Allows merchants to verify their institutional endpoint integration.
 *
 * SECURITY: This endpoint now requires authentication via API key.
 * The merchantId from the authenticated request is used instead of
 * accepting it from the request body to prevent authorization bypass.
 */
export const POST = withApiHandler(
  async (req: Request, { auth }: HandlerContext) => {
    const { endpointId } = await req.json();

    if (!endpointId) {
      return NextResponse.json(
        { error: "Missing required parameter: endpointId" },
        { status: 400 }
      );
    }

    // Use the authenticated merchant ID instead of trusting the request body
    const merchantId = auth!.merchantId;

    // 1. Fetch the specific endpoint to ensure it exists and belongs to the merchant
    const { data: endpoint, error: endpointError } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('id', endpointId)
      .eq('merchant_id', merchantId)
      .single();

    if (endpointError || !endpoint) {
      return NextResponse.json(
        { error: "Endpoint not found or unauthorized" },
        { status: 404 }
      );
    }

    // 2. Prepare high-fidelity ping payload
    const testPayload = {
      event: "ping",
      test: true,
      timestamp: new Date().toISOString(),
      message: "This is an institutional test event from the WirePayments Command Center.",
      node: "NS-92533-WIREFLUID"
    };

    // 3. Dispatch the webhook using the shared infrastructure
    // We pass null for invoiceId and provide the merchantId directly
    const success = await dispatchWebhook('test_event', 'ping', testPayload, merchantId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Test event dispatched successfully",
        signature_verification: "HMAC-SHA256 active"
      });
    } else {
      return NextResponse.json(
        { error: "Failed to deliver test event" },
        { status: 502 }
      );
    }
  },
  {
    rateLimitTier: 'STRICT', // Test endpoints should be rate-limited strictly
    auditLog: true,
  }
);
