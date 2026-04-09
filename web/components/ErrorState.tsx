interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="
        w-full
        bg-red-dim border border-red/20 rounded-md
        px-4 py-5
        flex flex-col sm:flex-row items-start sm:items-center gap-3
      "
      style={{ animation: "fadeSlideIn 0.3s ease-out" }}
      role="alert"
    >
      {/* Exclamation triangle icon */}
      <div className="shrink-0">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="w-5 h-5 text-red"
          aria-hidden="true"
        >
          <path
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M10 7v3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="10" cy="13" r="0.75" fill="currentColor" />
        </svg>
      </div>

      {/* Error message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red font-medium">Scan failed</p>
        <p className="text-sm text-text-secondary mt-0.5 break-words">
          {message}
        </p>
      </div>

      {/* Retry button */}
      <button
        onClick={onRetry}
        className="
          shrink-0
          px-4 py-1.5 rounded
          font-mono text-sm
          bg-red/10 border border-red/30
          text-red
          hover:bg-red/20 hover:border-red/50
          transition-all duration-150
          cursor-pointer
        "
        aria-label="Retry scan"
      >
        Try Again
      </button>
    </div>
  );
}
