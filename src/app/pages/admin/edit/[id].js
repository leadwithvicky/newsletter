"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useParams } from "next/navigation";

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function EditNewsletter() {
  const params = useParams();
  const id = params?.id;
  const [form, setForm] = useState({ title: "", description: "", author: "", content: "", imageUrl: "" });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api` : '/api' });
  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/newsletters/${id}`);
      setForm(res.data);
    };
    if (id) load();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    await api.put(`/newsletters/${id}`, form);
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Newsletter</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="author" placeholder="Author" value={form.author} onChange={handleChange} />
        <textarea className="w-full border p-2 rounded" name="description" placeholder="Short Description" value={form.description} onChange={handleChange} />
        <div className="w-full">
          <label className="block text-sm mb-1">Content</label>
          <ReactQuill theme="snow" value={form.content} onChange={(val)=>setForm(prev=>({...prev, content: val}))} />
        </div>
        <input className="w-full border p-2 rounded" name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} />
        <button className="bg-black text-white px-4 py-2 rounded" type="submit">Save Changes</button>
      </form>
    </div>
  );
}


