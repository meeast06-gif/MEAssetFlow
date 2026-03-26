'use client';

import * as React from "react";

type AiResponseState = {
  response: string;
};

// Simple in-memory store for the response string
let memoryState: AiResponseState = { response: "" };

// Array of listener functions
const listeners: Array<(state: AiResponseState) => void> = [];

// Dispatch function to update state and notify all subscribed components
function dispatch(newState: AiResponseState) {
  memoryState = newState;
  for (const listener of listeners) {
    listener(memoryState);
  }
}

/**
 * A React hook to subscribe to and display the latest global AI response.
 * @returns The current AI response state.
 */
export function useAiResponse() {
  const [state, setState] = React.useState<AiResponseState>(memoryState);

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
 * A function to set a new AI response from anywhere in the application.
 * This will trigger an update in all components using the useAiResponse hook.
 * @param response The new response string to be displayed.
 */
export function setAiResponse(response: string) {
  dispatch({ response });
}
