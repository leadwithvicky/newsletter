export default function NewsletterDetail({ newsletter }) {
  if (!newsletter) {
    return <p>Newsletter not found.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 className="text-3xl font-bold mb-2">{newsletter.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        {new Date(newsletter.date).toLocaleDateString()} • {newsletter.author}
      </div>
      <p className="text-gray-700 mb-6">{newsletter.description}</p>
      <div>
        {newsletter.imageUrl && (
          <img src={newsletter.imageUrl} alt={newsletter.title} className="mb-6 max-w-full rounded" />
        )}
        <div dangerouslySetInnerHTML={{ __html: newsletter.content }} />
      </div>
    </div>
  );
}

// Fetch single newsletter from backend
export async function getServerSideProps({ params }) {
  const res = await fetch(`http://localhost:5000/api/newsletters/${params.id}`);
  const data = await res.json();

  return {
    props: {
      newsletter: data || null,
    },
  };
}
