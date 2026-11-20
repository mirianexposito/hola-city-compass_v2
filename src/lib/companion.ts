import {
  simulateReply,
  type Activity,
  type ChatReply,
  type ConversationTurn,
  type Preferences,
  type RecommendationMemory,
  type Resource,
} from "./city-logic";
export type CompanionRequest = {
  message: string;
  history: ConversationTurn[];
  profile: Preferences;
  memory: RecommendationMemory;
  activities: Activity[];
  resources: Resource[];
};
export interface CompanionAdapter {
  reply(request: CompanionRequest): Promise<ChatReply>;
}
// A future service adapter replaces this implementation, not the message/UI contracts.
export const simulatedCompanion: CompanionAdapter = {
  reply: (r) =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve(
            simulateReply(r.message, r.profile, r.activities, r.history, r.memory, r.resources),
          ),
        350,
      ),
    ),
};
