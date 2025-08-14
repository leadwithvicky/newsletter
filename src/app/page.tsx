"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Newsletter {
  _id: string;
  title: string;
  subtitle?: string;
  content: string;
}

export default function Home() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/newsletters")
      .then((res) => res.json())
      .then((data) => {
        setNewsletters(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching newsletters:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>VisionTech Newsletter</h1>
        <p>Loading newsletters...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>VisionTech Newsletter</h1>
      
      {newsletters.length === 0 ? (
        <p>No newsletters available.</p>
      ) : (
        <div>
          <h2>Latest Newsletters</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {newsletters.map((item) => (
              <li 
                key={item._id} 
                style={{ 
                  marginBottom: "20px", 
                  padding: "15px", 
                  border: "1px solid #ddd", 
                  borderRadius: "8px" 
                }}
              >
                <Link href={`/newsletter/${item._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 style={{ margin: "0 0 10px 0" }}>{item.title}</h3>
                  <p style={{ margin: "0", color: "#666" }}>
                    {item.subtitle || (typeof item.content === "string" ? item.content.slice(0, 150) + "..." : "")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
