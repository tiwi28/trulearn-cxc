//strictly for testing purposes only
//mostly added it for UI testing

export const ENABLE_MOCK_MODE = true; // Toggle to enable/disable

export const mockConfig = {
  apiDelay: 800, // delay sim

  debug: true,
};

export const simulateDelay = (ms: number = mockConfig.apiDelay): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


export const logMockCall = (endpoint: string, data?: any) => {
  if (mockConfig.debug) {
    console.log(`[MOCK API] ${endpoint}`, data || '');
  }
};
