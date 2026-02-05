import Image from "next/image";
import logo from "../assets/logo.png";
import Link from "next/link";
import { BsLinkedin, BsTwitterX } from "react-icons/bs";

export const Footer = () => {
  return (
    <div className="bg-slate-50 pb-8 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 bg-slate-50 pb-8 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="py-4 text-center md:text-left">
            <Link
              href="/"
              className="flex items-center justify-center md:justify-start gap-1 cursor-pointer"
            >
              <Image
                src={logo}
                alt="logo"
                width={96}
                height={96}
                className="h-20 w-auto"
              />
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                UdyogBill
              </h2>
            </Link>
            <p className="text-sm text-slate-500 mt-2 max-w-125">
              Revolutionizing financial workflows for the global textile
              industry through modern technology and deep industry insights.
            </p>
          </div>

          <div className="py-4 text-center md:text-left">
            <h4 className="font-bold text-slate-900 uppercase text-md tracking-widest">
              Legal
            </h4>
            <nav className="mt-2 flex flex-col gap-2 text-sm text-slate-500">
              <a className="hover:text-primary transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                Terms of Service
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                Cookie Policy
              </a>
            </nav>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-200 gap-4">
          <p className="text-sm text-slate-500">
            © 2026 UdyogBill Financial. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="https://x.com/"
              target="_blank"
              className="p-2 bg-slate-200 rounded-full text-slate-600 hover:text-primary transition-colors"
            >
              <BsTwitterX className="w-6 h-6" />
            </Link>
            <Link
              href="https://www.linkedin.com/"
              target="_blank"
              className="p-2 bg-slate-200 rounded-full text-slate-600 hover:text-primary transition-colors"
            >
              <BsLinkedin className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
