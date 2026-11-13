import { type PropsWithChildren, useEffect } from 'react';

// Safari shrinks its visual viewport, not its layout viewport, for the keyboard.
// Size the app to what is actually visible; only the message list should scroll.
export function Viewport({ children }: PropsWithChildren) {
  useEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          '--chat-height',
          (viewport?.height ?? window.innerHeight) + 'px',
        );
        document.documentElement.style.setProperty(
          '--chat-top',
          (viewport?.offsetTop ?? 0) + 'px',
        );
      });
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <>
      <style>{`
        html, body, #root { margin: 0; height: 100%; overflow: hidden; }
        body { background: #F5F6F8; overscroll-behavior: none; }
        *, *::before, *::after { box-sizing: border-box; }
        textarea, input { font: inherit; -webkit-appearance: none; border: 0; outline: none !important; box-shadow: none !important; }
        textarea:focus, input:focus { outline: none !important; }
        button:focus-visible, [role="button"]:focus-visible { outline: 2px solid #315BEE; outline-offset: 3px; }
        ::selection { background: #DCE4FF; }
        .chat-viewport { position: fixed; top: var(--chat-top, 0px); left: 0; width: 100%; height: var(--chat-height, 100dvh); display: flex; flex-direction: column; overflow: hidden; }
      `}</style>
      <div className="chat-viewport">{children}</div>
    </>
  );
}
