"use client";

import { useEffect } from "react";
import { enhanceNav } from "../root-8a5edab2/nav";
import { enhanceMoments } from "./moments";
import { enhanceFriends } from "./friends";
import { enhanceResume } from "./resume";
import { enhanceBlog } from "./blog";
import { enhanceAssets } from "./assets";
import { enhanceBackground } from "./background";

export default function PageEnhancements({ path, managed = false }: { path: string; managed?: boolean }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("#app .Layout");
    if (!root) return;
    const cleanup = [enhanceNav(root, ""), enhanceAssets(root), enhanceBackground(root)];
    if (!managed && path.startsWith("/moments/")) cleanup.push(enhanceMoments(root, path));
    if (path === "/friends/") cleanup.push(enhanceFriends(root));
    if (path === "/resume/") cleanup.push(enhanceResume(root));
    if (path.startsWith("/blog/")) cleanup.push(enhanceBlog(root, path));
    return () => cleanup.forEach(fn => fn());
  }, [path, managed]);
  return null;
}
