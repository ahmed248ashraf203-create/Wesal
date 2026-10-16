import { Button } from "@heroui/react";
import { FaCircleExclamation, FaRotateRight } from "react-icons/fa6";

interface FeedErrorProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function FeedError({
  onRetry,
  isRetrying = false,
}: FeedErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <FaCircleExclamation className="text-3xl text-red-500" />
      </div>

      <h2 className="mb-2 text-lg font-bold text-gray-900">
        Something went wrong!
      </h2>

      <p className="mb-6 max-w-sm text-sm leading-6 text-gray-500">
        We couldn't load the posts. Please check your internet connection and
        try again.
      </p>

      <Button onPress={onRetry} isDisabled={isRetrying}>
        <FaRotateRight className={isRetrying ? "animate-spin" : ""} />
        {isRetrying ? "Retrying..." : "Try Again"}
      </Button>
    </div>
  );
}
