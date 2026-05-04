import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

export const runtime = "nodejs";
export const maxDuration = 30;

const BUCKET_NAME = "generation-references";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function ensureBucketExists() {
  const admin = createServiceRoleClient();
  const { data: bucket } = await admin.storage.getBucket(BUCKET_NAME);

  if (!bucket) {
    const { error } = await admin.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: Array.from(ALLOWED_TYPES),
    });

    if (error) {
      throw error;
    }
  } else {
    await admin.storage.updateBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: Array.from(ALLOWED_TYPES),
    });
  }

  return admin;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in first", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Storage upload is not configured", code: "CONFIG_ERROR" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const fileName = typeof body?.fileName === "string" ? body.fileName : "";
    const contentType = typeof body?.contentType === "string" ? body.contentType : "";
    const fileSize = typeof body?.fileSize === "number" ? body.fileSize : NaN;
    const extension = fileName.split(".").pop()?.toLowerCase() || "png";

    if (!fileName) {
      return NextResponse.json(
        { error: "Please choose an image file", code: "MISSING_FILE" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPG, PNG, or WebP.", code: "INVALID_FILE_TYPE" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { error: "Invalid file size", code: "INVALID_FILE_SIZE" },
        { status: 400 }
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 20MB.", code: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    const admin = await ensureBucketExists();
    const objectPath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { data: signedUpload, error: signedUploadError } = await admin.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(objectPath);

    if (signedUploadError || !signedUpload?.token) {
      throw signedUploadError || new Error("Failed to create signed upload URL");
    }

    const { data } = admin.storage.from(BUCKET_NAME).getPublicUrl(objectPath);

    return NextResponse.json({
      success: true,
      bucket: BUCKET_NAME,
      token: signedUpload.token,
      url: data.publicUrl,
      path: objectPath,
    });
  } catch (error: any) {
    console.error("Reference upload failed:", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed", code: "UPLOAD_FAILED" },
      { status: 500 }
    );
  }
}
