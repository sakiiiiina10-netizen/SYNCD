interface Props {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  max?: number;
}

export default function BarChart({ data, height = 200, max }: Props) {
  const m = max ?? Math.max(1, ...data.map(d => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-3" style={{ height }}>
        {data.map((d, i) => {
          const h = Math.max(2, (d.value / m) * (height - 28));
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition">{d.value}</span>
              <div className="w-full rounded-t-md transition-all duration-500 hover:opacity-80" style={{ height: h, background: d.color ?? '#6366f1' }} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center truncate w-full">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
