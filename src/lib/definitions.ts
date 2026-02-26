import { z } from "zod";
import { ASSET_TYPES } from "./constants";

export const AssetFormSchema = z.object({
  name: z.string().min(2, "Asset name must be at least 2 characters."),
  type: z.enum(ASSET_TYPES),
  value: z.coerce.number().min(0, "Value must be a positive number."),
  acquisitionDate: z.date({
    required_error: "Acquisition date is required.",
  }),
  notes: z.string().optional(),
});

export type AssetFormData = z.infer<typeof AssetFormSchema>;

export type Asset = {
  id: string;
  name: string;
  type: (typeof ASSET_TYPES)[number];
  value: number;
  acquisitionDate: string; // Stored as ISO string in Firestore
  notes?: string;
};
