"use client";

import {
  AlertCircleIcon,
  ImageIcon,
  XIcon,
  CircleUserRoundIcon,
} from "lucide-react";
import { useFileUpload, type FileUploadOptions } from "@/hooks/use-file-upload";
import { FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef } from "react";

type OmitFileUploadOptions = Omit<
  FileUploadOptions,
  "multiple" | "maxFiles" | "onFilesChange" | "onFilesAdded" | "initialFiles"
>;

// Shared hook for file upload logic
function useFileUploadLogic({
  value,
  onChange,
  maxSize,
  accept,
  ...options
}: {
  value?: string;
  onChange?: (value: string) => void;
  maxSize: number;
  accept: string;
} & OmitFileUploadOptions) {
  const prevFilesLengthRef = useRef(0);

  const handleFilesChange = useCallback((files: any[]) => {
    // Don't call onChange here - let useEffect handle it
  }, []);

  const fileUploadReturn = useFileUpload({
    accept,
    maxSize,
    multiple: false,
    ...options,
  });

  const [{ files }] = fileUploadReturn;

  // Handle onChange in useEffect to avoid render-phase state updates
  useEffect(() => {
    if (files.length > 0) {
      onChange?.(files[0].preview || "");
    } else if (prevFilesLengthRef.current > 0 && files.length === 0) {
      // Only clear when files transition from >0 to 0 (user explicitly removed)
      onChange?.("");
    }
    prevFilesLengthRef.current = files.length;
  }, [files, onChange]);

  const previewUrl = value || files[0]?.preview || null;
  const fileName = files[0]?.file.name || null;
  const maxSizeMB = Math.round(maxSize / (1024 * 1024));

  const handleRemove = useCallback(() => {
    if (files[0]?.id) {
      fileUploadReturn[1].removeFile(files[0].id);
    }
    // Explicitly clear the selection immediately
    onChange?.("");
  }, [files, fileUploadReturn, onChange]);

  return [
    fileUploadReturn[0],
    fileUploadReturn[1],
    {
      previewUrl,
      fileName,
      maxSizeMB,
      handleRemove,
    },
  ] as const;
}

interface FileUploadFieldProps extends OmitFileUploadOptions {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function FileUploadField({
  value,
  onChange,
  placeholder = "Drop your image here",
  maxSize = 2 * 1024 * 1024, // 2MB default
  accept = "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
  ...options
}: FileUploadFieldProps) {
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
    { previewUrl, maxSizeMB, handleRemove },
  ] = useFileUploadLogic({
    value,
    onChange,
    maxSize,
    accept,
    ...options,
  });

  return (
    <FormControl>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-dragging={isDragging || undefined}
            className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
          >
            <input
              {...getInputProps()}
              className="sr-only"
              aria-label="Upload image file"
            />
            {previewUrl ? (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <img
                  src={previewUrl}
                  alt="Uploaded image"
                  className="mx-auto max-h-full rounded object-contain"
                />
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center px-4 py-3 text-center cursor-pointer"
                onClick={openFileDialog}
              >
                <div
                  className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                  aria-hidden="true"
                >
                  <ImageIcon className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">{placeholder}</p>
                <p className="text-muted-foreground text-xs">
                  SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
                </p>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="absolute top-2 right-2">
              <button
                type="button"
                className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                onClick={handleRemove}
                aria-label="Remove image"
              >
                <XIcon className="size-3" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {errors.length > 0 && (
          <div
            className="text-destructive flex items-center gap-1 text-xs"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{errors[0]}</span>
          </div>
        )}
      </div>
    </FormControl>
  );
}

// Image Uploader Variant Component
interface ImageUploaderProps extends OmitFileUploadOptions {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function ImageUploader({
  value,
  onChange,
  placeholder = "Upload image",
  maxSize = 2 * 1024 * 1024, // 2MB default
  accept = "image/*",
  ...options
}: ImageUploaderProps) {
  const [
    { errors },
    { openFileDialog, getInputProps },
    { previewUrl, fileName, handleRemove },
  ] = useFileUploadLogic({
    value,
    onChange,
    maxSize,
    accept,
    ...options,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex items-center gap-2 align-top">
        <div
          className="border-input relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border"
          aria-label={
            previewUrl ? "Preview of uploaded image" : "Default user avatar"
          }
        >
          {previewUrl ? (
            <img
              className="size-full object-cover"
              src={previewUrl}
              alt="Preview of uploaded image"
              width={32}
              height={32}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="opacity-60" size={16} />
            </div>
          )}
        </div>
        <div className="relative inline-block">
          <Button
            type="button"
            onClick={openFileDialog}
            variant="outline"
            size="sm"
          >
            {previewUrl ? "Change image" : placeholder}
          </Button>
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload image file"
            tabIndex={-1}
          />
        </div>
      </div>

      {fileName && (
        <div className="inline-flex gap-2 text-xs">
          <p className="text-muted-foreground truncate" aria-live="polite">
            {fileName ?? "No file selected"}
          </p>
          <button
            type="button"
            onClick={handleRemove}
            className="text-destructive font-medium hover:underline"
            aria-label={fileName ? `Remove ${fileName}` : "Remove image"}
          >
            Remove
          </button>
        </div>
      )}

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
