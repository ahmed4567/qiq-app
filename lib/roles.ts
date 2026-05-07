export type PortalRole = "admin" | "reviewer" | "agent";

export type PortalUserSummary = {
  name: string;
  email: string;
  picture?: string;
  role: PortalRole;
  agentId?: string;
  reviewerId?: string;
};
