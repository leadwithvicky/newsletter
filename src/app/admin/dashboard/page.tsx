'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function AdminDashboardPage() {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [newslettersRes, subscribersRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/newsletters`),
        fetch(`${API_BASE}/api/subscribers`),
        fetch(`${API_BASE}/api/subscribers/stats`),
      ]);

      const [newslettersData, subscribersData, statsData] = await Promise.all([
        newslettersRes.json(),
        subscribersRes.json(),
        statsRes.json(),
      ]);

      setNewsletters(newslettersData || []);
      setSubscribers(subscribersData || []);
      setStats(statsData || {});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Newsletters</h3>
          <p className="text-2xl">{newsletters.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Active Subscribers</h3>
          <p className="text-2xl">{stats.active || 0}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Subscribers</h3>
          <p className="text-2xl">{stats.total || 0}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Unsubscribed</h3>
          <p className="text-2xl">{stats.unsubscribed || 0}</p>
        </div>
      </div>

      <div className="mb-6">
        <Link href="/admin/create" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Create Newsletter
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Recent Newsletters</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Title</th>
                <th className="py-2 px-4 border-b">Date</th>
              </tr>
            </thead>
            <tbody>
              {newsletters.slice(0, 5).map((newsletter) => (
                <tr key={newsletter._id}>
                  <td className="py-2 px-4 border-b">{newsletter.title}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(newsletter.date || newsletter.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Subscribers ({subscribers.length})</h2>
        <ul>
          {subscribers.slice(0, 5).map((s) => (
            <li key={s._id}>{s.email} — {s.status}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
