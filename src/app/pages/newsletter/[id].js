import { useState } from "react";

export default function NewsletterDetail({ newsletter, token }) {
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [message, setMessage] = useState("");

  if (!newsletter) {
    return <p>Newsletter not found.</p>;
  }

  const handleUnsubscribe = async () => {
    if (!token) return;
    try {
      setIsUnsubscribing(true);
      setMessage("");
      const res = await fetch(`http://localhost:5000/api/subscribers/unsubscribe/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to unsubscribe");
      }
      const data = await res.json();
      setIsUnsubscribed(true);
      setMessage(data.message || "Successfully unsubscribed");
    } catch (err) {
      setMessage(err.message || "Failed to unsubscribe");
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 className="text-3xl font-bold mb-2">{newsletter.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        {newsletter.date ? new Date(newsletter.date).toLocaleDateString() : ""}
        {newsletter.author ? ` • ${newsletter.author}` : ""}
      </div>
      <p className="text-gray-700 mb-6">{newsletter.description}</p>
      <div>
        {newsletter.imageUrl && (
          <img
            src={newsletter.imageUrl}
            alt={newsletter.title}
            className="mb-6 max-w-full rounded"
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: newsletter.content }} />
      </div>

      {/* Footer actions: only show Unsubscribe if a token is present (i.e., recipient link) */}
      {token && (
        <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
          {!isUnsubscribed ? (
            <button
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
              style={{
                background: "#ef4444",
                color: "white",
                padding: "8px 12px",
                borderRadius: "6px",
                border: 0,
                cursor: isUnsubscribing ? "not-allowed" : "pointer",
              }}
            >
              {isUnsubscribing ? "Unsubscribing..." : "Unsubscribe"}
            </button>
          ) : (
            <span style={{ color: "#16a34a" }}>You have unsubscribed.</span>
          )}
          {message && <div style={{ marginTop: 8 }}>{message}</div>}
        </div>
      )}
    </div>
  );
}

// Fetch single newsletter from backend and pass token from query
export async function getServerSideProps({ params, query }) {
  const token = query?.token || null;
  const res = await fetch(`http://localhost:5000/api/newsletters/${params.id}`);
  const data = await res.json();

  return {
    props: {
      newsletter: data || null,
      token,
    },
  };
}
