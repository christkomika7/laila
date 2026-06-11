import { env } from "./env";

const apiServerClient = {
  fetch: async (url: string, options: RequestInit = {}) => {
    return await window.fetch(env.VITE_SERVER_HOST + url, options);
  },
};

export default apiServerClient;

export { apiServerClient };
