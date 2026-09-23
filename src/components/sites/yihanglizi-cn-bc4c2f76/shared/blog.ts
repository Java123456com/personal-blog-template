/** Restore lightweight controls that originally depended on the site's Vue runtime. */
export function enhanceBlog(root: HTMLElement, path: string): () => void {
  const cleanups: Array<() => void> = [];
  if (path === "/blog/") {
    const list = root.querySelector<HTMLElement>(".bl");
    const scroll = (event: Event) => {
      event.preventDefault();
      list?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    for (const control of root.querySelectorAll<HTMLElement>(".hv-btn.primary[href='#'], .hv-scroll")) {
      control.addEventListener("click", scroll);
      cleanups.push(() => control.removeEventListener("click", scroll));
    }
    for (const link of root.querySelectorAll<HTMLAnchorElement>(".hv-index-link")) {
      const click = (event: Event) => {
        const target = root.querySelector<HTMLElement>(`#bl-${link.hash.slice(1)}`);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      link.addEventListener("click", click);
      cleanups.push(() => link.removeEventListener("click", click));
    }
  }

  for (const button of root.querySelectorAll<HTMLButtonElement>(".vp-doc .copy")) {
    const click = async () => {
      const code = button.parentElement?.querySelector("pre code")?.textContent;
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        button.classList.add("copied");
        button.title = "已复制";
        window.setTimeout(() => { button.classList.remove("copied"); button.title = "Copy Code"; }, 1800);
      } catch { button.title = "复制失败"; }
    };
    button.addEventListener("click", click);
    cleanups.push(() => button.removeEventListener("click", click));
  }
  return () => cleanups.forEach(cleanup => cleanup());
}
