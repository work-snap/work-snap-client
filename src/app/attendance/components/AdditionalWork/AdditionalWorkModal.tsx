"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdditionalWorkForm } from "./AdditionalWorkForm";
import type {
  AdditionalWorkFormData,
  AdditionalWorkFormInput,
  AdditionalWorkModalProps,
} from "./types";
import { attendanceApi } from "@/lib/api/attendance";
import { QUERY_KEYS } from "@/lib/constants";

export const AdditionalWorkModal: React.FC<AdditionalWorkModalProps> = ({
  workplaceId,
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: AdditionalWorkFormInput) => {
      return attendanceApi.createAdditionalWork(
        data as unknown as AdditionalWorkFormData
      );
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTENDANCE] });
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      onError(error);
    },
  });

  const handleSubmit = async (data: AdditionalWorkFormInput) => {
    mutate(data);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  추가 근무 등록
                </Dialog.Title>
                <div className="mt-4">
                  <AdditionalWorkForm
                    workplaceId={workplaceId}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isSubmitting={isPending}
                    error={error?.message}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
