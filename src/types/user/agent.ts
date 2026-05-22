import { USER_ROLE } from "@/constants/user.const";

// types/user/agent.ts
export interface Agent {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: USER_ROLE.SUPPORT | USER_ROLE.ADMIN;
}

// API response when fetching all online agents
export interface OnlineAgentsResponse {
    agents: Agent[];
}

// API response for a single agent (register/remove)
export interface AgentActionResponse {
    agent: Agent;
}