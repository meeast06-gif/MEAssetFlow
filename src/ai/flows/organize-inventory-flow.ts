'use server';
/**
 * @fileOverview A Genkit flow that interprets user commands to organize inventory assets.
 *
 * - organizeInventory - A function that parses a user's prompt and returns a structured action plan.
 * - OrganizeInventoryInput - The input type for the organizeInventory function.
 * - OrganizeInventoryOutput - The return type for the organizeInventory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas for the flow
export const OrganizeInventoryInputSchema = z.object({
  prompt: z.string().describe("The user's natural language command."),
  currentModuleSlug: z.string().describe("The slug of the module the user is currently viewing."),
  availableModules: z.array(z.object({
      name: z.string(),
      slug: z.string(),
  })).describe("A list of all available modules with their names and slugs."),
});
export type OrganizeInventoryInput = z.infer<typeof OrganizeInventoryInputSchema>;

const MoveActionSchema = z.object({
  action: z.literal('move'),
  sourceModuleSlug: z.string().describe("The slug of the module to move the asset from."),
  destinationModuleSlug: z.string().describe("The slug of the module to move the asset to."),
  assetIdentifier: z.object({
    ams_asset_id: z.string().optional(),
    asset_description: z.string().optional(),
    end_user: z.string().optional(),
  }).describe("The properties to uniquely identify the asset to be moved. Use only one of the properties."),
  reasoning: z.string().describe("A brief explanation of the action to be taken for the user."),
});

const NoActionSchema = z.object({
    action: z.literal('none'),
    reasoning: z.string().describe("Explanation why no action was taken, or a natural language response to the user's query if it wasn't an action-oriented command."),
});

export const OrganizeInventoryOutputSchema = z.union([MoveActionSchema, NoActionSchema]);
export type OrganizeInventoryOutput = z.infer<typeof OrganizeInventoryOutputSchema>;

// Wrapper function for external calls
export async function organizeInventory(input: OrganizeInventoryInput): Promise<OrganizeInventoryOutput> {
  return organizeInventoryFlow(input);
}


// Prompt definition
const organizeInventoryPrompt = ai.definePrompt({
  name: 'organizeInventoryPrompt',
  input: {schema: OrganizeInventoryInputSchema},
  output: {schema: OrganizeInventoryOutputSchema},
  prompt: `You are an AI assistant for an asset management system. Your task is to interpret a user's command and translate it into a structured action.

The user is currently in the module with slug: '{{{currentModuleSlug}}}'.

Here are the available modules they can move assets to:
{{#each availableModules}}
- Name: '{{{name}}}', Slug: '{{{slug}}}'
{{/each}}

Analyze the user's prompt: "{{{prompt}}}"

- If the user wants to move an asset, identify the asset and the destination module.
  - The asset can be identified by its "ams_asset_id", "asset_description", or "end_user". Use the most specific identifier you can find in the prompt. Prioritize 'ams_asset_id' if mentioned. Populate only ONE identifier field to ensure a specific search.
  - The destination module might be mentioned by name. You MUST map this name to its correct slug from the provided list.
  - If successful, return a 'move' action object. The sourceModuleSlug is always the currentModuleSlug. The reasoning should be a confirmation message for the user.

- If the user's prompt is not a 'move' command, or if it's ambiguous, or if the destination module doesn't exist, return a 'none' action object.
  - In the 'reasoning' field for 'none' actions, provide a helpful, natural language response. For example, if a destination module is not found, list the available modules. If the request is a general question, answer it.

Example:
User Prompt: "move asset with id ME-1234 to Plant Maintenance T02_11"
Current Module Slug: "machinery_maintenance_t02_13"
Output:
{
  "action": "move",
  "sourceModuleSlug": "machinery_maintenance_t02_13",
  "destinationModuleSlug": "plant_maintenance_t02_11",
  "assetIdentifier": { "ams_asset_id": "ME-1234" },
  "reasoning": "Understood. Moving asset ME-1234 from Machinery Maintenance T02_13 to Plant Maintenance T02_11."
}
`
});

// Flow definition
const organizeInventoryFlow = ai.defineFlow(
  {
    name: 'organizeInventoryFlow',
    inputSchema: OrganizeInventoryInputSchema,
    outputSchema: OrganizeInventoryOutputSchema,
  },
  async (input) => {
    const {output} = await organizeInventoryPrompt(input);

    // Validate that the destination slug exists before returning
    if (output?.action === 'move') {
        const destSlugExists = input.availableModules.some(m => m.slug === output.destinationModuleSlug);
        if (!destSlugExists) {
            return {
                action: 'none',
                reasoning: `Destination module not found. Available modules are: ${input.availableModules.map(m => m.name).join(', ')}.`
            }
        }
    }

    return output!;
  }
);
