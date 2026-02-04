"use client";

import Image from "next/image";
import loginCoverImage from "../../assets/login-cover.png";
import logo from "../../assets/logo.png";
import { Button } from "../../components/ui/button";
import {
  MdFactory,
  MdHelp,
  MdInventory,
  MdRemoveRedEye,
  MdStorefront,
} from "react-icons/md";
import { useState } from "react";
import { Input } from "../../../src/components/ui/input";
import Link from "next/link";
import { auth } from "../../../src/lib/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

const roleOptions = [
  {
    id: 1,
    title: "Manufacturer",
    role: "manufacturer",
    icon: <MdFactory className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "Wholesaler",
    role: "wholesaler",
    icon: <MdInventory className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "Retailer",
    role: "retailer",
    icon: <MdStorefront className="w-6 h-6 text-primary" />,
  },
];

const Login = () => {
  const [role, setRole] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((value) => {
        console.log(value);
        setEmail("");
        setPassword("");
        router.push("/");
      })
      .catch((error) => {
        console.error("Error signing in:", error);
      });
  };

  return (
    <div className="flex flex-1 w-full overflow-hidden min-h-screen">
      <div className="w-full lg:w-1/2 flex flex-col bg-white p-3">
        <div className="lg:hidden flex items-center justify-center gap-2">
          <div className="size-15">
            <Image src={logo} alt="logo" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">UdyogBill</h1>
        </div>

        <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-8 lg:py-12">
          <div className="max-w-110 w-full mx-auto">
            <h2 className="text-[#0d161b] text-center text-3xl font-black leading-tight tracking-tight mb-5">
              Welcome back
            </h2>

            <div className="text-left md:text-center mb-2">
              <h2 className="text-[#0d161b] text-lg font-black leading-tight tracking-tight mb-2">
                Select Your Role
              </h2>
              <p className="text-slate-500 text-sm">
                Choose your account type to continue to your dashboard.
              </p>
            </div>

            <div className="flex items-center justify-start md:justify-center gap-3 mb-5 flex-wrap md:flex-nowrap">
              {roleOptions.map((feature) => (
                <div className="relative" key={feature.id}>
                  <input
                    className="hidden peer"
                    id={`role-${feature.id}`}
                    name="user-role"
                    type="radio"
                    value={feature.role}
                    checked={role === feature.role}
                    onChange={(e) => setRole(e.target.value)}
                  />

                  <label
                    htmlFor={`role-${feature.id}`}
                    className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all
                      ${role === feature.role ? "border-primary/50 bg-primary/5" : "border-slate-100 hover:border-primary/50"}
                    `}
                  >
                    <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-[#0d161b]">
                      {feature.title}
                    </h3>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. david@textilecorp.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                trailingIcon={<MdRemoveRedEye className="w-4 h-4" />}
                onTrailingIconClick={() => setShowPassword(!showPassword)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center">
                    <input
                      className="h-4 w-4 rounded border-[#cfdde7] border-2 bg-transparent text-primary focus:ring-primary/20 focus:ring-offset-0 cursor-pointer transition-all"
                      id="remember-me"
                      type="checkbox"
                    />
                  </div>
                  <label
                    className="text-slate-600 text-sm font-medium cursor-pointer select-none"
                    htmlFor="remember-me"
                  >
                    Remember Me
                  </label>
                </div>
                <a
                  className="text-primary text-sm font-bold hover:underline"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>

              <Button size="md" className="w-full" onClick={handleLogin}>
                Sign In to Dashboard
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-slate-500">{`Don't have an account?`}</span>
                <Link
                  href="/"
                  className="text-primary font-bold hover:underline"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MdHelp className="w-8 h-8 text-primary" />

                <p className="text-xs text-slate-500 leading-relaxed">
                  {`Need help logging in? Please contact your organization's IT administrator or reach out to `}
                  <a
                    className="text-primary font-medium hover:underline"
                    href="#"
                  >
                    support@udyogbill.in
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:hidden p-8 text-center text-slate-400 text-xs mt-auto">
          © 2026 UdyogBill Financial. All rights reserved.
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60 mix-blend-multiply"
          data-alt="High quality macro texture of woven textile fabric"
          style={{
            backgroundImage: `url(${loginCoverImage.src})`,
          }}
        ></div>
        <div className="relative z-10 p-12 max-w-lg text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-15 p-1 bg-white text-primary rounded-lg flex items-center justify-center">
              <Image src={logo} alt="logo" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">UdyogBill</h1>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">
            Modernizing Finance for the Textile Industry
          </h2>
          <p className="text-xl text-white/90 font-medium">
            Streamline your invoices, track production costs, and manage your
            global supply chain finances in one place.
          </p>
        </div>
        <div className="absolute bottom-8 right-12 z-10 text-white/70 text-sm">
          © 2026 UdyogBill Financial. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
