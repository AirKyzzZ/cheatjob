export type WebhookProcessingResult =
  | { status: "ok"; eventId: string }
  | { status: "duplicate"; eventId: string }
  | { status: "error"; eventId: string; reason: string };
