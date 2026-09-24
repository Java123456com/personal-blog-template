"use client";

import { isValidElement, useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import "./MermaidDiagram.css";

let configured = false;

export default function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const diagramId = `mermaid-${reactId.replace(/[^a-z0-9_-]/gi, "")}`;

    async function draw() {
      try {
        const { default: mermaid } = await import("mermaid");
        if (!configured) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: "dark",
            fontFamily: "Inter, Microsoft YaHei, sans-serif",
            flowchart: { htmlLabels: false, curve: "basis" },
          });
          configured = true;
        }
        const result = await mermaid.render(diagramId, chart);
        if (!active) return;
        setSvg(result.svg);
        setError("");
        requestAnimationFrame(() => {
          if (active && containerRef.current) result.bindFunctions?.(containerRef.current);
        });
      } catch (cause) {
        if (!active) return;
        setSvg("");
        setError(cause instanceof Error ? cause.message : "图表语法无法解析");
      }
    }

    void draw();
    return () => { active = false; };
  }, [chart, reactId]);

  if (error) return (
    <div className="mermaid-diagram mermaid-diagram--error" role="alert">
      <strong>Mermaid 图表渲染失败</strong>
      <span>{error}</span>
    </div>
  );

  return (
    <div className="mermaid-diagram" ref={containerRef} aria-label="Mermaid 图表">
      {svg ? <div className="mermaid-diagram__canvas" dangerouslySetInnerHTML={{ __html: svg }} /> : <span className="mermaid-diagram__loading">正在绘制图表…</span>}
    </div>
  );
}

export function MermaidPre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const child = Array.isArray(children) ? children[0] : children;
  if (isValidElement<{ className?: string; children?: ReactNode }>(child)) {
    const className = child.props.className ?? "";
    if (/language-(?:mermaid|mer)(?:\s|$)/.test(className)) {
      const chart = String(child.props.children ?? "").replace(/\n$/, "");
      return <MermaidDiagram chart={chart} />;
    }
  }
  return <pre {...props}>{children}</pre>;
}
