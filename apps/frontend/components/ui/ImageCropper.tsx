"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import * as Dialog from "@radix-ui/react-dialog";
import getCroppedImg from "@/lib/cropImage";

interface ImageCropperProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropCompleteAction: (croppedImage: string) => void;
}

export default function ImageCropper({
  imageSrc,
  isOpen,
  onClose,
  onCropCompleteAction,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels as any);
      onCropCompleteAction(croppedImage);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--adm-bg)] w-[90vw] max-w-md rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
          <Dialog.Title className="px-6 py-4 border-b border-[var(--adm-border)] text-lg font-bold text-[var(--adm-text)]">
            Atur Posisi Foto
          </Dialog.Title>
          
          <div className="relative w-full h-[300px] bg-black/10">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-[16px] text-[var(--adm-text-3)]">zoom_out</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => {
                  setZoom(Number(e.target.value));
                }}
                className="w-full h-1 bg-[var(--adm-border)] rounded-lg appearance-none cursor-pointer"
              />
              <span className="material-symbols-outlined text-[16px] text-[var(--adm-text-3)]">zoom_in</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--adm-text)] bg-transparent hover:bg-[var(--adm-border)] transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCrop}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--adm-accent)] hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                Terapkan
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
