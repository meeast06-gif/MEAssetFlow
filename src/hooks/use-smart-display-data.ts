'use client';

import * as React from "react";
import type { InventoryAsset } from "@/lib/definitions";

type SmartDisplayState = {
  assets: InventoryAsset[];
};

// Simple in-memory store for the response string
let memoryState: SmartDisplayState = { assets: [] };

// Array of listener functions
const listeners: Array<(state: SmartDisplayState) => void> = [];

// Dispatch function to update state and notify all subscribed components
function dispatch(newState: SmartDisplayState) {
  memoryState = newState;
  for (const listener of listeners) {
    listener(memoryState);
  }
}

/**
 * A React hook to subscribe to and display the latest global smart display data.
 * @returns The current smart display state.
 */
export function useSmartDisplayData() {
  const [state, setState] = React.useState<SmartDisplayState>(memoryState);

  React.useEffect(() => {
    // Add the component's setState function to the listeners array on mount
    listeners.push(setState);
    
    // On unmount, remove the listener to prevent memory leaks
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return state;
}

/**
 * A function to set new asset data for the smart display from anywhere in the application.
 * This will trigger an update in all components using the useSmartDisplayData hook.
 * @param assets The new array of assets to be displayed.
 */
export function setSmartDisplayData(assets: InventoryAsset[]) {
  dispatch({ assets });
}
