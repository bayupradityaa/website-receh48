import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { formatCurrency } from '../../../lib/utils';
import { ShoppingCart, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';

function StatsCard({ title, value, icon: Icon, color, isLoading }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div
      className="
        bg-[#12161F] rounded-xl border border-gray-800
        p-3 sm:p-5 lg:p-6
        hover:border-gray-700 transition-colors
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="
              text-[11px] sm:text-sm text-gray-400
              mb-1.5 sm:mb-2
              leading-snug
              line-clamp-2
            "
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
        </div>

        <div
          className={`
            flex-shrink-0 border rounded-lg
            p-2 sm:p-3
            ${colorClasses[color]}
          `}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    doneOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const refetchTimer = useRef(null);
  const scheduleRefetch = () => {
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => {
      fetchStats();
    }, 250);
  };

  useEffect(() => {
    fetchStats();

    const handleRefresh = () => scheduleRefetch();
    window.addEventListener('refreshDashboardStats', handleRefresh);

    const ordersChannel = supabase
      .channel('realtime-dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        scheduleRefetch();
      })
      .subscribe();

    const membersChannel = supabase
      .channel('realtime-dashboard-members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        scheduleRefetch();
      })
      .subscribe();

    return () => {
      window.removeEventListener('refreshDashboardStats', handleRefresh);
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(membersChannel);
    };
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);

      const { count: totalOrders, error: totalErr } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      if (totalErr) throw totalErr;

      const { count: pendingOrders, error: pendingErr } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (pendingErr) throw pendingErr;

      const { count: doneOrdersCount, error: doneErr } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done');
      if (doneErr) throw doneErr;

      const { data: doneOrders, error: revErr } = await supabase
        .from('orders')
        .select('total_fee')
        .eq('status', 'done');
      if (revErr) throw revErr;

      const todayRevenue = (doneOrders || []).reduce(
        (sum, o) => sum + (o.total_fee || 0),
        0
      );

      setStats({
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        todayRevenue,
        doneOrders: doneOrdersCount || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        xs:grid-cols-2
        lg:grid-cols-4
        gap-3 sm:gap-4 lg:gap-6
        mb-5 sm:mb-8
      "
    >
      <StatsCard
        title="Total Semua Pesanan"
        value={stats.totalOrders}
        icon={ShoppingCart}
        color="blue"
        isLoading={loading}
      />
      <StatsCard
        title="Menunggu Konfirmasi"
        value={stats.pendingOrders}
        icon={Clock}
        color="yellow"
        isLoading={loading}
      />
      <StatsCard
        title="Pesanan Selesai"
        value={stats.doneOrders}
        icon={CheckCircle}
        color="emerald"
        isLoading={loading}
      />
      <StatsCard
        title="Profit"
        value={formatCurrency(stats.todayRevenue)}
        icon={DollarSign}
        color="green"
        isLoading={loading}
      />
    </div>
  );
}
