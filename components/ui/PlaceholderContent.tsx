interface PlaceholderContentProps {
  pageName: string;
  taskNumber?: number;
}

export function PlaceholderContent({
  pageName,
  taskNumber,
}: PlaceholderContentProps) {
  return (
    <div className="bg-ww-surface/50 border border-dashed border-slate-800 rounded-2xl px-10 py-20 text-center">
      <div className="text-5xl mb-4 opacity-40">🏗️</div>
      <p className="text-sm text-slate-700 font-mono">
        [ {pageName} content will be built in{" "}
        {taskNumber ? `Task ${taskNumber}` : "a future task"} ]
      </p>
    </div>
  );
}
