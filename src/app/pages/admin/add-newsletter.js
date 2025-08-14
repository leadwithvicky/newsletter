import { useState } from "react";
import axios from "axios";

export default function AddNewsletter() {
  const [form, setForm] = useState({ title: "", subtitle: "", content: "", links: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, links: form.links.split(",") };
    await axios.post("http://localhost:5000/api/newsletters", payload);
    alert("Newsletter added!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" onChange={handleChange} />
      <input name="subtitle" placeholder="Subtitle" onChange={handleChange} />
      <textarea name="content" placeholder="Content" onChange={handleChange}></textarea>
      <input name="links" placeholder="Links (comma separated)" onChange={handleChange} />
      <button type="submit">Add Newsletter</button>
    </form>
  );
}
