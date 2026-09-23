import type { Metadata } from "next";
import "./globals.css";
import CatPet from "@/components/sites/yihanglizi-cn-bc4c2f76/shared/CatPet";

export const metadata: Metadata = {
  title: "个人博客",
  description: "记录技术学习与日常生活的个人博客",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" className="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{var choice=localStorage.getItem('clone-site-theme')||'星空极光';document.documentElement.dataset.docTheme=choice==='星空极光'?'starry':'cyber'}catch(e){document.documentElement.dataset.docTheme='starry'}" }} /></head><body>{children}<CatPet /></body></html>;
}
