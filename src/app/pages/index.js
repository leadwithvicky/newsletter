import Link from "next/link";

export default function Home({ newsletters }) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">VisionTech Newsletter</h1>
      <ul className="space-y-4">
        {newsletters.map((n) => (
          <li key={n._id} className="border rounded p-4 hover:shadow">
            <Link href={`/newsletter/${n._id}`} className="block">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{n.title}</h2>
                <span className="text-sm text-gray-500">{new Date(n.date).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 mt-1">{n.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getServerSideProps() {
  const res = await fetch("http://localhost:5000/api/newsletters");
  const data = await res.json();
  return { props: { newsletters: data || [] } };
}


