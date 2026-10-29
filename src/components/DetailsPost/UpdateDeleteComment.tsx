import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaEllipsis, FaPen, FaTrash } from "react-icons/fa6";
import { api } from "../../lib/api";

const commentUrl = (postId: string, commentId: string) =>
  `/posts/${postId}/comments/${commentId}`;

// --------------------------------------------------------
// فورم التعديل (بيظهر مكان نص الكومنت وقت الـ Edit)
// --------------------------------------------------------
interface EditCommentFormProps {
  postId: string;
  commentId: string;
  token: string;
  initialContent: string;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditCommentForm({
  postId,
  commentId,
  token,
  initialContent,
  onCancel,
  onSaved,
}: EditCommentFormProps) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(initialContent);

  const trimmed = value.trim();
  const unchanged = trimmed === initialContent.trim();

  // PUT /posts/:postId/comments/:commentId  (form-data)
  const updateMutation = useMutation({
    mutationFn: async (content: string) => {
      // الـ API بيستقبل form-data (الحقول: content و image اختياري)
      const formData = new FormData();
      formData.append("content", content);

      const response = await api.put(commentUrl(postId, commentId), formData);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["postComments", postId, token],
      });
      onSaved();
    },
  });

  const save = () => {
    if (!trimmed || unchanged || updateMutation.isPending) return;
    updateMutation.mutate(trimmed);
  };

  return (
    <div className="rounded-2xl rounded-tl-none border border-blue-200 bg-white px-3 py-2.5 shadow-sm">
      <textarea
        autoFocus
        rows={2}
        value={value}
        disabled={updateMutation.isPending}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            save();
          }
          if (event.key === "Escape") {
            // Cancel only the comment edit, don't also close the post modal.
            event.stopPropagation();
            onCancel();
          }
        }}
        aria-label="Edit comment"
        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[11px] text-gray-400">
          Enter to save · Esc to cancel
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={updateMutation.isPending}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!trimmed || unchanged || updateMutation.isPending}
            className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {updateMutation.isError && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          Couldn't update the comment. Please try again.
        </p>
      )}
    </div>
  );
}

// --------------------------------------------------------
// قايمة ⋯ (Edit / Delete) - بتظهر لصاحب الكومنت بس
// --------------------------------------------------------
interface UpdateDeleteCommentProps {
  postId: string;
  commentId: string;
  token: string;
  onEdit: () => void;
}

interface MenuPosition {
  right: number;
  top?: number;
  bottom?: number;
}

// ارتفاع تقريبي للقايمة (وهي في وضع تأكيد المسح) عشان نعرف نفتحها لفوق ولا لتحت
const MENU_HEIGHT = 160;

export default function UpdateDeleteComment({
  postId,
  commentId,
  token,
  onEdit,
}: UpdateDeleteCommentProps) {
  const queryClient = useQueryClient();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const isOpen = position !== null;

  const closeMenu = () => {
    setPosition(null);
    setIsConfirming(false);
  };

  // بنفتح القايمة في مكان ثابت على الشاشة (fixed) عشان متتقصش جوه الـ scroll بتاع الكومنتات
  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const openUp = window.innerHeight - rect.bottom < MENU_HEIGHT;

    setPosition({
      right: window.innerWidth - rect.right,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
    });
  };

  // نقفل القايمة لو عمل scroll أو غيّر حجم الشاشة أو داس Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleClose = () => closeMenu();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // DELETE /posts/:postId/comments/:commentId
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(commentUrl(postId, commentId));
      return response.data;
    },
    onSuccess: async () => {
      // نحدّث الكومنتات + عدد الكومنتات في الفيد
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["postComments", postId, token],
        }),
        queryClient.invalidateQueries({ queryKey: ["allPosts"] }),
      ]);
    },
  });

  return (
    <div
      className={`shrink-0 self-center transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 ${
        isOpen ? "sm:opacity-100" : ""
      }`}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Comment options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <FaEllipsis size={15} />
      </button>

      {isOpen &&
        createPortal(
          <>
            {/* خلفية شفافة لقفل القايمة لما تدوس برا */}
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => {
                if (!deleteMutation.isPending) closeMenu();
              }}
            />

            <div
              role="menu"
              style={{
                top: position.top,
                bottom: position.bottom,
                right: position.right,
              }}
              className="fixed z-[70] w-52 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl"
            >
              {isConfirming ? (
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Delete this comment?
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    This can't be undone.
                  </p>

                  {deleteMutation.isError && (
                    <p role="alert" className="mt-2 text-xs text-red-500">
                      Couldn't delete the comment. Please try again.
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeMenu}
                      disabled={deleteMutation.isPending}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      closeMenu();
                      onEdit();
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <FaPen size={13} className="text-gray-400" />
                    Edit
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setIsConfirming(true)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                  >
                    <FaTrash size={13} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
