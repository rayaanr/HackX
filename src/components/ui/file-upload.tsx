"use client";

import { AlertCircleIcon, ImageIcon, XIcon } from "lucide-react";
import { useFileUpload, type FileUploadOptions } from "@/hooks/use-file-upload";
import { FormControl } from "@/components/ui/form";

interface FileUploadFieldProps extends FileUploadOptions {
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
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept,
    maxSize,
    onFilesChange: (files) => {
      if (files.length > 0) {
        onChange?.(files[0].preview || "");
      } else {
        onChange?.("");
      }
    },
    ...options,
  });

  const previewUrl = value || files[0]?.preview || null;
  const maxSizeMB = Math.round(maxSize / (1024 * 1024));

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
              <div className="flex flex-col items-center justify-center px-4 py-3 text-center cursor-pointer" onClick={openFileDialog}>
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
                onClick={() => {
                  if (files[0]?.id) {
                    removeFile(files[0].id);
                  }
                  onChange?.("");
                }}
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