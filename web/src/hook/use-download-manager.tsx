import { useState, useCallback } from "react";
import { toast } from "sonner";
import apiServerClient from "@/lib/api";

export const useDownloadManager = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadItem = useCallback(
    async (orderId: string, itemId: string, fallbackName = "download") => {
      if (!orderId || !itemId) {
        toast.error("Informations de téléchargement manquantes.");
        return;
      }

      setIsDownloading(true);
      setProgress(10);

      try {
        // Fetch the file through the API server client to ensure auth headers are included
        const response = await apiServerClient.fetch(
          `/download/${orderId}/${itemId}`,
        );

        setProgress(50);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              "Le téléchargement a échoué. Veuillez réessayer.",
          );
        }

        // Get filename from Content-Disposition header if available
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = fallbackName;
        if (contentDisposition && contentDisposition.includes("filename=")) {
          const matches = /filename="([^"]+)"/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        setProgress(80);

        // Convert response to blob and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setProgress(100);
        toast.success("Téléchargement démarré avec succès.");
      } catch (error: any) {
        console.error("[DownloadManager] Error:", error);
        toast.error(
          error.message || "Une erreur est survenue lors du téléchargement.",
        );
      } finally {
        setTimeout(() => {
          setIsDownloading(false);
          setProgress(0);
        }, 500);
      }
    },
    [],
  );

  return { downloadItem, isDownloading, progress };
};
