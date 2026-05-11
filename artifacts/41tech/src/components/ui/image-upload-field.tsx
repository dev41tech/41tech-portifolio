import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import { uploadFile } from "@workspace/api-client-react";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  placeholder?: string;
  previewClassName?: string;
}

export function ImageUploadField({
  value,
  onChange,
  folder,
  placeholder = "https://...",
  previewClassName = "h-16 w-auto",
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadFile(folder, file);
      onChange(result.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao fazer upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Enviar imagem"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {uploadError && (
        <p className="text-xs text-destructive">{uploadError}</p>
      )}

      {value && (
        <img
          src={value}
          alt="Preview"
          className={`${previewClassName} object-contain rounded border border-border bg-muted p-1`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
          onLoad={(e) => {
            (e.target as HTMLImageElement).style.display = "";
          }}
        />
      )}
    </div>
  );
}
