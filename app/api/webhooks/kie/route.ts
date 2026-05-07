import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  extractKieTaskId,
  getKieTaskDetails,
  verifyKieWebhookSignature,
} from "@/utils/ai/kie";
import {
  getGenerationById,
  getGenerationByProviderTaskId,
  syncGenerationWithKieTask,
} from "@/utils/ai/generations";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const taskId = extractKieTaskId(payload);

    if (!taskId) {
      return NextResponse.json(
        { error: "Missing taskId", code: "INVALID_PAYLOAD" },
        { status: 400 }
      );
    }

    const headerList = await headers();
    const timestamp = headerList.get("x-webhook-timestamp") || "";
    const signature = headerList.get("x-webhook-signature") || "";

    if (process.env.KIE_WEBHOOK_HMAC_KEY) {
      if (!timestamp || !signature) {
        return NextResponse.json(
          { error: "Missing webhook signature headers", code: "INVALID_SIGNATURE" },
          { status: 401 }
        );
      }

      const isValid = verifyKieWebhookSignature({
        taskId,
        timestamp,
        signature,
        secret: process.env.KIE_WEBHOOK_HMAC_KEY,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid webhook signature", code: "INVALID_SIGNATURE" },
          { status: 401 }
        );
      }
    }

    const generationId = request.nextUrl.searchParams.get("generationId");
    let generation = generationId ? await getGenerationById(generationId) : null;

    if (!generation) {
      generation = await getGenerationByProviderTaskId(taskId);
    }

    if (!generation) {
      return NextResponse.json(
        { error: "Generation not found", code: "GENERATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const resolvedGeneration = generation;

    const providerRecord = await getKieTaskDetails(taskId);
    const updatedGeneration = await syncGenerationWithKieTask({
      generation: resolvedGeneration,
      providerRecord,
      persistenceTimeoutMs: 8000,
    });

    return NextResponse.json({
      received: true,
      generationId: updatedGeneration.id,
      status: updatedGeneration.status,
    });
  } catch (error: any) {
    console.error("Kie webhook error:", error);
    return NextResponse.json(
      {
        error: "Kie webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
