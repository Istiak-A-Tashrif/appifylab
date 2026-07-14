export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('Unsupported image type');
  if (file.size > 5_000_000) throw new Error('Image must be 5 MB or smaller');
  const cloudName = process.env.NEXT_PUBLIC_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary is not configured');
  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', uploadPreset);
  body.append('folder', 'appify-feed');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body });
  const result = await response.json() as CloudinaryUploadResult & { error?: { message?: string } };
  if (!response.ok || !result.secure_url) throw new Error(result.error?.message || 'Image upload failed');
  return result;
}
