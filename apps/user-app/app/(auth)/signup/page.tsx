import { Center } from "@repo/ui/center"
import { AuthForm } from "../../../components/AuthForm"

export default function SignupPage() {
  return (
    <Center>
      <div className="w-full max-w-md py-40">
        <AuthForm mode="signup" />
      </div>
    </Center>
  )
}