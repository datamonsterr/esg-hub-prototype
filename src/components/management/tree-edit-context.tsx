"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/src/types';

interface TreeEditContextType {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  selectedNodeForEdit: Product | null;
  setSelectedNodeForEdit: (product: Product | null) => void;
  showEditPanel: boolean;
  setShowEditPanel: (show: boolean) => void;
  editAction: 'edit' | 'add' | null;
  setEditAction: (action: 'edit' | 'add' | null) => void;
  pendingParentId: string | null;
  setPendingParentId: (id: string | null) => void;
}

const TreeEditContext = createContext<TreeEditContextType | undefined>(undefined);

export const TreeEditProvider = ({ children }: { children: ReactNode }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState<Product | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editAction, setEditAction] = useState<'edit' | 'add' | null>(null);
  const [pendingParentId, setPendingParentId] = useState<string | null>(null);

  return (
    <TreeEditContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        selectedNodeForEdit,
        setSelectedNodeForEdit,
        showEditPanel,
        setShowEditPanel,
        editAction,
        setEditAction,
        pendingParentId,
        setPendingParentId,
      }}
    >
      {children}
    </TreeEditContext.Provider>
  );
};

export const useTreeEdit = () => {
  const context = useContext(TreeEditContext);
  if (context === undefined) {
    throw new Error('useTreeEdit must be used within a TreeEditProvider');
  }
  return context;
};
