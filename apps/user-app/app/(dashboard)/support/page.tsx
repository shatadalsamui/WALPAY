import React from "react";
// Dummy user info, replace with real user data as needed
const userInfo = {
  name: "Shatadal Samui",
  email: "shatadalsamuimain@gmail.com",
  phone: "+91-8900112837"
};

export default function SupportPage() {
  return (
  <div className="max-w-xl w-full ml-8 mt-16 bg-white/80 rounded-xl shadow-lg p-8 text-left h-96 overflow-auto">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">Support</h1>
      <p className="text-lg text-gray-700 mb-6">
        If you need help, you can reach out to us or find your account details below.
      </p>
      <div className="bg-blue-50 rounded-lg p-6 mb-4">
        <div className="mb-2">
          <span className="font-semibold text-gray-800">Name:</span> {userInfo.name}
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-800">Email:</span> {userInfo.email}
        </div>
        <div>
          <span className="font-semibold text-gray-800">Phone:</span> {userInfo.phone}
        </div>
      </div>
      <p className="text-gray-500 text-sm">For further assistance, contact shatadalsamuimain@gmail.com</p>
    </div>
  );
}
