import AccountPageShell from "@/components/account/AccountPageShell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountPageShell>{children}</AccountPageShell>;
}
