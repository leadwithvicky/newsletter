import Link from "next/link";

export default function NewsletterList({ newsletters }) {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Newsletters</h1>
      {newsletters.length === 0 && <p>No newsletters available.</p>}

      <ul>
        {newsletters.map((item) => (
          <li key={item._id} style={{ marginBottom: "10px" }}>
            <Link href={`/newsletter/${item._id}`}>
              <strong>{item.title}</strong> – {item.subtitle || (typeof item.content === "string" ? item.content.slice(0, 100) + "..." : "")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Fetch newsletters from backend
export async function getServerSideProps() {
  const res = await fetch("http://localhost:5000/api/newsletters");
  const data = await res.json();

  return {
    props: {
      newsletters: data || [],
    },
  };
}
