"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", { email, password });
      localStorage.setItem("token", res.data.token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 border p-6 rounded">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        {error && <p className="text-red-600">{error}</p>}
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" className="w-full border p-2 rounded" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full bg-black text-white p-2 rounded" type="submit">Login</button>
      </form>
    </div>
  );
}


