"use server";

import { Asset } from "@/lib/definitions";
import { summarizeAssetPortfolio } from "@/ai/flows/summarize-asset-portfolio-flow";
import { organizeInventory, OrganizeInventoryOutput } from "@/ai/flows/organize-inventory-flow";
import { modules, slugify } from "./utils";

// This server action is now only responsible for the AI summary generation.
// All direct Firestore operations have been moved to client components.
export async function getAiSummary(assets: Asset[]) {
  try {
    if (assets.length === 0) {
      return { summary: "No assets found to analyze. Please add some assets first.", totalValue: 0, distribution: [] };
    }

    const flowInput = assets.map(asset => ({
        name: asset.name,
        type: asset.type,
        value: asset.currentValue,
        acquisitionDate: asset.acquisitionDate.split('T')[0], // Format as YYYY-MM-DD
        notes: asset.notes,
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

// New Server Action for the AI Organizer
export async function getAiOrganizerAction(
  prompt: string,
  currentModuleSlug: string,
  itemNameForCalculation?: string
): Promise<OrganizeInventoryOutput> {
  try {
    const availableModules = modules.map(name => ({ name, slug: slugify(name) }));
    
    const result = await organizeInventory({
      prompt,
      currentModuleSlug,
      availableModules,
      itemNameForCalculation,
    });

    return result;
  } catch (error) {
    console.error("Error in getAiOrganizerAction: ", error);
    return {
      action: 'none',
      reasoning: "I'm sorry, I encountered an error while processing your request. Please try again."
    };
  }
}
