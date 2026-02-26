"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Asset, AssetFormData, AssetFormSchema } from "@/lib/definitions";
import { summarizeAssetPortfolio } from "@/ai/flows/summarize-asset-portfolio-flow";

const ASSET_COLLECTION = "assets";

export async function getAssets(): Promise<Asset[]> {
  try {
    const assetsCollection = collection(db, ASSET_COLLECTION);
    const q = query(assetsCollection, orderBy("acquisitionDate", "desc"));
    const assetSnapshot = await getDocs(q);
    const assetList = assetSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        value: data.value,
        acquisitionDate: (data.acquisitionDate as Timestamp).toDate().toISOString(),
        notes: data.notes,
      };
    }) as Asset[];
    return assetList;
  } catch (error) {
    console.error("Error fetching assets: ", error);
    // In a real app, you'd want more robust error handling
    return [];
  }
}

export async function addAsset(formData: AssetFormData) {
  try {
    const validatedFields = AssetFormSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid fields. Failed to create asset.',
      };
    }

    const { acquisitionDate, ...rest } = validatedFields.data;

    await addDoc(collection(db, ASSET_COLLECTION), {
      ...rest,
      acquisitionDate: Timestamp.fromDate(acquisitionDate),
    });

    revalidatePath("/");
    return { message: "Asset added successfully." };
  } catch (error) {
    console.error("Error adding asset:", error);
    return { message: "Database Error: Failed to add asset." };
  }
}

export async function updateAsset(id: string, formData: AssetFormData) {
  try {
    const validatedFields = AssetFormSchema.safeParse(formData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid fields. Failed to update asset.',
      };
    }

    const { acquisitionDate, ...rest } = validatedFields.data;
    const assetRef = doc(db, ASSET_COLLECTION, id);

    await updateDoc(assetRef, {
      ...rest,
      acquisitionDate: Timestamp.fromDate(acquisitionDate),
    });

    revalidatePath("/");
    return { message: "Asset updated successfully." };
  } catch (error) {
    console.error("Error updating asset:", error);
    return { message: "Database Error: Failed to update asset." };
  }
}

export async function deleteAsset(id: string) {
  try {
    await deleteDoc(doc(db, ASSET_COLLECTION, id));
    revalidatePath("/");
    return { message: "Asset deleted successfully." };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { message: "Database Error: Failed to delete asset." };
  }
}


export async function getAiSummary() {
  try {
    const assets = await getAssets();
    if (assets.length === 0) {
      return { summary: "No assets found to analyze. Please add some assets first.", totalValue: 0, distribution: [] };
    }

    const flowInput = assets.map(asset => ({
        ...asset,
        acquisitionDate: asset.acquisitionDate.split('T')[0] // Format as YYYY-MM-DD
    }));

    const result = await summarizeAssetPortfolio({ assets: flowInput });

    return {
      summary: result.keyCharacteristics,
      totalValue: result.totalValue,
      distribution: result.distributionByType,
    };
  } catch (error) {
    console.error("Error getting AI summary: ", error);
    return { error: "Failed to generate AI summary. Please try again later." };
  }
}
