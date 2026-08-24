export default function Loader({ fullScreen = false, label = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 animate-ping rounded-full bg-tide/30" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-tide">
          <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </span>
      </div>
      <p className="text-sm font-medium text-marine/60">{label}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="flex min-h-screen w-full items-center justify-center bg-mist">{content}</div>;
  }
  return <div className="flex w-full items-center justify-center py-16">{content}</div>;
}
