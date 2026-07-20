import { z } from "zod";

export const jasaWebFormSchema = z.object({
  name: z.string().min(2, "Nama minimal harus 2 karakter").max(100, "Nama terlalu panjang"),
  whatsapp: z.string().min(9, "Nomor WhatsApp tidak valid (minimal 9 angka)"),
  business: z.string().optional(),
  message: z.string().min(10, "Pesan minimal harus 10 karakter"),
  vipLane: z.boolean().optional(),
  handoverOption: z.string().optional(),
  reference: z.string().optional(),
});

export const katalogFormSchema = z.object({
  name: z.string().min(2, "Nama minimal harus 2 karakter").max(100, "Nama terlalu panjang"),
  product: z.string().min(2, "Nama produk minimal harus 2 karakter"),
  type: z.string().min(1, "Tipe katalog harus dipilih"),
  message: z.string().min(10, "Pesan minimal harus 10 karakter"),
});

export const customFormSchema = z.object({
  name: z.string().min(2, "Nama minimal harus 2 karakter").max(100, "Nama terlalu panjang"),
  business: z.string().optional(),
  reference: z.string().optional(),
  message: z.string().min(10, "Pesan minimal harus 10 karakter"),
});

export type JasaWebFormValues = z.infer<typeof jasaWebFormSchema>;
export type KatalogFormValues = z.infer<typeof katalogFormSchema>;
export type CustomFormValues = z.infer<typeof customFormSchema>;
