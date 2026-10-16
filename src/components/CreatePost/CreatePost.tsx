import { useState } from "react";
import { FaGlobe, FaImage, FaFaceSmile, FaPaperPlane } from "react-icons/fa6";

interface CreatePostProps {
  onCreatePost: (body: string) => void;
}

export default function CreatePost({ onCreatePost }: CreatePostProps) {
  const [body, setBody] = useState("");

  function handleSubmit() {
    if (!body.trim()) return;

    onCreatePost(body.trim());
    setBody("");
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Create Post</h2>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="What's on your mind?"
        className="min-h-32 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-400 focus:bg-white"
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
          >
            <FaImage className="text-green-500" />
            Photo/Video
          </button>

          <button
            type="button"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500"
          >
            <FaFaceSmile className="text-orange-500" />
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
          disabled={!body.trim()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 font-semibold text-white shadow-md shadow-indigo-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/50 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
        >
          Post
          <FaPaperPlane />
        </button>
      </div>
    </section>
  );
}
