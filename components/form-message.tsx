export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-sm">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 shadow-sm">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm">
          {message.message}
        </div>
      )}
      {!("success" in message) && !("error" in message) && !("message" in message) && (
        <div className="hidden" />
      )}
    </div>
  );
}
