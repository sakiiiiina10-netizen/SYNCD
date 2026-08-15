import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/lib/supabase';
import { Student } from '@/lib/types';

interface DashboardStats {
  totalStudents: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; text: string; time: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    
    // Fetch only the student records since fee and attendance features are removed
    const { data: studentsData, error } = await supabase
      .from('students')
      .select('*');

    if (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const students = (studentsData ?? []) as Student[];

    setStats({
      totalStudents: students.length,
    });

    // Build recent activity feed based on newly registered students
    const sorted = [...students]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setRecentActivity(
      sorted.map((s) => ({
        id: s.id,
        text: `${s.name} was added to ${s.class || ''}${s.section ? ` - ${s.section}` : ''}`,
        time: new Date(s.created_at).toLocaleDateString('en', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }))
    );

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading || !stats) {
    return (
      <Layout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'blue' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  };

  const quickCards = [
    { to: '/students', label: 'Students', desc: 'Manage student records', icon: Users },
  ];

  return (
    <Layout>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your school's performance"
        action={
          <button onClick={handleRefresh} className="btn-secondary" disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[card.color]}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick navigation + Recent activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Navigation</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickCards.map((card) => (
              <Link key={card.to} to={card.to} className="card group flex items-center gap-4 p-5 hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
                  <card.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">{card.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{card.desc}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <div className="card divide-y divide-gray-100 dark:divide-gray-800">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No recent activity</div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{activity.text}</p>
                  <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
