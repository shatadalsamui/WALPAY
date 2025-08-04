import { Card } from "@repo/ui/card";

type UserDetailsCardProps = {
  name: string;
  email: string;
  phone: string;
};

export function UserDetailsCard({ name, email, phone }: UserDetailsCardProps) {
  return (
    <Card title="Profile Information">
      <div className="space-y-3 pt-2 ">
        <p><span className="font-medium">Name:</span> {name}</p>
        <p><span className="font-medium">Email:</span> {email}</p>
        <p><span className="font-medium">Phone:</span> {phone}</p>
      </div>
    </Card>
  );
}
