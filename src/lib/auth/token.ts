// In-memory token storage
let accessToken: string | null = null;

export const tokenManager = {
  setAccessToken: (token: string) => {
    accessToken = token;
  },

  getAccessToken: () => {
    return accessToken;
  },

  clearAccessToken: () => {
    accessToken = null;
  },
};
