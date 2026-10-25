"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  onSuccess?: () => void;
};

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/wall");
        }
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#6e6357] mb-1 font-sans">
          Email
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-[#d6c4b2] bg-[#fffaf3] text-[#241810] outline-none text-sm font-sans placeholder:text-[#a89582] focus:border-[#784628] focus:ring-1 focus:ring-[#784628] transition-all shadow-inner"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-bold text-[#634835] mb-1 font-sans">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-[#d6c4b2] bg-[#fffaf3] text-[#241810] outline-none text-sm font-sans placeholder:text-[#a89582] focus:border-[#784628] focus:ring-1 focus:ring-[#784628] transition-all shadow-inner"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          w-full bg-[#784628] text-[#fefaf2] py-3.5 rounded-xl text-sm font-serif font-bold tracking-wide
          border border-[#562f17] shadow-md
          hover:bg-[#8d5431] hover:shadow-lg
          active:scale-[0.99] transition-all duration-150
          disabled:opacity-50 cursor-pointer mt-4
        "
      >
        {loading ? "Opening Notebook..." : "Turn Page & Enter"}
      </button>
    </form>
  );
}
