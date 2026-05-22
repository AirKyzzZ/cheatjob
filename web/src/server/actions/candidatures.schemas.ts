import { z } from "zod";

export const Step1Schema = z.object({
  companyName: z.string().min(1).max(200),
  companyWebsite: z.string().max(300).optional().or(z.literal("")),
});

export const Step2Schema = z.object({
  managerFirstName: z.string().min(1).max(100),
  managerLastName: z.string().min(1).max(100),
  managerRole: z.string().min(1).max(200),
  managerLinkedinUrl: z.string().max(300).optional().or(z.literal("")),
  targetRole: z.string().max(200).optional().or(z.literal("")),
});

export const Step4Schema = z.object({
  offerUrl: z.string().max(500).optional().or(z.literal("")),
  offerText: z.string().max(8000).optional().or(z.literal("")),
});

export const ManualEmailSchema = z.object({
  email: z.string().email().max(320),
});

export const CandidatureIdSchema = z.object({ id: z.string().uuid() });

export const SetStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["replied", "closed"]),
  closedReason: z.enum(["won", "rejected", "gave_up", "other"]).optional(),
});

export const SaveDraftEditSchema = z.object({
  candidatureId: z.string().uuid(),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(8000),
});
