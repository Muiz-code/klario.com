/**
 * Tiny inline sparkline (server component — no interactivity). `id` must be
 * unique per sparkline on the page so gradient fills don't collide.
 */
export function Sparkline({
  id,
  values,
  color = "#d4a853",
  width = 130,
  height = 36,
}: {
  id: string;
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (!values || values.length === 0) {
    return <div style={{ height }} />;
  }

  const n = values.length;
  const max = Math.max(1, ...values);
  const pad = height * 0.12;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * width);
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2);

  const line = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${height} L0,${height} Z`;
  const gid = `spark-${id}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
