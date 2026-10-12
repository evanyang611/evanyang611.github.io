import Document from "@/components/Document";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return <Document locale="zh-CN">{children}</Document>;
}
