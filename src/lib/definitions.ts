import { z } from "zod";
import { ASSET_TYPES } from "./constants";
import type { Timestamp } from "firebase/firestore";

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

// Represents the data structure in Firestore
export type Asset = {
  id: string;
  userId: string;
  name: string;
  type: (typeof ASSET_TYPES)[number];
  currentValue: number;
  acquisitionDate: string; // Stored as ISO string for client
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type InventoryAsset = {
  id: string;
  agency?: string;
  ams_asset_id?: string;
  asset_category?: string;
  asset_description?: string;
  asset_group?: string;
  asset_useful_lifespan__month_?: string;
  depreciation_amount?: string;
  end_user?: string;
  custodian?: string;
  in_service_date?: string;
  net_book_value?: string;
  remaining_lifespan?: string;
  remarks?: string;
  status?: string;
};

export type PEMConsumable = {
  id: string;
  sn?: string;
  order_number?: string;
  item_name?: string;
  quantity?: string;
  date_ordered?: string;
  date_received?: string;
  next_order?: string;
};
