import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string; // e.g., "+12%" or "-5%"
  trendDescription?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendDescription }: StatCardProps) {
  const isPositive = trend?.startsWith("+");
  const isNegative = trend?.startsWith("-");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl">
          <Icon size={24} strokeWidth={2} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isPositive
                ? "bg-emerald-50 text-emerald-600"
                : isNegative
                ? "bg-rose-50 text-rose-600"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : null}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-slate-500 font-medium text-sm mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
          {trendDescription && (
            <p className="text-xs text-slate-400 font-medium">{trendDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
}
