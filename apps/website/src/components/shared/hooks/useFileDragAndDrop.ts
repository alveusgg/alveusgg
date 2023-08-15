import { useState } from "react";

export function useFileDragAndDrop(
  addFiles: (filesToAdd: FileList | null) => Promise<void>,
) {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDrag = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await addFiles(e.dataTransfer.files);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.clearData();
  };

  return {
    isDragging,
    dragProps: {
      onDrop: handleDrop,
      onDragEnter: handleDragIn,
      onDragLeave: handleDragOut,
      onDragOver: handleDrag,
      onDragStart: handleDragStart,
    },
  };
}
