'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type Newsletter = {
  _id: string;
  title: string;
  description?: string;
  author?: string;
  content?: string; // stored as <style>...</style><html>
  imageUrl?: string;
};

export default function EditNewsletterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;

  const [form, setForm] = useState({ title: '', description: '', author: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const editorRef = useRef<any>(null);
  const editorElRef = useRef<HTMLDivElement | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Auth guard
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!t) {
      router.replace('/admin');
      return;
    }
    setToken(t);
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!authChecked || !id) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/newsletters/${id}`, { cache: 'no-store' });
        const data: Newsletter = await res.json();
        setForm({
          title: data.title || '',
          description: data.description || '',
          author: data.author || '',
          imageUrl: data.imageUrl || ''
        });

        // Ensure GrapesJS CSS is loaded at runtime to avoid Next/Turbopack CSS parsing issues
        const id = 'grapesjs-css';
        if (typeof document !== 'undefined' && !document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
          document.head.appendChild(link);
        }
        const grapesjs = (await import('grapesjs')).default as any;
        const editor = grapesjs.init({
          container: editorElRef.current!,
          height: '70vh',
          fromElement: false,
          storageManager: false,
          assetManager: { upload: `${API_BASE}/api/uploads`, uploadName: 'image' },
        });

        // Load content: extract <style>...</style> and HTML if present
        const raw = data.content || '';
        const cssMatch = raw.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        const css = cssMatch ? cssMatch[1] : '';
        const html = raw.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '');
        editor.setComponents(html || '<section style="padding:20px"><h1>Edit your newsletter</h1></section>');
        if (css) editor.setStyle(css);

        // Ensure assets added are absolute URLs
        editor.on('asset:upload:response', (res: any) => {
          const url = res?.url;
          if (url) {
            const absoluteUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
            editor.AssetManager.add({ src: absoluteUrl });
          }
        });

        editorRef.current = editor;
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    })();
  }, [id, authChecked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const editor = editorRef.current;
    const html = editor?.getHtml?.() || '';
    const css = editor?.getCss?.() || '';
    const content = `<style>${css}</style>${html}`;

    await fetch(`${API_BASE}/api/newsletters/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...form, content }),
    });
    router.push('/admin/dashboard');
  };

  if (!authChecked) return null;
  if (loading) return <div className="max-w-6xl mx-auto p-6">Loading editor...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Edit Newsletter</h1>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="w-full border border-[#8B4513]/30 p-2 rounded" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          <input className="w-full border border-[#8B4513]/30 p-2 rounded" name="author" placeholder="Author" value={form.author} onChange={handleChange} />
          <input className="w-full border border-[#8B4513]/30 p-2 rounded" name="description" placeholder="Short description" value={form.description} onChange={handleChange} />
        </div>
        <div className="border border-[#8B4513]/30 rounded">
          <div ref={editorElRef} />
        </div>
        <div className="flex justify-end gap-3">
          <button type="submit" className="text-black px-4 py-2 rounded bg-gradient-to-r from-[#FFD700] via-[#FF6F00] to-[#32CD32] hover:to-[#32CD32]">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
