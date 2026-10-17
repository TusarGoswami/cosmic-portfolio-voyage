import { useEffect, useRef } from "react";

const CustomCursor = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);
  const mousePosRef = useRef({ x: -100, y: -100 });
  const trailPosRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      mousePosRef.current.x = x;
      mousePosRef.current.y = y;

      // Direct instant transform update — absolutely 0ms lag
      if (mainRef.current) {
        mainRef.current.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`;
      }

      // Check if mouse is hovering over interactive elements or pointer cursor is active
      const target = e.target as HTMLElement | null;
      const isPointer =
        document.body.style.cursor === "pointer" ||
        !!(
          target &&
          (target.closest("button") ||
            target.closest("a") ||
            target.closest("[role='button']") ||
            window.getComputedStyle(target).cursor === "pointer")
        );

      if (isPointer !== isHoveringRef.current) {
        isHoveringRef.current = isPointer;
        if (innerRef.current) {
          innerRef.current.style.transform = isPointer ? "scale(1.5)" : "scale(1)";
        }
      }
    };

    // Smooth RAF loop for the subtle glow trail
    const renderTrail = () => {
      trailPosRef.current.x += (mousePosRef.current.x - trailPosRef.current.x) * 0.22;
      trailPosRef.current.y += (mousePosRef.current.y - trailPosRef.current.y) * 0.22;

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailPosRef.current.x - 20}px, ${trailPosRef.current.y - 20}px, 0)`;
      }

      animId = requestAnimationFrame(renderTrail);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    animId = requestAnimationFrame(renderTrail);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Main cursor - crosshair style — instantaneous 0ms tracking without transition delay */}
      <div
        ref={mainRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ willChange: "transform", transform: "translate3d(-100px, -100px, 0)" }}
      >
        <div
          ref={innerRef}
          className="relative w-6 h-6 transition-transform duration-150 ease-out"
        >
          {/* Crosshair design */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-foreground rounded-full" />
          </div>
          <div className="absolute top-1/2 left-0 w-1.5 h-0.5 bg-foreground -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-1.5 h-0.5 bg-foreground -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-0.5 h-1.5 bg-foreground -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-1.5 bg-foreground -translate-x-1/2" />
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Trailing glow — smooth lerp via requestAnimationFrame */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ willChange: "transform", transform: "translate3d(-100px, -100px, 0)" }}
      >
        <div className="w-10 h-10 rounded-full bg-accent/20 blur-md" />
      </div>
    </>
  );
};

export default CustomCursor;
