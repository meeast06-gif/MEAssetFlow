'use server';
/**
 * @fileOverview A Genkit flow that summarizes a user's asset portfolio.
 *
 * - summarizeAssetPortfolio - A function that provides a high-level summary of the user's asset portfolio.
 * - SummarizeAssetPortfolioInput - The input type for the summarizeAssetPortfolio function.
 * - SummarizeAssetPortfolioOutput - The return type for the summarizeAssetPortfolio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema for the overall flow
const AssetSchema = z.object({
  name: z.string().describe('The name of the asset.'),
  type: z.string().describe('The type of asset (e.g., Stocks, Real Estate, Savings, Bonds).'),
  value: z.number().describe('The current monetary value of the asset.'),
  acquisitionDate: z.string().describe('The date the asset was acquired, in YYYY-MM-DD format.'),
  notes: z.string().optional().describe('Any additional notes about the asset.'),
});

const SummarizeAssetPortfolioInputSchema = z.object({
  assets: z.array(AssetSchema).describe('A list of assets in the user\'s portfolio.'),
});
export type SummarizeAssetPortfolioInput = z.infer<typeof SummarizeAssetPortfolioInputSchema>;

// Output Schema for the overall flow
const DistributionByTypeSchema = z.object({
  type: z.string().describe('The type of asset.'),
  value: z.number().describe('The total value of assets of this type.'),
  percentage: z.number().describe('The percentage of the total portfolio value for this asset type.'),
});

const SummarizeAssetPortfolioOutputSchema = z.object({
  totalValue: z.number().describe('The total monetary value of all assets in the portfolio.'),
  distributionByType: z.array(DistributionByTypeSchema).describe('A breakdown of asset values by type, including percentages.'),
  keyCharacteristics: z.string().describe('A high-level summary of the portfolio distribution, key characteristics, and any notable observations.'),
});
export type SummarizeAssetPortfolioOutput = z.infer<typeof SummarizeAssetPortfolioOutputSchema>;

// --- Schemas for the PROMPT (internal to the flow) ---
const PromptInputSchema = z.object({
  assets: z.array(AssetSchema).describe('A list of assets in the user\'s portfolio.'),
  calculatedTotalValue: z.number().describe('The pre-calculated total monetary value of all assets.'),
  calculatedDistributionByType: z.array(DistributionByTypeSchema).describe('The pre-calculated breakdown of asset values by type.'),
});

const PromptOutputSchema = z.object({
  keyCharacteristics: z.string().describe('A high-level summary of the portfolio distribution, key characteristics, and any notable observations.'),
});
// --- End Schemas for the PROMPT ---

// Prompt definition
const summarizeAssetPortfolioPrompt = ai.definePrompt({
  name: 'summarizeAssetPortfolioPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: PromptOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to provide a high-level summary of a user's asset portfolio based on the provided assets and pre-calculated financial data.

Focus on generating insightful 'keyCharacteristics' based on the asset list, total value, and distribution by type.
Include observations about diversification, concentration, potential growth, or any other relevant financial insights.

Assets:
{{#each assets}}
- Name: {{{name}}}, Type: {{{type}}}, Value: {{{value}}}, Acquired: {{{acquisitionDate}}}{{#if notes}}, Notes: {{{notes}}}{{/if}}
{{/each}}

Pre-calculated Total Portfolio Value: {{{calculatedTotalValue}}}

Pre-calculated Distribution by Type:
{{#each calculatedDistributionByType}}
- Type: {{{type}}}, Value: {{{value}}}, Percentage: {{{percentage}}}%
{{/each}}
`
});

// Flow definition
const summarizeAssetPortfolioFlow = ai.defineFlow(
  {
    name: 'summarizeAssetPortfolioFlow',
    inputSchema: SummarizeAssetPortfolioInputSchema,
    outputSchema: SummarizeAssetPortfolioOutputSchema,
  },
  async (input) => {
    const { assets } = input;

    // 1. Calculate total value
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

    // 2. Calculate distribution by type
    const distributionMap = new Map<string, number>();
    for (const asset of assets) {
      distributionMap.set(asset.type, (distributionMap.get(asset.type) || 0) + asset.value);
    }

    const calculatedDistributionByType: z.infer<typeof DistributionByTypeSchema>[] = Array.from(distributionMap.entries()).map(([type, value]) => ({
      type,
      value,
      percentage: totalValue === 0 ? 0 : (value / totalValue) * 100,
    }));

    // Prepare input for the prompt
    const promptInput = {
      assets,
      calculatedTotalValue: totalValue,
      calculatedDistributionByType,
    };

    // Call the prompt with the pre-calculated data
    const {output} = await summarizeAssetPortfolioPrompt(promptInput);

    // Combine pre-calculated data with LLM-generated key characteristics
    return {
      totalValue,
      distributionByType: calculatedDistributionByType,
      keyCharacteristics: output!.keyCharacteristics,
    };
  }
);

// Wrapper function for external calls
export async function summarizeAssetPortfolio(input: SummarizeAssetPortfolioInput): Promise<SummarizeAssetPortfolioOutput> {
  return summarizeAssetPortfolioFlow(input);
}
