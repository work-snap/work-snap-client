"use client";

import React, { useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface StableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  backdrop?: "opaque" | "blur" | "transparent";
}

export function StableModal({
  isOpen,
  onClose,
  title = "Modal",
  children,
  footer,
  size = "md",
  backdrop = "blur",
}: StableModalProps) {
  const isOpenRef = useRef(isOpen);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Track isOpen state to prevent rapid open/close
  useEffect(() => {
    if (isOpen && !isOpenRef.current) {
      // Opening modal
      isOpenRef.current = true;
      
      // Clear any pending close timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    } else if (!isOpen && isOpenRef.current) {
      // Closing modal - add slight delay to prevent rapid toggling
      timeoutRef.current = setTimeout(() => {
        isOpenRef.current = false;
      }, 50);
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Prevent event bubbling that might cause modal to close immediately
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOpenChange = (open: boolean) => {
    // Only allow closing if modal has been open for at least 100ms
    if (!open && isOpenRef.current) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      size={size}
      backdrop={backdrop}
      placement="center"
      closeButton
      isDismissable={true}
      isKeyboardDismissDisabled={false}
      hideCloseButton={false}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent onClick={handleModalContentClick}>
        {(onModalClose) => (
          <>
            {title && (
              <ModalHeader className="flex flex-col gap-1">
                {title}
              </ModalHeader>
            )}
            {children && (
              <ModalBody>
                {children}
              </ModalBody>
            )}
            {footer ? (
              <ModalFooter>
                {footer}
              </ModalFooter>
            ) : (
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={() => {
                    onModalClose();
                    onClose();
                  }}
                >
                  닫기
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}