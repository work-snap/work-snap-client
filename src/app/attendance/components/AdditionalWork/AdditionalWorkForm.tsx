"use client";

import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { additionalWorkSchema, type AdditionalWorkFormProps } from "./types";
import { VALIDATION_MESSAGES } from "@/lib/constants";

// Helper to format date to YYYY-MM-DDTHH:mm
const formatDateForInput = (date: Date): string => {
  return date.toISOString().slice(0, 16);
};

// Helper to get default start time (next hour)
const getDefaultStartTime = (): Date => {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date;
};

// Helper to get default end time (start time + 1 hour)
const getDefaultEndTime = (startTime: Date): Date => {
  const date = new Date(startTime);
  date.setHours(date.getHours() + 1);
  return date;
};

export const AdditionalWorkForm: React.FC<AdditionalWorkFormProps> = ({
  workplaceId,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}) => {
  const startTime = getDefaultStartTime();
  const endTime = getDefaultEndTime(startTime);

  const formik = useFormik({
    initialValues: {
      startTime: formatDateForInput(startTime),
      endTime: formatDateForInput(endTime),
      workplaceId,
      description: "",
    },
    validationSchema: toFormikValidationSchema(additionalWorkSchema),
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission failed:", error);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="startTime"
          className="block text-sm font-medium text-gray-700"
        >
          시작 시간
        </label>
        <input
          type="datetime-local"
          id="startTime"
          name="startTime"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.startTime}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-main focus:ring-main sm:text-sm"
          disabled={isSubmitting}
        />
        {formik.touched.startTime && formik.errors.startTime && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.startTime}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="endTime"
          className="block text-sm font-medium text-gray-700"
        >
          종료 시간
        </label>
        <input
          type="datetime-local"
          id="endTime"
          name="endTime"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.endTime}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-main focus:ring-main sm:text-sm"
          disabled={isSubmitting}
        />
        {formik.touched.endTime && formik.errors.endTime && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.endTime}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          추가 근무 사유
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.description}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-main focus:ring-main sm:text-sm"
          disabled={isSubmitting}
        />
        {formik.touched.description && formik.errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {formik.errors.description}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-5 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-main px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-main/90 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2"
        >
          {isSubmitting ? "처리 중..." : "추가 근무 등록"}
        </button>
      </div>
    </form>
  );
};
