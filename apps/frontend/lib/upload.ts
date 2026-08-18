const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

/**
 * Compresses an image file (JPG/PNG) to WebP format using a canvas.
 */
export async function compressImageToWebP(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses the image and uploads it to Cloudinary.
 * @param file The original file from input
 * @param folder The storage folder path (e.g., 'portfolio', 'blog')
 * @returns The public CDN URL from Cloudinary
 */
export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  const compressedBlob = await compressImageToWebP(file, 0.8);

  const formData = new FormData();
  formData.append("file", compressedBlob);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `revtech/${folder}`);

  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Cloudinary upload failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}

/**
 * Uploads a base64 Data URL to Cloudinary.
 * Useful for cropped images or generated previews that are already in base64.
 * @param dataUrl The base64 data url (e.g. data:image/png;base64,...)
 * @param folder The storage folder path
 * @returns The public CDN URL from Cloudinary
 */
export async function uploadBase64ToStorage(dataUrl: string, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", dataUrl); // Cloudinary accepts data URLs directly
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `revtech/${folder}`);

  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Cloudinary upload failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}

