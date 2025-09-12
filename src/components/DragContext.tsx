import React, { createContext, useContext, useState } from "react";

interface DragContextType {
  isDragging: boolean;
  draggedImage: { fromSlot: number; imageIndex: number } | null;
  setDragState: (isDragging: boolean, draggedImage?: { fromSlot: number; imageIndex: number } | null) => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImage, setDraggedImage] = useState<{ fromSlot: number; imageIndex: number } | null>(null);

  const setDragState = (isDragging: boolean, draggedImage?: { fromSlot: number; imageIndex: number } | null) => {
    setIsDragging(isDragging);
    setDraggedImage(draggedImage || null);
  };

  return (
    <DragContext.Provider value={{ isDragging, draggedImage, setDragState }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error("useDrag must be used within a DragProvider");
  }
  return context;
}