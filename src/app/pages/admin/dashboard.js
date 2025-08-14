"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const api = axios.create({ baseURL: "http://localhost:5000/api" });
  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const load = async () => {
    try {
      const res = await api.get('/newsletters');
      setItems(res.data);
    } catch {
      setError('Failed to load');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this newsletter?')) return;
    await api.delete(`/newsletters/${id}`);
    await load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/create" className="bg-black text-white px-4 py-2 rounded">Create</Link>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {items.map((n)=> (
          <li key={n._id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-gray-500">{new Date(n.date).toLocaleString()}</div>
            </div>
            <div className="space-x-2">
              <Link href={`/admin/edit/${n._id}`} className="px-3 py-1 border rounded">Edit</Link>
              <button onClick={()=>remove(n._id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


