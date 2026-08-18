async function testUploadBase64() {
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "wiedsjy8";
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "revtech";
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  const base64Data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";

  const formData = new FormData();
  formData.append("file", base64Data);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `revtech/test`);

  try {
    const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`Upload failed:`, err);
      process.exit(1);
    }

    const data = await res.json();
    console.log("Success! URL:", data.secure_url);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testUploadBase64();
