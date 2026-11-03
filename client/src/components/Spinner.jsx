export default function Spinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/70">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-aqua-400" />
      <p className="text-sm">{text}</p>
    </div>
  );
}