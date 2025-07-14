"use client";

import { useState, ReactNode, createContext, useCallback, useMemo } from 'react';
import { Dialog, DialogContent } from '@/src/components/ui/dialog';

const ModalContext = createContext<any>(null);

export { ModalContext };

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);

  const showModal = useCallback((content: ReactNode) => {
    setModalContent(content);
  }, []);

  const hideModal = useCallback(() => {
    setModalContent(null);
  }, []);

  const value = useMemo(() => ({ showModal, hideModal }), [showModal, hideModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modalContent && (
        <Dialog open={!!modalContent} onOpenChange={hideModal}>
          <DialogContent>{modalContent}</DialogContent>
        </Dialog>
      )}
    </ModalContext.Provider>
  );
}; 