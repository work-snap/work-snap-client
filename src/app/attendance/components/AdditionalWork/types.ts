import { z } from "zod";
import { VALIDATION_MESSAGES } from "@/lib/constants";

// Helper function to convert string to Date
const parseDateTime = (val: string): Date => {
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  return date;
};

// Validation Schema
export const additionalWorkSchema = z
  .object({
    startTime: z
      .string()
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: VALIDATION_MESSAGES.INVALID_DATE,
      })
      .transform(parseDateTime),
    endTime: z
      .string()
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: VALIDATION_MESSAGES.INVALID_DATE,
      })
      .transform(parseDateTime),
    workplaceId: z.string().uuid("올바른 작업장 ID가 아닙니다."),
    description: z
      .string()
      .min(1, VALIDATION_MESSAGES.REQUIRED)
      .max(500, VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: VALIDATION_MESSAGES.INVALID_RANGE,
    path: ["endTime"],
  });

// Form data type with string dates (for form inputs)
export interface AdditionalWorkFormInput {
  startTime: string;
  endTime: string;
  workplaceId: string;
  description: string;
}

// API data type with Date objects (after validation)
export type AdditionalWorkFormData = z.infer<typeof additionalWorkSchema>;

// Props types
export interface AdditionalWorkModalProps {
  workplaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export interface AdditionalWorkFormProps {
  workplaceId: string;
  onSubmit: (data: AdditionalWorkFormInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
}
