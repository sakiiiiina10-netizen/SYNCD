interface Series { label: string; color: string; points: number[]; }
interface Props { labels: string[]; series: Series[]; height?: number; }

export default function LineChart({ labels, series, height = 220 }: Props) {
  const w = 520, h = height, pad = 36;
  const all = series.flatMap(s => s.points);
  const max = Math.max(1, ...all);
  const stepX = (w - pad * 2) / Math.max(1, labels.length - 1);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const x = (i: number) => pad + i * stepX;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {[0,0.25,0.5,0.75,1].map((t,i) => {
        const yy = pad + t*(h-pad*2);
        return <g key={i}><line x1={pad} x2={w-pad} y1={yy} y2={yy} className="stroke-slate-200 dark:stroke-slate-700" strokeDasharray="3 3" />
        <text x={4} y={yy+4} className="fill-slate-400 text-[9px]">{Math.round(max*(1-t))}</text></g>;
      })}
      {labels.map((l,i) => <text key={i} x={x(i)} y={h-12} textAnchor="middle" className="fill-slate-400 text-[9px]">{l}</text>)}
      {series.map((s,si) => {
        const path = s.points.map((p,i) => `${i?'L':'M'} ${x(i)} ${y(p)}`).join(' ');
        return <g key={si}>
          <path d={path} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {s.points.map((p,i) => <circle key={i} cx={x(i)} cy={y(p)} r="3" fill={s.color} />)}
        </g>;
      })}
      <g>
        {series.map((s,i) => (
          <g key={i} transform={`translate(${pad},${pad-18+i*14})`}>
            <rect width="10" height="10" rx="2" fill={s.color} />
            <text x="16" y="9" className="fill-slate-600 dark:fill-slate-300 text-[10px]">{s.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
