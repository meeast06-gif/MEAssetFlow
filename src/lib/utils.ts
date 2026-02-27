import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export const modules = [
    "Machinery Maintenance T02_13",
    "Plant Maintenance T02_11",
    "CAD/CAM DesignLab T01_23",
    "Electrical Fundamental"
];

export const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/[\s/]+/g, '_') // Replace spaces and slashes with a single underscore
        .replace(/[^\w_]+/g, '')   // Remove all non-word characters except underscore
        .replace(/__+/g, '_')      // Replace multiple underscores with a single one
        .replace(/^_+/, '')        // Trim leading underscores
        .replace(/_+$/, '');       // Trim trailing underscores
};

export const getModuleNameFromSlug = (slug: string): string => {
    for (const moduleName of modules) {
        if (slugify(moduleName) === slug) {
            return moduleName;
        }
    }
    // Fallback for slugs that don't match, though this shouldn't happen with our list
    const titleCased = slug.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    // This is a simple attempt to restore some casing, but it's not perfect.
    // e.g. cad_cam_designlab_t01_23 -> Cad Cam Designlab T01 23
    return titleCased;
};
