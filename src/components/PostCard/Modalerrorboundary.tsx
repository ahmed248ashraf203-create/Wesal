import { Component, type ReactNode } from "react";
import FeedError from "../FeedError/FeedError";
import PostsError from "../DetailsPost/PostsError";

interface ModalErrorBoundaryProps {
  children: ReactNode;
  onClose: () => void;
}

interface ModalErrorBoundaryState {
  hasError: boolean;
}

// بيمسك أي كراش بيحصل وقت فتح/عرض المودال ويعرض FeedError بدل شاشة بيضاء
export default class ModalErrorBoundary extends Component<
  ModalErrorBoundaryProps,
  ModalErrorBoundaryState
> {
  state: ModalErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ModalErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("DetailsPost failed to render:", error);
  }

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-3 backdrop-blur-sm"
        onClick={this.props.onClose}
      >
        <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <PostsError
            title="Couldn't open this post"
            message="Something went wrong while opening the post details. Please try again."
            onRetry={this.handleRetry}
          />
          <button
            type="button"
            onClick={this.props.onClose}
            className="mt-3 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
}
