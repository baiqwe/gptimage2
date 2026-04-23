import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

export const runtime = "nodejs";
export const maxDuration = 30;

const BUCKET_NAME = "generation-references";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an image file", code: "MISSING_FILE" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPG, PNG, or WebP.", code: "INVALID_FILE_TYPE" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 10MB.", code: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    const admin = await ensureBucketExists();
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const objectPath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(objectPath, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = admin.storage.from(BUCKET_NAME).getPublicUrl(objectPath);

    return NextResponse.json({
      success: true,
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
