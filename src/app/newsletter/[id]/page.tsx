interface Newsletter {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  author?: string;
  date?: string;
  imageUrl?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default async function NewsletterDetailPage({ params }: { params: { id: string } }) {
  let newsletter: Newsletter | null = null;
  try {
    const res = await fetch(`${API_BASE}/api/newsletters/${params.id}`, { cache: "no-store" });
    if (res.ok) {
      newsletter = await res.json();
    }
  } catch (e) {
    newsletter = null;
  }

  if (!newsletter) return <p style={{ padding: 20 }}>Newsletter not found.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{newsletter.title}</h1>
      <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        {newsletter.date ? new Date(newsletter.date).toLocaleDateString() : ''}
        {newsletter.author ? ` • ${newsletter.author}` : ''}
      </div>
      {newsletter.description && <p style={{ color: '#555', marginBottom: 16 }}>{newsletter.description}</p>}
      {newsletter.imageUrl && (
        <img src={newsletter.imageUrl} alt={newsletter.title} style={{ maxWidth: '100%', borderRadius: 6, marginBottom: 16 }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: newsletter.content || '' }} />
    </div>
  );
}
