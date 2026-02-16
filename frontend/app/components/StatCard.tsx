type StatCardProps = {
  title: string;
  value: number;
  unit?: string;
  subtitle?: string;
  loading?: boolean;
};

export default function StatCard({
  title,
  value,
  unit,
  subtitle,
  loading = false,
}: StatCardProps) {
  return (
    <div className="rounded-xl bg-gray-200 p-3 md:p-5 shadow-sm transition hover:shadow-md">
      {/* TITLE */}
      <p className="text-xs md:text-sm font-semibold text-gray-700">{title}</p>

      {/* VALUE */}
      <div className="mt-2 flex items-end gap-1">
        <span className="text-xl md:text-2xl font-bold text-[#1F3A93]">
          {loading ? "—" : value}
        </span>

        {!loading && unit && (
          <span className="text-xs md:text-sm font-medium text-gray-600">{unit}</span>
        )}
      </div>

      {/* SUBTITLE */}
      {subtitle && <p className="mt-1 text-[10px] md:text-xs text-gray-600">{subtitle}</p>}
    </div>
  );
}
