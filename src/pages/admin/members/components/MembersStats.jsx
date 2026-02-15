import { Users, UserCheck, UserX } from 'lucide-react';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';

function StatsCard({ title, value, icon: Icon, color, isLoading, sub }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="bg-[#12161F] rounded-xl border border-gray-800 p-3 sm:p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] sm:text-sm text-gray-400 mb-1.5 sm:mb-2 leading-snug line-clamp-2"
            title={title}
          >
            {title}
          </p>

          {isLoading ? (
            <div className="h-7 sm:h-8 flex items-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <p className="text-base sm:text-2xl font-bold text-white leading-tight break-words">
              {value}
            </p>
          )}

          {sub && !isLoading && (
            <p className="text-[11px] text-gray-500 mt-1">{sub}</p>
          )}
        </div>

        <div className={`flex-shrink-0 border rounded-lg p-2 sm:p-3 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}

export default function MembersStats({ stats, isLoading = false }) {
  const {
    total = 0,
    active = 0,
    inactive = 0,
  } = stats || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <StatsCard
        title="Total Member"
        value={total}
        icon={Users}
        color="blue"
        isLoading={isLoading}
        sub="Semua member terdaftar"
      />
      <StatsCard
        title="Member Aktif"
        value={active}
        icon={UserCheck}
        color="green"
        isLoading={isLoading}
        sub={total > 0 ? `${Math.round((active / total) * 100)}% dari total` : '-'}
      />
      <StatsCard
        title="Member Nonaktif"
        value={inactive}
        icon={UserX}
        color="red"
        isLoading={isLoading}
        sub={total > 0 ? `${Math.round((inactive / total) * 100)}% dari total` : '-'}
      />
    </div>
  );
}