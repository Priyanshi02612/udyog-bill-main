import Image from "next/image";
import React from "react";
import { MdClose, MdCloudUpload } from "react-icons/md";

type ImageUploaderProps = {
  label?: string;
  preview?: string;
  onChange: (file: File | null, preview: string) => void;
};

export const ImageUploader = ({
  label = "Item Image",
  preview,
  onChange,
}: ImageUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    onChange(file, previewUrl);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-[#0d161b]">{label}</label>

      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-primary hover:bg-primary/5 transition">
          <MdCloudUpload className="h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-600">Click to upload image</p>
          <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="relative w-full max-w-xs">
          <Image
            src={preview}
            alt="Preview"
            width={30}
            height={30}
            className="h-40 w-full rounded-xl object-cover border border-slate-200"
          />
          <button
            type="button"
            onClick={() => onChange(null, "")}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black"
          >
            <MdClose size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
