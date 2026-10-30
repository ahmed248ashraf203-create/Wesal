import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import EmojiPicker from "emoji-picker-react";
import {
  FaGlobe,
  FaImage,
  FaFaceSmile,
  FaPaperPlane,
  FaXmark,
} from "react-icons/fa6";

interface CreatePostProps {
  onCreatePost: (body: string, image?: File) => Promise<boolean>;
}

export default function CreatePost({ onCreatePost }: CreatePostProps) {
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles, rejectedFiles) => {
      setError("");

      if (acceptedFiles.length > 0) {
        setImage(acceptedFiles[0]);
      } else if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];

        if (rejection.errors.some((e) => e.code === "file-too-large")) {
          setError("Image size must be 5 MB or less.");
        } else {
          setError("Please choose a valid image file.");
        }
      }
    },
  });

  async function handleSubmit() {
    const trimmedBody = body.trim();

    if ((!trimmedBody && !image) || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const success = await onCreatePost(trimmedBody, image);

      if (success) {
        setBody("");
        setImage(undefined);
        setShowEmojiPicker(false);
      } else {
        setError("Couldn't publish your post. Please try again.");
      }
    } catch {
      setError("Couldn't publish your post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Create Post</h2>

      <div
        {...getRootProps()}
        className={`rounded-xl border ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-transparent"
        }`}
      >
        <input {...getInputProps()} />

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What's on your mind?"
          disabled={isSubmitting}
          className="min-h-32 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-400 focus:bg-white disabled:opacity-60"
        />

        {isDragActive && (
          <p className="mt-2 text-center text-sm text-blue-600">
            Drop your image here
          </p>
        )}
      </div>

      {previewUrl && (
        <div className="relative mt-4 inline-block max-w-full">
          <img
            src={previewUrl}
            alt="Post preview"
            className="max-h-80 max-w-full rounded-xl border border-gray-200 object-contain"
          />

          <button
            type="button"
            onClick={() => setImage(undefined)}
            disabled={isSubmitting}
            aria-label="Remove image"
            title="Remove image"
            className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            <FaXmark />
          </button>
        </div>
      )}

      <div className="relative mt-4 border-t border-gray-100 pt-4">
        {showEmojiPicker && (
          <div className="absolute bottom-14 left-0 z-20 w-full max-w-[300px]">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setBody((current) => current + emojiData.emoji);
              }}
              height={350}
              width="100%"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={open}
              disabled={isSubmitting}
              className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-green-600 disabled:opacity-50"
            >
              <FaImage className="text-lg text-green-500" />
              Photo
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker((current) => !current)}
              disabled={isSubmitting}
              className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-orange-500 disabled:opacity-50"
            >
              <FaFaceSmile className="text-lg text-orange-500" />
              Feeling
            </button>

            <span className="flex items-center gap-2 text-sm text-gray-500">
              <FaGlobe />
              Public
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!body.trim() && !image) || isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 font-semibold text-white shadow-md shadow-indigo-200/50 transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Publishing..." : "Post"}
            <FaPaperPlane />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
