type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

// Shared error presentation for pages that load data.
// Include onRetry when the failed request can be repeated.
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="notice notice--error" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="button" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}
