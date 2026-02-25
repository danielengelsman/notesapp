// Force dynamic rendering — prevents static prerender from hitting Supabase middleware
export const dynamic = 'force-dynamic';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
