import { motion } from "motion/react";
import "./metric-card.css";

const ICON_COLORS = [
  { bg: "from-teal-100 to-emerald-100",  icon: "text-teal-700",   shadow: "shadow-teal-600/20"   },
  { bg: "from-emerald-100 to-green-100", icon: "text-emerald-700", shadow: "shadow-emerald-600/20" },
  { bg: "from-cyan-100 to-teal-100",     icon: "text-cyan-700",    shadow: "shadow-cyan-600/20"    },
  { bg: "from-amber-100 to-yellow-100",  icon: "text-amber-700",   shadow: "shadow-amber-600/20"   },
];

const CHANGE_COLORS = {
  positive: "text-emerald-800 bg-emerald-50 border-emerald-300",
  negative: "text-red-800 bg-red-50 border-red-300",
  neutral:  "text-slate-700 bg-slate-50 border-slate-300",
};

export default function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
}) {
  const colorScheme = ICON_COLORS[title.length % ICON_COLORS.length];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="metric-card bg-white rounded-2xl border-2 border-slate-200 p-7 hover:shadow-xl hover:border-teal-300 transition-all"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-3 font-medium tracking-widest uppercase">
            {title}
          </p>
          <h3 className="metric-value text-4xl tracking-tight font-semibold text-slate-900">
            {value}
          </h3>
        </div>
        <div
          className={`metric-icon-wrap bg-gradient-to-br ${colorScheme.bg} p-4 rounded-xl shadow-lg ${colorScheme.shadow}`}
        >
          <Icon className={`size-7 ${colorScheme.icon}`} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        {change && (
          <span
            className={`metric-change-badge inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${CHANGE_COLORS[changeType]}`}
          >
            {change}
          </span>
        )}
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
