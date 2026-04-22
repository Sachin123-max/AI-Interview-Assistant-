import React from "react";
import { BsRobot } from "react-icons/bs";

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-6 py-10 text-center transition-all duration-300 hover:shadow-lg">
          
          {/* Logo Section */}
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="bg-black text-white p-3 rounded-xl">
              <BsRobot size={18} />
            </div>
            <h2 className="text-lg font-semibold tracking-wide">
              InterviewIQ.AI
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            AI-powered interview platform designed to improve communication
            skills, enhance technical depth, and build professional confidence.
          </p>

          {/* Divider */}
          <div className="w-16 h-[2px] bg-black mx-auto my-6 opacity-20"></div>

          {/* Bottom Text */}
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} InterviewIQ.AI — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;