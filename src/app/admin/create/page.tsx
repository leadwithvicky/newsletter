'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function CreateNewsletterPage() {
  const [form, setForm] = useState({ title: '', description: '', author: '', content: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    const res = await fetch(`${API_BASE}/api/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: data,
    });
    const json = await res.json();
    setForm(prev => ({ ...prev, imageUrl: json.url }));
    setUploading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_BASE}/api/newsletters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(form),
    });
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Newsletter</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" name="title" placeholder="Title" onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="author" placeholder="Author" onChange={handleChange} />
        <textarea className="w-full border p-2 rounded" name="description" placeholder="Short Description" onChange={handleChange} />
        <div className="w-full">
          <label className="block text-sm mb-1">Content</label>
          <ReactQuill theme="snow" value={form.content} onChange={(val)=>setForm(prev=>({...prev, content: val}))} />
        </div>
        <div className="space-y-2">
          <input type="file" accept="image/*" onChange={handleImage} />
          {uploading ? <p>Uploading...</p> : form.imageUrl && <img src={form.imageUrl} alt="preview" className="max-h-48 rounded" />}
        </div>
        <button className="bg-black text-white px-4 py-2 rounded" type="submit">Save</button>
      </form>
    </div>
  );
}
