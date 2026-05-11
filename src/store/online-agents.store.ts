// stores/onlineAgentsStore.ts
import { create } from "zustand";
import axios from "axios";
import type { Agent } from "@/types/user/agent";
import { USER_ROLE } from "@/constants/user.const";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";

// ------------------------------------------------------------------
// 1. Axios instance (inline, no separate lib file)
const socketApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_SOCKET_API_SECRET_KEY,
  },
});

// ------------------------------------------------------------------
// 2. Store interface
interface OnlineAgentsState {
  // Data: record keyed by agent ID → no duplicates
  agents: Record<string, Agent>;

  // Loading & error states
  isLoading: boolean;
  isRegistering: boolean;
  isRemoving: boolean;
  error: string | null;

  // Actions
  fetchOnlineAgents: () => Promise<void>;
  registerAgent: (agent: Agent) => Promise<void>;
  removeAgent: (id: string) => Promise<void>;
}

// ------------------------------------------------------------------
// 3. Create the store
export const useOnlineAgentsStore = create<OnlineAgentsState>((set) => ({
  agents: {},
  isLoading: false,
  isRegistering: false,
  isRemoving: false,
  error: null,

  // Fetch all online agents (GET /api/online-agents)
  fetchOnlineAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await socketApi.get<{ data: Agent[] }>(
        "/api/online-agents",
        {
          params: {
            "user-roles": `${USER_ROLE.ADMIN},${USER_ROLE.SUPPORT}`,
          },
        },
      );
      const agentsMap: Record<string, Agent> = {};
      data.data.forEach((data) => {
        agentsMap[data.id] = data;
      });
      set({ agents: agentsMap, isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: extractErrorMessage(err) || "Failed to fetch online agents",
      });
    }
  },

  // Register a single agent (POST /api/online-agents)
  registerAgent: async (agent: Agent) => {
    set({ isRegistering: true, error: null });
    try {
      // Add/update the agent – duplicate ID simply overwrites
      set((state) => ({
        agents: { ...state.agents, [agent.id]: agent },
        isRegistering: false,
      }));
    } catch (err: unknown) {
      set({
        isRegistering: false,
        error: extractErrorMessage(err) || "Failed to register agent",
      });
    }
  },

  // Remove an agent by ID (DELETE /api/online-agents/:id)
  removeAgent: async (id: string) => {
    set({ isRemoving: true, error: null });
    try {
      // Destructure to remove the agent from the record
      set((state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = state.agents;
        return { agents: rest, isRemoving: false };
      });
    } catch (err: unknown) {
      set({
        isRemoving: false,
        error: extractErrorMessage(err) || "Failed to remove agent",
      });
    }
  },
}));
