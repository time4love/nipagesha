import { createClient } from "@/lib/supabase/server";
import { uploadToSecureMedia } from "@/lib/supabase/storage";
import { uploadPublicFile } from "@/lib/supabase/public-storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  const mode = (formData.get("mode") as string) ?? "";
  const isPublic = mode === "public";

  if (isPublic) {
    const result = await uploadPublicFile(file, "articles");
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ url: result.url });
  }

  const result = await uploadToSecureMedia(file);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ path: result.path });
}
