import { useAuthContext } from "@/lib/auth-provider";

const ADMIN_EMAILS = ["maylomaylo768@gmail.com"];

export function useIsAdmin() {
  const { profile, user } = useAuthContext();
  const isAdmin =
    profile?.admin_role === true ||
    (user?.email ? ADMIN_EMAILS.includes(user.email) : false);
  return { data: isAdmin, isLoading: false };
}
