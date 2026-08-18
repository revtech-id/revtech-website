import fs from 'fs';

async function testUpload() {
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "wiedsjy8";
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "revtech";
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  console.log("Testing upload to", CLOUDINARY_URL, "with preset", CLOUDINARY_UPLOAD_PRESET);

  // create a dummy 1x1 transparent png
  const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
  const binaryData = Buffer.from(base64Data, 'base64');
  
  const blob = new Blob([binaryData], { type: 'image/png' });

  const formData = new FormData();
  formData.append("file", blob);
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

testUpload();
