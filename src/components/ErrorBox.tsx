type ErrorBoxProps = {
  message: string | null;
};

export function ErrorBox({ message }: ErrorBoxProps) {
  if (!message) {
    return null;
  }

  return <div className="rounded-2xl border border-red-400/40 bg-red-950/40 p-4 text-sm text-red-100">{message}</div>;
}
