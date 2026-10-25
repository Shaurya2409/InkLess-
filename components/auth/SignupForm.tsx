"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SignupFormProps = {
  onSuccess?: () => void;
};

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Verification code sent to your email.");
        setShowOtpBox(true);
      } else {
        alert(data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter the 6-digit verification code");
      return;
    }

    try {
      setLoading(true);

      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        alert(verifyData.message || "Invalid verification code");
        return;
      }

      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const signupData = await signupRes.json();

      if (signupData.success) {
        alert("Your ledger is created! Please sign in to begin.");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/login");
        }
      } else {
        alert(signupData.message || "Could not complete registration");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {!showOtpBox ? (
        <form onSubmit={handleSendOtp} className="space-y-3">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#6e6357] mb-1 font-sans">
              Author Pen Name
            </label>
            <input
              type="text"
              placeholder="e.g. wanderer, quiet_ink"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4b8a5] bg-[#fbf8f1] text-[#24211e] outline-none text-sm font-sans placeholder:text-[#a89d8f] focus:border-[#7c6a53] focus:ring-1 focus:ring-[#7c6a53] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#6e6357] mb-1 font-sans">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4b8a5] bg-[#fbf8f1] text-[#24211e] outline-none text-sm font-sans placeholder:text-[#a89d8f] focus:border-[#7c6a53] focus:ring-1 focus:ring-[#7c6a53] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#6e6357] mb-1 font-sans">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-[#c4b8a5] bg-[#fbf8f1] text-[#24211e] outline-none text-sm font-sans placeholder:text-[#a89d8f] focus:border-[#7c6a53] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#6e6357] mb-1 font-sans">
                Confirm
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-[#c4b8a5] bg-[#fbf8f1] text-[#24211e] outline-none text-sm font-sans placeholder:text-[#a89d8f] focus:border-[#7c6a53] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#784628] text-[#fefaf2] py-3.5 rounded-xl text-sm font-serif font-bold tracking-wide border border-[#562f17] shadow-md hover:bg-[#8d5431] hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer mt-3"
          >
            {loading ? "Sending Code..." : "Send Verification Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-xs text-[#6e6357] leading-relaxed">
            A 6-digit code was sent to <strong className="text-[#24211e]">{email}</strong>. Enter it below to bind your ledger.
          </p>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#6e6357] mb-1 font-sans">
              Verification Code
            </label>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4b8a5] bg-[#fbf8f1] text-[#24211e] outline-none text-center font-mono text-lg tracking-widest focus:border-[#7c6a53] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#784628] text-[#fefaf2] py-3.5 rounded-xl text-sm font-serif font-bold tracking-wide border border-[#562f17] shadow-md hover:bg-[#8d5431] hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Verifying..." : "Bind Ledger & Enter"}
          </button>

          <button
            type="button"
            onClick={() => setShowOtpBox(false)}
            className="w-full text-xs text-[#7c6a53] hover:underline text-center cursor-pointer"
          >
            ← Change details
          </button>
        </form>
      )}
    </div>
  );
}
