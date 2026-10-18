import { useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FaXmark, FaCircleExclamation } from "react-icons/fa6";

import { AuthencreatedContext } from "../../context/AuthenContext";

export type ImageKind = "photo" | "cover";

const baseUrl = "https://route-posts.routemisr.com";

const UPLOAD_CONFIG: Record<
  ImageKind,
  { endpoint: string; field: string; title: string; hint: string }
> = {
  photo: {
    endpoint: "/users/upload-photo",
    field: "photo",
    title: "Update profile photo",
    hint: "This is how others will see you across Wesal.",
  },
  cover: {
    // تأكد من الـ endpoint الصحيح للكوفر في توثيق الـ API
    endpoint: "/users/upload-cover",
    field: "cover",
    title: "Update cover photo",
    hint: "A wide image works best for the top of your profile.",
  },
};

interface ProfileImageModalProps {
  kind: ImageKind;
  file: File;
  onClose: () => void;
  onSuccess: (kind: ImageKind) => void;
}

export default function ProfileImageModal({
  kind,
  file,
  onClose,
  onSuccess,
}: ProfileImageModalProps) {
  const { token } = useContext(AuthencreatedContext);
  const queryClient = useQueryClient();
  const config = UPLOAD_CONFIG[kind];

  const [previewUrl, setPreviewUrl] = useState("");
  const [progress, setProgress] = useState(0);

  // Preview للصورة قبل الرفع
  useEffect(() => {
    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // رفع الصورة
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("You must be logged in to upload an image.");
      }

      const formData = new FormData();
      formData.append(config.field, file);

      const response = await axios.put(
        `${baseUrl}${config.endpoint}`,
        formData,
        {
          headers: {
            token,
          },
          timeout: 15000,
          onUploadProgress: (event) => {
            if (event.total) {
              setProgress(Math.round((event.loaded * 100) / event.total));
            }
          },
        },
      );

      return response.data;
    },

    onSuccess: () => {
      setProgress(100);

      // تحديث الكاش من غير بدء Requests جديدة تلقائيًا
      void queryClient.invalidateQueries({
        queryKey: ["userProfile"],
        refetchType: "none",
      });

      void queryClient.invalidateQueries({
        queryKey: ["userPosts"],
        refetchType: "none",
      });

      void queryClient.invalidateQueries({
        queryKey: ["allPosts"],
        refetchType: "none",
      });

      onSuccess(kind);
    },

    onError: (error) => {
      setProgress(0);

      if (axios.isAxiosError(error)) {
        console.error("Upload error:", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          response: error.response?.data,
        });
      } else {
        console.error("Upload error:", error);
      }
    },
  });

  const isPending = uploadMutation.isPending;

  // منع إغلاق النافذة أثناء الرفع
  const safeClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  // إغلاق النافذة بزر Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPending, onClose]);

  // رسالة الخطأ
  const errorMessage = uploadMutation.isError
    ? axios.isAxiosError(uploadMutation.error)
      ? uploadMutation.error.code === "ECONNABORTED" ||
        uploadMutation.error.code === "ETIMEDOUT"
        ? "The request timed out. Please check your connection and try again."
        : uploadMutation.error.response?.data?.message ||
          uploadMutation.error.message ||
          "Couldn't upload the image. Please try again."
      : uploadMutation.error instanceof Error
        ? uploadMutation.error.message
        : "Couldn't upload the image. Please try again."
    : null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={safeClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-image-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="profile-image-title"
              className="text-lg font-bold text-slate-900"
            >
              {config.title}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">{config.hint}</p>
          </div>

          <button
            type="button"
            onClick={safeClose}
            disabled={isPending}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <FaXmark size={18} />
          </button>
        </header>

        {/* Image Preview */}
        <div className="bg-slate-50 px-6 py-8">
          {previewUrl &&
            (kind === "photo" ? (
              <img
                src={previewUrl}
                alt="Profile image preview"
                className="mx-auto h-44 w-44 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Cover image preview"
                className="aspect-[16/6] w-full rounded-2xl object-cover shadow-md"
              />
            ))}

          <p className="mt-4 truncate text-center text-xs text-slate-400">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>

        {/* Upload Status */}
        <div className="px-6 py-5">
          {isPending && (
            <div className="mb-4">
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-1.5 text-xs font-medium text-slate-500">
                Uploading... {progress}%
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please wait while your image is being uploaded.
              </p>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600"
            >
              <FaCircleExclamation className="mt-0.5 shrink-0" />

              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={safeClose}
              disabled={isPending}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                if (!uploadMutation.isPending) {
                  setProgress(0);
                  uploadMutation.mutate();
                }
              }}
              disabled={isPending}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "Uploading..."
                : uploadMutation.isError
                  ? "Try again"
                  : "Save"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
