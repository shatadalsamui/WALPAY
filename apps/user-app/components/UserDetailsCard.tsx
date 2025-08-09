import { Card } from "@repo/ui/card";
import Link from "next/link";

type UserDetailsCardProps = {
  name: string;
  email: string;
  phone: string;
};

export function UserDetailsCard({ name, email, phone }: UserDetailsCardProps) {
  return (
    <>
      <Card title="Profile Information">
        <div className="space-y-3 pt-2 ">
          <p><span className="font-medium">Name:</span> {name}</p>
          <p><span className="font-medium">Email:</span> {email}</p>
          <p><span className="font-medium">Phone:</span> {phone}</p>
        </div>
      </Card>
      <div className="mt-1">
        <div className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-gray-700 font-semibold" style={{ fontSize: '1.15rem' }}>Want to reset your password?</div>
          <Link href="/resetPassword/verifyEmail">
            <span className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors duration-150 cursor-pointer">Reset Password</span>
          </Link>
        </div>
      </div>
    </>
  );
}
