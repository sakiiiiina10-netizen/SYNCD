interface Props { data: { label: string; value: number; color: string }[]; size?: number; }

export default function PieChart({ data, size = 180 }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 10;
  const cx = size / 2, cy = size / 2;
  let angle = -Math.PI / 2;
  const arcs = data.map(d => {
    const slice = (d.value / total) * Math.PI * 2;
    const a0 = angle, a1 = angle + slice;
    angle = a1;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = slice > Math.PI ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`, fill: d.color, label: d.label, value: d.value, p: Math.round((d.value/total)*100) };
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.fill} stroke="white" strokeWidth="1.5" />)}
        <circle cx={cx} cy={cy} r={r*0.55} className="fill-white dark:fill-slate-800" />
        <text x={cx} y={cy-2} textAnchor="middle" className="fill-slate-700 dark:fill-slate-200 text-lg font-semibold">{total}</text>
        <text x={cx} y={cy+14} textAnchor="middle" className="fill-slate-400 text-[10px]">total</text>
      </svg>
      <div className="space-y-1.5">
        {arcs.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm" style={{ background: a.fill }} />
            <span className="text-slate-600 dark:text-slate-300">{a.label}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{a.value}</span>
            <span className="text-slate-400">({a.p}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
