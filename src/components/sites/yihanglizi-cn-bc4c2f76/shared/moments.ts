/** Adds the interactions missing from the captured moments pages. */
export function enhanceMoments(root: HTMLElement, path: string): () => void {
  const cleanups: Array<() => void> = [];

  if (path === "/moments/life/") {
    const input = root.querySelector<HTMLInputElement>("#gateInput");
    const button = root.querySelector<HTMLButtonElement>("#gateBtn");
    const error = root.querySelector<HTMLElement>("#gateErr");

    if (input && button && error) {
      const submit = () => {
        error.textContent = input.value.trim()
          ? "暗号不正确，请重试。"
          : "请输入暗号。";
        input.setAttribute("aria-invalid", "true");
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") submit();
      };
      const onInput = () => {
        error.textContent = "";
        input.removeAttribute("aria-invalid");
      };

      button.addEventListener("click", submit);
      input.addEventListener("keydown", onKeyDown);
      input.addEventListener("input", onInput);
      cleanups.push(() => {
        button.removeEventListener("click", submit);
        input.removeEventListener("keydown", onKeyDown);
        input.removeEventListener("input", onInput);
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }

  if (path !== "/moments/tech/") return () => {};

  const content = root.querySelector<HTMLElement>("#momentsContent");
  const timeline = content?.querySelector<HTMLElement>(".timeline");
  const sortButtons = Array.from(
    content?.querySelectorAll<HTMLButtonElement>(".sort-btn[data-order]") ?? [],
  );

  if (timeline && sortButtons.length) {
    const originalCards = Array.from(
      timeline.querySelectorAll<HTMLElement>(":scope > .moment-card"),
    );

    for (const button of sortButtons) {
      const onClick = () => {
        const ascending = button.dataset.order === "asc";
        const cards = ascending ? [...originalCards].reverse() : originalCards;
        timeline.replaceChildren(...cards);
        for (const option of sortButtons) {
          const active = option === button;
          option.classList.toggle("active", active);
          option.setAttribute("aria-pressed", String(active));
        }
      };
      button.addEventListener("click", onClick);
      cleanups.push(() => button.removeEventListener("click", onClick));
    }
    for (const button of sortButtons) {
      button.setAttribute("aria-pressed", String(button.classList.contains("active")));
    }
  }

  const lightbox = root.querySelector<HTMLElement>("#momentsLightbox");
  const preview = lightbox?.querySelector<HTMLImageElement>("img");
  const closeButton = lightbox?.querySelector<HTMLButtonElement>(".lightbox-close");
  const prevButton = lightbox?.querySelector<HTMLButtonElement>(".lightbox-nav.prev");
  const nextButton = lightbox?.querySelector<HTMLButtonElement>(".lightbox-nav.next");
  const counter = lightbox?.querySelector<HTMLElement>(".lightbox-counter");
  const images = Array.from(
    content?.querySelectorAll<HTMLImageElement>(".moment-images img") ?? [],
  );

  if (lightbox && preview && closeButton && prevButton && nextButton && counter) {
    let activeImages: HTMLImageElement[] = [];
    let activeIndex = 0;

    const render = () => {
      const image = activeImages[activeIndex];
      const source = image?.currentSrc || image?.getAttribute("src");
      if (!image || !source) return;
      preview.src = source;
      preview.alt = image.alt || "预览图片";
      counter.textContent = `${activeIndex + 1} / ${activeImages.length}`;
      prevButton.hidden = activeImages.length < 2;
      nextButton.hidden = activeImages.length < 2;
    };
    const close = () => {
      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
      preview.removeAttribute("src");
      activeImages = [];
    };
    const step = (offset: number) => {
      if (!activeImages.length) return;
      activeIndex = (activeIndex + offset + activeImages.length) % activeImages.length;
      render();
    };
    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === lightbox) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!lightbox.classList.contains("active")) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    const onPrev = () => step(-1);
    const onNext = () => step(1);

    for (const image of images) {
      const open = () => {
        const card = image.closest(".moment-card");
        activeImages = Array.from(
          card?.querySelectorAll<HTMLImageElement>(".moment-images img") ?? [],
        ).filter((candidate) => Boolean(candidate.currentSrc || candidate.getAttribute("src")));
        activeIndex = activeImages.indexOf(image);
        if (activeIndex < 0) return;
        render();
        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
        closeButton.focus();
      };
      image.addEventListener("click", open);
      cleanups.push(() => image.removeEventListener("click", open));
    }

    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-hidden", "true");
    closeButton.addEventListener("click", close);
    prevButton.addEventListener("click", onPrev);
    nextButton.addEventListener("click", onNext);
    lightbox.addEventListener("click", onBackdropClick);
    document.addEventListener("keydown", onKeyDown);
    cleanups.push(() => {
      close();
      closeButton.removeEventListener("click", close);
      prevButton.removeEventListener("click", onPrev);
      nextButton.removeEventListener("click", onNext);
      lightbox.removeEventListener("click", onBackdropClick);
      document.removeEventListener("keydown", onKeyDown);
    });
  }

  return () => cleanups.forEach((cleanup) => cleanup());
}
