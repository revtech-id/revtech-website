import { z } from "zod";

export const jasaWebFormSchema = z.object({
  name: z.string().min(2, "Nama minimal harus 2 karakter").max(100, "Nama terlalu panjang"),
  whatsapp: z.string().min(9, "Nomor WhatsApp tidak valid (minimal 9 angka)"),
  business: z.string().optional(),
  message: z.string().min(10, "Pesan minimal harus 10 karakter"),
  handoverOption: z.string().optional(),
  reference: z.string().optional(),
});



export type JasaWebFormValues = z.infer<typeof jasaWebFormSchema>;
