type LoadMoreButtonProps = {
  children: string;
  onClick: () => void;
};

export function LoadMoreButton({ children, onClick }: LoadMoreButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-12 w-50 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep"
    >
      {children}
    </button>
  );
}
