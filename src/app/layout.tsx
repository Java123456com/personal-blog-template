import type { Metadata } from "next";
import "./globals.css";
import CatPet from "@/components/sites/yihanglizi-cn-bc4c2f76/shared/CatPet";
import { bootstrapOptionalFont } from "@/lib/optional-font";

export const metadata: Metadata = {
  title: "个人博客",
  description: "记录技术学习与日常生活的个人博客",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fontBootstrap = `(${bootstrapOptionalFont.toString()})("/sites/yihanglizi-cn-bc4c2f76/root-8a5edab2/assets/inter.woff2");`;
  return <html lang="zh-CN" className="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{var version='starry-default-v2';var savedVersion=localStorage.getItem('clone-site-theme-default');var choice=localStorage.getItem('clone-site-theme');if(savedVersion!==version){choice='星空极光';localStorage.setItem('clone-site-theme',choice);localStorage.setItem('clone-site-theme-default',version)}choice=choice||'星空极光';document.documentElement.dataset.docTheme=choice==='星空极光'?'starry':'cyber'}catch(e){document.documentElement.dataset.docTheme='starry'}" }} /><script dangerouslySetInnerHTML={{ __html: fontBootstrap }} /></head><body>{children}<CatPet /></body></html>;
}
