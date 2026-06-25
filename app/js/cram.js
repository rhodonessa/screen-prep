export function render(container) {
  // inject styles (idempotent)
  if (!document.getElementById('cram-styles')) {
  const style = document.createElement('style');
  style.id = 'cram-styles';
  style.textContent = `
    .cram-root {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f6f7f9;
      color: #1f2328;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }
    .cram-root * { box-sizing: border-box; }

    /* landing */
    .cram-landing {
      width: 100%;
      max-width: 820px;
      padding: 36px 24px 24px;
    }
    .cram-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2563eb;
      margin: 0 0 6px;
      letter-spacing: -0.5px;
    }
    .cram-subtitle {
      font-size: 0.85rem;
      color: #57606a;
      margin: 0 0 28px;
    }
    .cram-deck-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .cram-deck-btn {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      color: #1f2328;
      padding: 10px 18px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      min-width: 110px;
    }
    .cram-deck-btn:hover {
      background: #f1f3f5;
      border-color: #2563eb;
      box-shadow: 0 1px 4px rgba(37,99,235,0.1);
    }
    .cram-deck-name {
      font-weight: 600;
    }
    .cram-deck-count {
      font-size: 0.75rem;
      color: #57606a;
    }
    .cram-deck-btn.cram-special {
      border-color: #2563eb;
      background: rgba(37,99,235,0.04);
    }
    .cram-deck-btn.cram-special:hover {
      background: rgba(37,99,235,0.08);
    }
    .cram-reel-btn {
      width: 100%;
      max-width: 820px;
      margin: 0 0 18px;
      background: #ffffff;
      border: 1px solid #2563eb;
      border-radius: 10px;
      color: #1f2328;
      padding: 14px 22px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
    }
    .cram-reel-btn:hover {
      background: rgba(37,99,235,0.04);
      border-color: #1d4ed8;
      box-shadow: 0 1px 4px rgba(37,99,235,0.12);
    }
    .cram-reel-btn-sub {
      font-size: 0.78rem;
      color: #57606a;
      font-weight: 400;
    }
    .cram-narrated-btn {
      width: 100%;
      max-width: 820px;
      margin: 0 0 18px;
      background: #ffffff;
      border: 1px solid #7c3aed;
      border-radius: 10px;
      color: #1f2328;
      padding: 14px 22px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
    }
    .cram-narrated-btn:hover {
      background: rgba(124,58,237,0.04);
      border-color: #6d28d9;
      box-shadow: 0 1px 4px rgba(124,58,237,0.12);
    }
    .cram-narrated-btn-sub {
      font-size: 0.78rem;
      color: #57606a;
      font-weight: 400;
    }

    /* card view */
    .cram-view {
      width: 100%;
      max-width: 820px;
      padding: 20px 24px 24px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .cram-topbar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .cram-back-btn {
      background: none;
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .cram-back-btn:hover { color: #1f2328; border-color: #2563eb; }
    .cram-deck-label {
      font-size: 0.8rem;
      color: #2563eb;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cram-progress {
      margin-left: auto;
      font-size: 0.8rem;
      color: #57606a;
    }
    .cram-progress-bar-wrap {
      width: 100%;
      height: 3px;
      background: #e5e7eb;
      border-radius: 2px;
      margin-bottom: 20px;
    }
    .cram-progress-bar {
      height: 3px;
      background: #2563eb;
      border-radius: 2px;
      transition: width 0.2s;
    }

    /* card */
    .cram-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 36px 40px 32px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 340px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      position: relative;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .cram-card:hover { border-color: #2563eb; box-shadow: 0 2px 8px rgba(37,99,235,0.1); }
    .cram-card.cram-shaky { border-color: #d97706; }
    .cram-card-tier {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 0.7rem;
      color: #57606a;
      background: #f1f3f5;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    .cram-shaky-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      font-size: 0.7rem;
      color: #b45309;
      font-weight: 700;
    }
    .cram-card-tag {
      font-size: 1.6rem;
      font-weight: 800;
      color: #1f2328;
      margin: 0 0 16px;
      line-height: 1.2;
      letter-spacing: -0.5px;
    }
    .cram-card-trigger {
      font-size: 1rem;
      color: #57606a;
      margin: 0;
      line-height: 1.5;
    }
    .cram-card-trigger strong {
      color: #2563eb;
    }
    .cram-flip-hint {
      margin-top: auto;
      padding-top: 24px;
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
    }

    /* revealed */
    .cram-divider {
      width: 100%;
      height: 1px;
      background: #e5e7eb;
      margin: 20px 0;
    }
    .cram-move {
      font-size: 1.05rem;
      color: #1f2328;
      font-weight: 600;
      line-height: 1.5;
      margin: 0 0 16px;
    }
    .cram-skeleton {
      background: #f8f9fa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px 18px;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 0.85rem;
      color: #1d4ed8;
      white-space: pre;
      line-height: 1.6;
      margin: 0 0 16px;
      overflow-x: auto;
    }
    .cram-gotcha {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 0.85rem;
      color: #92400e;
      line-height: 1.45;
    }
    .cram-gotcha-label {
      font-weight: 700;
      white-space: nowrap;
    }

    /* controls bar */
    .cram-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 18px;
      flex-wrap: wrap;
    }
    .cram-ctrl-btn {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.78rem;
      transition: background 0.1s, color 0.1s, border-color 0.1s;
    }
    .cram-ctrl-btn:hover { color: #1f2328; border-color: #2563eb; }
    .cram-ctrl-btn.cram-active {
      background: rgba(37,99,235,0.06);
      border-color: #2563eb;
      color: #2563eb;
    }
    .cram-ctrl-btn.cram-shaky-active {
      background: #fffbeb;
      border-color: #d97706;
      color: #b45309;
    }
    .cram-auto-progress {
      height: 3px;
      background: #e5e7eb;
      border-radius: 2px;
      width: 100%;
      margin-top: 6px;
      overflow: hidden;
    }
    .cram-auto-fill {
      height: 3px;
      background: #2563eb;
      border-radius: 2px;
      width: 0%;
      transition: none;
    }

    /* key hints */
    .cram-keyhints {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 14px;
    }
    .cram-keyhint {
      font-size: 0.7rem;
      color: #6b7280;
      background: #f1f3f5;
      border: 1px solid #e5e7eb;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .cram-keyhint kbd {
      color: #57606a;
      font-weight: 600;
    }
    .cram-empty {
      color: #57606a;
      text-align: center;
      padding: 60px 0;
      font-size: 0.95rem;
    }
    .cram-example {
      color: #57606a;
      font-size: 0.9rem;
      font-style: italic;
      line-height: 1.5;
      margin: 0 0 16px;
      border-left: 2px solid #e5e7eb;
      padding-left: 12px;
    }

    /* ---- REEL ---- */
    .reel-root {
      position: fixed;
      inset: 0;
      background: #f6f7f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      z-index: 200;
      overflow: hidden;
      touch-action: none;
    }
    .reel-topbar {
      width: 100%;
      max-width: 480px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px 10px;
      flex-shrink: 0;
    }
    .reel-back {
      background: none;
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.78rem;
    }
    .reel-back:hover { color: #1f2328; border-color: #2563eb; }
    .reel-pills {
      display: flex;
      gap: 6px;
      flex-wrap: nowrap;
      overflow-x: auto;
    }
    .reel-pill {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 4px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
      transition: background 0.1s, border-color 0.1s, color 0.1s;
      min-height: 40px;
      display: flex;
      align-items: center;
    }
    .reel-pill:hover { border-color: #2563eb; color: #1f2328; }
    .reel-pill.reel-pill-active {
      background: rgba(37,99,235,0.06);
      border-color: #2563eb;
      color: #2563eb;
    }
    .reel-reshuffle {
      margin-left: auto;
      background: none;
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.72rem;
      white-space: nowrap;
      min-height: 40px;
    }
    .reel-reshuffle:hover { color: #1f2328; border-color: #2563eb; }
    .reel-progress-wrap {
      width: 100%;
      max-width: 480px;
      padding: 0 16px 8px;
      flex-shrink: 0;
    }
    .reel-progress-text {
      font-size: 0.72rem;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .reel-progress-bar-bg {
      width: 100%;
      height: 2px;
      background: #e5e7eb;
      border-radius: 2px;
    }
    .reel-progress-bar-fill {
      height: 2px;
      background: #2563eb;
      border-radius: 2px;
      transition: width 0.2s;
    }
    .reel-card-area {
      flex: 1;
      width: 100%;
      max-width: 480px;
      padding: 8px 16px 8px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .reel-card {
      flex: 1;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 28px 28px 24px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      position: relative;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .reel-card:hover { border-color: #2563eb; box-shadow: 0 2px 8px rgba(37,99,235,0.1); }
    .reel-card.reel-shaky { border-color: #d97706; }
    .reel-deck-tag {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #2563eb;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .reel-deck-badge {
      background: rgba(37,99,235,0.06);
      border: 1px solid rgba(37,99,235,0.25);
      border-radius: 4px;
      padding: 1px 7px;
      font-size: 0.68rem;
    }
    .reel-card-tag {
      font-size: 1.75rem;
      font-weight: 800;
      color: #1f2328;
      line-height: 1.15;
      letter-spacing: -0.5px;
      margin: 0 0 14px;
    }
    .reel-card-trigger {
      font-size: 1rem;
      color: #57606a;
      line-height: 1.55;
      margin: 0;
    }
    .reel-card-trigger strong { color: #2563eb; }
    .reel-flip-hint {
      margin-top: auto;
      padding-top: 20px;
      font-size: 0.72rem;
      color: #6b7280;
      text-align: center;
    }
    .reel-tier-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      font-size: 0.65rem;
      color: #57606a;
      background: #f1f3f5;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    .reel-shaky-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      font-size: 0.65rem;
      color: #b45309;
      font-weight: 700;
    }
    .reel-divider {
      width: 100%;
      height: 1px;
      background: #e5e7eb;
      margin: 18px 0;
    }
    .reel-move {
      font-size: 1rem;
      color: #1f2328;
      font-weight: 600;
      line-height: 1.5;
      margin: 0 0 14px;
    }
    .reel-skeleton {
      background: #f8f9fa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 14px;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 0.82rem;
      color: #1d4ed8;
      white-space: pre;
      line-height: 1.55;
      margin: 0 0 14px;
      overflow-x: auto;
    }
    .reel-gotcha {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 9px 12px;
      font-size: 0.82rem;
      color: #92400e;
      line-height: 1.4;
    }
    .reel-gotcha-label { font-weight: 700; white-space: nowrap; }
    .reel-example {
      color: #57606a;
      font-size: 0.85rem;
      font-style: italic;
      line-height: 1.5;
      margin: 0 0 14px;
      border-left: 2px solid #e5e7eb;
      padding-left: 10px;
    }
    .reel-auto-fill-bar {
      width: 100%;
      max-width: 480px;
      height: 2px;
      background: #e5e7eb;
      flex-shrink: 0;
    }
    .reel-auto-fill {
      height: 2px;
      background: #2563eb;
      width: 0%;
      transition: none;
    }
    .reel-controls {
      width: 100%;
      max-width: 480px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px 16px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .reel-ctrl-btn {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.72rem;
      min-height: 40px;
      transition: background 0.1s, color 0.1s, border-color 0.1s;
    }
    .reel-ctrl-btn:hover { color: #1f2328; border-color: #2563eb; }
    .reel-ctrl-btn.reel-active {
      background: rgba(37,99,235,0.06);
      border-color: #2563eb;
      color: #2563eb;
    }
    .reel-ctrl-btn.reel-shaky-active {
      background: #fffbeb;
      border-color: #d97706;
      color: #b45309;
    }
    .reel-swipe-hint {
      font-size: 0.65rem;
      color: #6b7280;
      text-align: center;
      padding-bottom: 4px;
      flex-basis: 100%;
    }

    /* ---- NARRATED AUTO-PLAY ---- */
    .nr-root {
      position: fixed;
      inset: 0;
      background: #f6f7f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      z-index: 300;
      overflow: hidden;
      touch-action: none;
    }
    .nr-topbar {
      width: 100%;
      max-width: 480px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px 8px;
      flex-shrink: 0;
      z-index: 2;
    }
    .nr-back {
      background: rgba(255,255,255,0.85);
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.78rem;
      backdrop-filter: blur(4px);
    }
    .nr-back:hover { color: #1f2328; border-color: #7c3aed; }
    .nr-progress-text {
      font-size: 0.72rem;
      color: #6b7280;
      margin-left: auto;
    }
    .nr-progress-bar-bg {
      width: 100%;
      max-width: 480px;
      height: 2px;
      background: #e5e7eb;
      flex-shrink: 0;
    }
    .nr-progress-bar-fill {
      height: 2px;
      background: #7c3aed;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    .nr-stage {
      flex: 1;
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 20px;
      position: relative;
      overflow: hidden;
    }
    .nr-deck-badge {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border-radius: 5px;
      padding: 3px 10px;
      border: 1px solid;
      margin-bottom: 18px;
      transition: color 0.3s, border-color 0.3s;
    }
    .nr-tag {
      font-size: 2rem;
      font-weight: 900;
      color: #1f2328;
      text-align: center;
      line-height: 1.1;
      letter-spacing: -1px;
      margin-bottom: 28px;
    }
    .nr-captions {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }
    .nr-sentence {
      font-size: 1.1rem;
      color: #6b7280;
      text-align: center;
      line-height: 1.55;
      padding: 8px 12px;
      border-radius: 8px;
      transition: color 0.2s, background 0.2s, transform 0.25s;
      transform: translateY(4px);
      max-width: 400px;
    }
    .nr-sentence.nr-active {
      color: #1f2328;
      background: rgba(37,99,235,0.07);
      border: 1px solid rgba(37,99,235,0.2);
      transform: translateY(0);
      opacity: 1;
      font-weight: 600;
      animation: nr-pulse 2s ease-in-out infinite;
    }
    .nr-sentence.nr-done {
      color: #9ca3af;
      transform: translateY(0);
    }
    @keyframes nr-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.0); }
      50% { box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
    }
    .nr-controls {
      width: 100%;
      max-width: 480px;
      flex-shrink: 0;
      padding: 10px 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .nr-main-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .nr-play-btn {
      background: #7c3aed;
      border: none;
      color: #fff;
      font-size: 1.3rem;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, transform 0.1s;
      flex-shrink: 0;
    }
    .nr-play-btn:hover { background: #6d28d9; }
    .nr-play-btn:active { transform: scale(0.94); }
    .nr-skip-btn {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      min-height: 44px;
      transition: background 0.1s, color 0.1s, border-color 0.1s;
    }
    .nr-skip-btn:hover { color: #1f2328; border-color: #7c3aed; }
    .nr-mute-btn {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      min-height: 44px;
      transition: background 0.1s, color 0.1s, border-color 0.1s;
    }
    .nr-mute-btn:hover { color: #1f2328; border-color: #7c3aed; }
    .nr-mute-btn.nr-muted {
      background: #fffbeb;
      border-color: #d97706;
      color: #92400e;
    }
    .nr-speed-row {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
    }
    .nr-speed-label {
      font-size: 0.65rem;
      color: #6b7280;
      margin-right: 2px;
    }
    .nr-speed-pill {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      color: #57606a;
      padding: 4px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 600;
      min-height: 36px;
      display: flex;
      align-items: center;
      transition: background 0.1s, border-color 0.1s, color 0.1s;
    }
    .nr-speed-pill:hover { border-color: #7c3aed; color: #1f2328; }
    .nr-speed-pill.nr-speed-active {
      background: rgba(124,58,237,0.07);
      border-color: #7c3aed;
      color: #6d28d9;
    }
    .nr-loading {
      color: #6b7280;
      font-size: 0.85rem;
      text-align: center;
      padding: 40px 0;
      animation: nr-blink 1.2s ease-in-out infinite;
    }
    @keyframes nr-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);
  }

  // --- state ---
  const SHAKY_KEY = 'cram_shaky';
  const DECK_POS_KEY = 'cram_deck_pos';

  function getShakyIds() {
    try { return new Set(JSON.parse(localStorage.getItem(SHAKY_KEY) || '[]')); }
    catch { return new Set(); }
  }
  function saveShakyIds(set) {
    localStorage.setItem(SHAKY_KEY, JSON.stringify([...set]));
  }
  function toggleShaky(id) {
    const s = getShakyIds();
    if (s.has(id)) s.delete(id); else s.add(id);
    saveShakyIds(s);
    return s.has(id);
  }

  // --- interleaved reel helper ---
  function fisherYates(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function interleavedReel(cards, opts = {}) {
    const { size, tier1Bias } = opts;

    let pool = [...cards];
    if (tier1Bias) {
      const t1 = pool.filter(c => c.tier === 1);
      const rest = pool.filter(c => c.tier !== 1);
      pool = [...t1, ...rest];
    }

    const buckets = {};
    for (const c of pool) {
      if (!buckets[c.deck]) buckets[c.deck] = [];
      buckets[c.deck].push(c);
    }
    for (const dk in buckets) {
      buckets[dk] = fisherYates(buckets[dk]);
    }

    const result = [];
    let prevDeck = null;

    const nonEmpty = () => Object.values(buckets).filter(b => b.length > 0);

    while (true) {
      const active = nonEmpty();
      if (active.length === 0) break;
      if (size && result.length >= size) break;

      let candidates = active.filter(b => b[0].deck !== prevDeck);
      if (candidates.length === 0) candidates = active;

      candidates.sort((a, b) => b.length - a.length);
      const chosen = candidates[0];
      const card = chosen.shift();
      if (chosen.length === 0) delete buckets[card.deck];
      prevDeck = card.deck;
      result.push(card);
    }

    return result;
  }

  let allCards = [];
  let state = {
    view: 'landing', // 'landing' | 'cram' | 'reel' | 'narrated'
    deckName: '',
    deck: [],
    index: 0,
    revealed: false,
    shuffled: false,
    autoCram: false,
    autoPaused: false,
    autoPhase: 'reveal',
    autoTimer: null,
    autoFillTimer: null,
    reelMode: 'short', // 'short' | 'tier1' | 'full'
  };

  // ---- NARRATED AUTO-PLAY STATE ----
  const nr = {
    playing: false,
    muted: false,
    speed: 1.0,
    sentenceIdx: 0,
    sentences: [],
    advanceTimer: null,
    iosResumeInterval: null,
    voicesReady: false,
  };

  function nrGetVoice() {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    // prefer en-US, fall back to any en, then first available
    return (
      voices.find(v => v.lang === 'en-US' && !v.name.includes('Compact')) ||
      voices.find(v => v.lang.startsWith('en-US')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] ||
      null
    );
  }

  function nrSplitSentences(text) {
    if (!text) return [];
    // split on . ! ? followed by space or end, keep delimiter attached
    const raw = text.match(/[^.!?]+[.!?]?/g) || [text];
    return raw.map(s => s.trim()).filter(s => s.length > 0);
  }

  function nrGetScript(card) {
    if (card.script) return card.script;
    return [card.tag, card.move, card.gotcha || ''].filter(Boolean).join('. ');
  }

  function nrCancelSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (nr.advanceTimer) { clearTimeout(nr.advanceTimer); nr.advanceTimer = null; }
    if (nr.iosResumeInterval) { clearInterval(nr.iosResumeInterval); nr.iosResumeInterval = null; }
  }

  function nrHighlightSentence(idx) {
    const els = document.querySelectorAll('.nr-sentence');
    els.forEach((el, i) => {
      el.classList.remove('nr-active', 'nr-done');
      if (i < idx) el.classList.add('nr-done');
      else if (i === idx) el.classList.add('nr-active');
    });
    // scroll active into view
    if (els[idx]) {
      els[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function nrSpeakCard(card, startSentenceIdx) {
    nrCancelSpeech();
    if (!window.speechSynthesis) return;

    const sentences = nrSplitSentences(nrGetScript(card));
    nr.sentences = sentences;
    nr.sentenceIdx = startSentenceIdx || 0;

    if (sentences.length === 0) {
      // nothing to say — just advance after a beat
      nr.advanceTimer = setTimeout(() => nrAdvance(), 2000);
      return;
    }

    // start iOS keep-alive ping (iOS pauses synth after ~15s of inactivity)
    nr.iosResumeInterval = setInterval(() => {
      if (window.speechSynthesis && nr.playing && !nr.muted) {
        window.speechSynthesis.resume();
      }
    }, 10000);

    function speakIdx(i) {
      if (!nr.playing) return;
      if (i >= sentences.length) {
        // done with card, schedule advance
        nr.advanceTimer = setTimeout(() => nrAdvance(), 600);
        return;
      }
      nr.sentenceIdx = i;
      nrHighlightSentence(i);

      const utt = new SpeechSynthesisUtterance(sentences[i]);
      utt.rate = nr.speed;
      utt.pitch = 1;
      const voice = nrGetVoice();
      if (voice) utt.voice = voice;

      utt.onstart = () => {
        nr.sentenceIdx = i;
        nrHighlightSentence(i);
      };
      utt.onend = () => {
        speakIdx(i + 1);
      };
      utt.onerror = (e) => {
        // interrupted is expected on cancel, skip others
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          speakIdx(i + 1);
        }
      };

      window.speechSynthesis.speak(utt);
    }

    speakIdx(nr.sentenceIdx);
  }

  function nrSpeakCardMuted(card) {
    // muted mode: still auto-advance on a ~8s timer per card
    nrCancelSpeech();
    nr.sentences = nrSplitSentences(nrGetScript(card));
    nr.sentenceIdx = 0;
    nrHighlightSentence(0);
    // animate through sentences at roughly 8s / total
    const perSentence = Math.max(1200, 8000 / Math.max(nr.sentences.length, 1));
    function tickMuted(i) {
      if (!nr.playing || !nr.muted) return;
      if (i >= nr.sentences.length) {
        nr.advanceTimer = setTimeout(() => nrAdvance(), 600);
        return;
      }
      nr.sentenceIdx = i;
      nrHighlightSentence(i);
      nr.advanceTimer = setTimeout(() => tickMuted(i + 1), perSentence);
    }
    tickMuted(0);
  }

  function nrStartCard(card) {
    nr.sentenceIdx = 0;
    nr.sentences = nrSplitSentences(nrGetScript(card));
    nrRenderCaptions(card);
    if (nr.muted) {
      nrSpeakCardMuted(card);
    } else {
      nrSpeakCard(card, 0);
    }
  }

  function nrAdvance() {
    if (!nr.playing) return;
    if (state.index < state.deck.length - 1) {
      state.index++;
    } else {
      state.index = 0; // loop
    }
    nrRenderCurrentCard();
    const card = state.deck[state.index];
    nrStartCard(card);
    nrUpdateProgress();
  }

  function nrUpdateProgress() {
    const total = state.deck.length;
    const pct = total > 0 ? ((state.index + 1) / total * 100).toFixed(1) : 0;
    const txt = document.querySelector('.nr-progress-text');
    const bar = document.querySelector('.nr-progress-bar-fill');
    if (txt) txt.textContent = `${state.index + 1} / ${total}`;
    if (bar) bar.style.width = pct + '%';
  }

  function nrRenderCaptions(card) {
    const stage = document.querySelector('.nr-stage');
    if (!stage) return;

    const deckColor = {
      Python: '#1d6fa5', SQL: '#1a7a36', Stats: '#b45309',
      ML: '#6d28d9', Traps: '#b91c1c', Dialect: '#c2410c',
    }[card.deck] || '#6d28d9';

    const sentences = nrSplitSentences(nrGetScript(card));

    const captionsHtml = sentences.map((s, i) =>
      `<div class="nr-sentence" data-idx="${i}">${escHtml(s)}</div>`
    ).join('');

    stage.innerHTML = `
      <div class="nr-deck-badge" style="color:${deckColor};border-color:${deckColor}44;background:${deckColor}11">${escHtml(card.deck)}</div>
      <div class="nr-tag">${escHtml(card.tag)}</div>
      <div class="nr-captions">${captionsHtml}</div>
    `;
  }

  function nrRenderCurrentCard() {
    const card = state.deck[state.index];
    if (!card) return;
    nrRenderCaptions(card);
  }

  function nrPause() {
    nr.playing = false;
    nrCancelSpeech();
    const btn = document.querySelector('.nr-play-btn');
    if (btn) btn.textContent = '▶';
  }

  function nrResume() {
    nr.playing = true;
    const btn = document.querySelector('.nr-play-btn');
    if (btn) btn.textContent = '⏸';
    const card = state.deck[state.index];
    if (card) nrStartCard(card);
  }

  function nrTogglePlay() {
    if (nr.playing) nrPause();
    else nrResume();
  }

  function nrToggleMute() {
    nr.muted = !nr.muted;
    const btn = document.querySelector('.nr-mute-btn');
    if (btn) {
      btn.textContent = nr.muted ? '🔇 Muted' : '🔊 Audio';
      btn.classList.toggle('nr-muted', nr.muted);
    }
    if (nr.playing) {
      const card = state.deck[state.index];
      if (card) nrStartCard(card);
    }
  }

  function nrSetSpeed(s) {
    nr.speed = s;
    document.querySelectorAll('.nr-speed-pill').forEach(el => {
      el.classList.toggle('nr-speed-active', parseFloat(el.dataset.speed) === s);
    });
    // restart current card at new speed
    if (nr.playing) {
      const card = state.deck[state.index];
      if (card) nrStartCard(card);
    }
  }

  function nrSkipPrev() {
    nrCancelSpeech();
    if (state.index > 0) state.index--;
    else state.index = state.deck.length - 1;
    nrRenderCurrentCard();
    nrUpdateProgress();
    if (nr.playing) {
      const card = state.deck[state.index];
      if (card) nrStartCard(card);
    }
  }

  function nrSkipNext() {
    nrCancelSpeech();
    if (state.index < state.deck.length - 1) state.index++;
    else state.index = 0;
    nrRenderCurrentCard();
    nrUpdateProgress();
    if (nr.playing) {
      const card = state.deck[state.index];
      if (card) nrStartCard(card);
    }
  }

  function startNarrated(mode) {
    mode = mode || state.reelMode || 'short';
    const deck = buildReelDeck(mode);
    state = {
      view: 'narrated',
      deckName: 'Narrated',
      deck,
      index: 0,
      revealed: false,
      shuffled: false,
      autoCram: false,
      autoPaused: false,
      autoPhase: 'reveal',
      autoTimer: null,
      autoFillTimer: null,
      reelMode: mode,
    };
    nr.playing = false;
    nr.muted = false;
    nr.speed = 1.0;
    nr.sentenceIdx = 0;
    nr.sentences = [];

    render_();
  }

  function getDeckPos(deckName) {
    try {
      const all = JSON.parse(localStorage.getItem(DECK_POS_KEY) || '{}');
      return all[deckName] || 0;
    } catch { return 0; }
  }
  function saveDeckPos(deckName, idx) {
    try {
      const all = JSON.parse(localStorage.getItem(DECK_POS_KEY) || '{}');
      all[deckName] = idx;
      localStorage.setItem(DECK_POS_KEY, JSON.stringify(all));
    } catch {}
  }

  function buildDeck(deckName) {
    const shaky = getShakyIds();
    let cards;
    if (deckName === 'All') cards = [...allCards];
    else if (deckName === 'Tier-1 Blitz') cards = allCards.filter(c => c.tier === 1);
    else if (deckName === 'Shaky') cards = allCards.filter(c => shaky.has(c.id));
    else cards = allCards.filter(c => c.deck === deckName);
    return cards;
  }

  function startDeck(deckName) {
    let cards = buildDeck(deckName);
    if (cards.length === 0) {
      alert(deckName === 'Shaky' ? 'No shaky cards yet. Mark cards with S while studying.' : 'No cards in this deck.');
      return;
    }
    const savedIdx = getDeckPos(deckName);
    state = {
      view: 'cram',
      deckName,
      deck: cards,
      index: Math.min(savedIdx, cards.length - 1),
      revealed: false,
      shuffled: false,
      autoCram: false,
      autoPaused: false,
      autoPhase: 'reveal',
      autoTimer: null,
      autoFillTimer: null,
      reelMode: state.reelMode,
    };
    render_();
  }

  function buildReelDeck(mode) {
    if (mode === 'tier1') return interleavedReel(allCards.filter(c => c.tier === 1));
    if (mode === 'full') return interleavedReel(allCards);
    return interleavedReel(allCards, { size: 24 });
  }

  function startReel(mode) {
    mode = mode || state.reelMode || 'short';
    const deck = buildReelDeck(mode);
    state = {
      view: 'reel',
      deckName: 'Reel',
      deck,
      index: 0,
      revealed: false,
      shuffled: false,
      autoCram: false,
      autoPaused: false,
      autoPhase: 'reveal',
      autoTimer: null,
      autoFillTimer: null,
      reelMode: mode,
    };
    render_();
  }

  function reveal() {
    if (state.revealed) return;
    state.revealed = true;
    render_();
  }

  function goNext() {
    stopAuto();
    if (state.index < state.deck.length - 1) {
      state.index++;
      state.revealed = false;
      saveDeckPos(state.deckName, state.index);
      render_();
      if (state.autoCram && !state.autoPaused) startAutoTimer();
    } else {
      state.revealed = false;
      state.index = 0;
      saveDeckPos(state.deckName, 0);
      render_();
      if (state.autoCram && !state.autoPaused) startAutoTimer();
    }
  }

  function goPrev() {
    stopAuto();
    if (state.index > 0) {
      state.index--;
      state.revealed = false;
      saveDeckPos(state.deckName, state.index);
      render_();
    }
  }

  function stopAuto() {
    if (state.autoTimer) { clearTimeout(state.autoTimer); state.autoTimer = null; }
    if (state.autoFillTimer) { clearInterval(state.autoFillTimer); state.autoFillTimer = null; }
  }

  function startAutoTimer() {
    stopAuto();
    if (!state.autoCram || state.autoPaused) return;
    state.autoPhase = 'reveal';
    animateFill(4000, () => {
      reveal();
      state.autoPhase = 'advance';
      animateFill(4000, () => {
        goNext();
      });
    });
  }

  function animateFill(duration, cb) {
    const fill = document.querySelector('.cram-auto-fill, .reel-auto-fill');
    if (!fill) { state.autoTimer = setTimeout(cb, duration); return; }
    fill.style.transition = 'none';
    fill.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.transition = `width ${duration}ms linear`;
        fill.style.width = '100%';
      });
    });
    state.autoTimer = setTimeout(cb, duration);
  }

  function toggleShuffle() {
    state.shuffled = !state.shuffled;
    if (state.shuffled) {
      const a = [...state.deck];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      state.deck = a;
    } else {
      state.deck = buildDeck(state.deckName);
    }
    state.index = 0;
    state.revealed = false;
    render_();
  }

  function toggleAutoCram() {
    if (!state.autoCram) {
      state.autoCram = true;
      state.autoPaused = false;
      render_();
      startAutoTimer();
    } else {
      state.autoCram = false;
      state.autoPaused = false;
      stopAuto();
      render_();
    }
  }

  function togglePause() {
    if (!state.autoCram) return;
    if (state.autoPaused) {
      state.autoPaused = false;
      render_();
      startAutoTimer();
    } else {
      state.autoPaused = true;
      stopAuto();
      render_();
    }
  }

  function handleKey(e) {
    if (state.view !== 'cram' && state.view !== 'reel') return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (!container.isConnected) return;
    switch (e.key) {
      case ' ':
      case 'ArrowRight':
        e.preventDefault();
        if (!state.revealed) reveal();
        else goNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        goPrev();
        break;
      case 'ArrowUp':
        if (state.view === 'reel') { e.preventDefault(); goNext(); }
        break;
      case 'ArrowDown':
        if (state.view === 'reel') { e.preventDefault(); goPrev(); }
        break;
      case 'a':
      case 'A':
        toggleAutoCram();
        break;
      case 'f':
      case 'F':
        if (state.view === 'cram') toggleShuffle();
        break;
      case 's':
      case 'S': {
        const card = state.deck[state.index];
        if (card) {
          const isNowShaky = toggleShaky(card.id);
          const badge = document.querySelector('.cram-shaky-badge, .reel-shaky-badge');
          const cardEl = document.querySelector('.cram-card, .reel-card');
          if (isNowShaky) {
            if (cardEl) cardEl.classList.add(state.view === 'reel' ? 'reel-shaky' : 'cram-shaky');
            if (!badge) {
              const b = document.createElement('div');
              b.className = state.view === 'reel' ? 'reel-shaky-badge' : 'cram-shaky-badge';
              b.textContent = 'SHAKY';
              cardEl && cardEl.insertBefore(b, cardEl.firstChild);
            }
          } else {
            if (cardEl) cardEl.classList.remove(state.view === 'reel' ? 'reel-shaky' : 'cram-shaky');
            if (badge) badge.remove();
          }
          const shakyStat = document.querySelector('.cram-shaky-stat');
          if (shakyStat) shakyStat.textContent = getShakyIds().size + ' shaky';
        }
        break;
      }
      case 'p':
      case 'P':
        togglePause();
        break;
    }
  }

  // attach global key listener once
  if (!container._cramKeyBound) {
    document.addEventListener('keydown', handleKey);
    container._cramKeyBound = true;
  }

  function renderLanding() {
    const shaky = getShakyIds();
    const deckNames = ['Python', 'SQL', 'Stats', 'ML', 'Traps', 'Dialect'];
    const specials = [
      { name: 'Tier-1 Blitz', label: 'Tier-1 Blitz', sub: allCards.filter(c => c.tier === 1).length + ' cards' },
      { name: 'All', label: 'All Decks', sub: allCards.length + ' cards' },
      { name: 'Shaky', label: 'Shaky Only', sub: shaky.size + ' cards' },
    ];

    let html = `
      <div class="cram-landing">
        <div class="cram-title">Brainrot Cram</div>
        <div class="cram-subtitle">revive the rusty gears — pick a deck</div>
        <button class="cram-narrated-btn" id="cram-narrated-launch">
          <span style="font-size:1.4rem">▶</span>
          <span>
            <span>Play (narrated)</span>
            <span class="cram-narrated-btn-sub" style="display:block">hands-free, auto-advancing with spoken captions</span>
          </span>
        </button>
        <button class="cram-reel-btn" id="cram-reel-launch">
          <span style="font-size:1.4rem">☰</span>
          <span>
            <span>Shortform Reel</span>
            <span class="cram-reel-btn-sub" style="display:block">24-card mix, category-interleaved, swipe-ready</span>
          </span>
        </button>
        <div class="cram-deck-grid">
    `;

    for (const name of deckNames) {
      const count = allCards.filter(c => c.deck === name).length;
      const t1 = allCards.filter(c => c.deck === name && c.tier === 1).length;
      html += `
        <button class="cram-deck-btn" data-deck="${name}">
          <span class="cram-deck-name">${name}</span>
          <span class="cram-deck-count">${count} cards &middot; ${t1} tier-1</span>
        </button>
      `;
    }

    for (const sp of specials) {
      html += `
        <button class="cram-deck-btn cram-special" data-deck="${sp.name}">
          <span class="cram-deck-name">${sp.label}</span>
          <span class="cram-deck-count">${sp.sub}</span>
        </button>
      `;
    }

    html += `
        </div>
        <div class="cram-keyhints" style="margin-top:32px">
          <span class="cram-keyhint"><kbd>Space</kbd> / <kbd>→</kbd> flip or next</span>
          <span class="cram-keyhint"><kbd>←</kbd> previous</span>
          <span class="cram-keyhint"><kbd>S</kbd> mark shaky</span>
          <span class="cram-keyhint"><kbd>A</kbd> auto-cram</span>
          <span class="cram-keyhint"><kbd>P</kbd> pause</span>
          <span class="cram-keyhint"><kbd>F</kbd> shuffle</span>
        </div>
      </div>
    `;
    container.innerHTML = html;

    document.getElementById('cram-narrated-launch').addEventListener('click', () => startNarrated('short'));
    document.getElementById('cram-reel-launch').addEventListener('click', () => startReel('short'));

    container.querySelectorAll('.cram-deck-btn').forEach(btn => {
      btn.addEventListener('click', () => startDeck(btn.dataset.deck));
    });
  }

  function renderCram() {
    const card = state.deck[state.index];
    const shaky = getShakyIds();
    const isShaky = card && shaky.has(card.id);
    const total = state.deck.length;
    const pct = total > 0 ? ((state.index + 1) / total * 100).toFixed(1) : 0;

    let cardHtml = '';
    if (!card) {
      cardHtml = '<div class="cram-empty">No cards in this deck.</div>';
    } else {
      const skeletonHtml = card.skeleton
        ? `<div class="cram-skeleton">${escHtml(card.skeleton)}</div>`
        : '';
      const exampleHtml = card.example
        ? `<div class="cram-example">${escHtml(card.example)}</div>`
        : '';
      const gotchaHtml = card.gotcha
        ? `<div class="cram-gotcha"><span class="cram-gotcha-label">gotcha:</span> <span>${escHtml(card.gotcha)}</span></div>`
        : '';

      const backHtml = state.revealed ? `
        <div class="cram-divider"></div>
        <div class="cram-move">${escHtml(card.move)}</div>
        ${exampleHtml}
        ${skeletonHtml}
        ${gotchaHtml}
      ` : `<div class="cram-flip-hint">Space or click to reveal</div>`;

      cardHtml = `
        <div class="cram-card${isShaky ? ' cram-shaky' : ''}" id="cram-card-el">
          <span class="cram-card-tier">T${card.tier}</span>
          ${isShaky ? '<div class="cram-shaky-badge">SHAKY</div>' : ''}
          <div class="cram-card-tag">${escHtml(card.tag)}</div>
          <div class="cram-card-trigger"><strong>when:</strong> ${escHtml(card.trigger)}</div>
          ${backHtml}
        </div>
      `;
    }

    const autoLabel = state.autoCram
      ? (state.autoPaused ? 'Auto: paused' : 'Auto: on')
      : 'Auto (A)';
    const shuffleLabel = state.shuffled ? 'Shuffle: on' : 'Shuffle (F)';

    const html = `
      <div class="cram-view">
        <div class="cram-topbar">
          <button class="cram-back-btn" id="cram-back">← decks</button>
          <span class="cram-deck-label">${escHtml(state.deckName)}</span>
          <span class="cram-shaky-stat" style="font-size:0.75rem;color:#57606a;margin-left:4px">${shaky.size} shaky</span>
          <span class="cram-progress">${state.index + 1} / ${total}</span>
        </div>
        <div class="cram-progress-bar-wrap">
          <div class="cram-progress-bar" style="width:${pct}%"></div>
        </div>
        ${cardHtml}
        <div class="cram-controls">
          <button class="cram-ctrl-btn" id="cram-prev">← Prev</button>
          <button class="cram-ctrl-btn" id="cram-next">${state.revealed ? 'Next →' : 'Reveal'}</button>
          <button class="cram-ctrl-btn${state.shuffled ? ' cram-active' : ''}" id="cram-shuffle">${shuffleLabel}</button>
          <button class="cram-ctrl-btn${state.autoCram ? (state.autoPaused ? ' cram-active' : ' cram-active') : ''}" id="cram-auto">${autoLabel}</button>
          <button class="cram-ctrl-btn${isShaky ? ' cram-shaky-active' : ''}" id="cram-shaky">Mark shaky (S)</button>
        </div>
        ${state.autoCram ? `<div class="cram-auto-progress"><div class="cram-auto-fill"></div></div>` : ''}
        <div class="cram-keyhints">
          <span class="cram-keyhint"><kbd>Space</kbd>/<kbd>→</kbd> flip/next</span>
          <span class="cram-keyhint"><kbd>←</kbd> back</span>
          <span class="cram-keyhint"><kbd>S</kbd> shaky</span>
          <span class="cram-keyhint"><kbd>A</kbd> auto</span>
          <span class="cram-keyhint"><kbd>P</kbd> pause</span>
          <span class="cram-keyhint"><kbd>F</kbd> shuffle</span>
        </div>
      </div>
    `;
    container.innerHTML = html;

    document.getElementById('cram-back').addEventListener('click', () => {
      stopAuto();
      state.view = 'landing';
      render_();
    });

    const cardEl = document.getElementById('cram-card-el');
    if (cardEl) {
      cardEl.addEventListener('click', () => {
        if (!state.revealed) reveal();
        else goNext();
      });
    }

    document.getElementById('cram-prev').addEventListener('click', goPrev);
    document.getElementById('cram-next').addEventListener('click', () => {
      if (!state.revealed) reveal();
      else goNext();
    });
    document.getElementById('cram-shuffle').addEventListener('click', toggleShuffle);
    document.getElementById('cram-auto').addEventListener('click', toggleAutoCram);
    document.getElementById('cram-shaky').addEventListener('click', () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
    });

    if (state.autoCram && !state.autoPaused) {
      const fill = document.querySelector('.cram-auto-fill');
      if (fill) {
        fill.style.transition = 'none';
        fill.style.width = '0%';
      }
    }
  }

  function renderReel() {
    const card = state.deck[state.index];
    const shaky = getShakyIds();
    const isShaky = card && shaky.has(card.id);
    const total = state.deck.length;
    const pct = total > 0 ? ((state.index + 1) / total * 100).toFixed(1) : 0;

    const modeLabels = { short: 'Short (~24)', tier1: 'Tier-1', full: 'Full' };

    let cardInner = '';
    if (!card) {
      cardInner = '<div class="cram-empty">No cards.</div>';
    } else {
      const deckColor = {
        Python: '#1d6fa5', SQL: '#1a7a36', Stats: '#b45309',
        ML: '#6d28d9', Traps: '#b91c1c', Dialect: '#c2410c',
      }[card.deck] || '#6d28d9';

      const skeletonHtml = card.skeleton
        ? `<div class="reel-skeleton">${escHtml(card.skeleton)}</div>` : '';
      const exampleHtml = card.example
        ? `<div class="reel-example">${escHtml(card.example)}</div>` : '';
      const gotchaHtml = card.gotcha
        ? `<div class="reel-gotcha"><span class="reel-gotcha-label">gotcha:</span> <span>${escHtml(card.gotcha)}</span></div>` : '';

      const backHtml = state.revealed ? `
        <div class="reel-divider"></div>
        <div class="reel-move">${escHtml(card.move)}</div>
        ${exampleHtml}
        ${skeletonHtml}
        ${gotchaHtml}
      ` : `<div class="reel-flip-hint">tap to reveal</div>`;

      cardInner = `
        <div class="reel-deck-tag">
          <span class="reel-deck-badge" style="color:${deckColor};border-color:${deckColor}33;background:${deckColor}11">${escHtml(card.deck)}</span>
        </div>
        <span class="reel-tier-badge">T${card.tier}</span>
        ${isShaky ? '<div class="reel-shaky-badge">SHAKY</div>' : ''}
        <div class="reel-card-tag">${escHtml(card.tag)}</div>
        <div class="reel-card-trigger"><strong>when:</strong> ${escHtml(card.trigger)}</div>
        ${backHtml}
      `;
    }

    const autoLabel = state.autoCram
      ? (state.autoPaused ? 'Auto: paused' : 'Auto: on') : 'Auto (A)';

    const pillsHtml = Object.entries(modeLabels).map(([m, label]) =>
      `<button class="reel-pill${state.reelMode === m ? ' reel-pill-active' : ''}" data-reel-mode="${m}">${label}</button>`
    ).join('');

    const html = `
      <div class="reel-root" id="reel-root">
        <div class="reel-topbar">
          <button class="reel-back" id="reel-back">← back</button>
          <div class="reel-pills">${pillsHtml}</div>
          <button class="reel-reshuffle" id="reel-reshuffle">↺ Reshuffle</button>
        </div>
        <div class="reel-progress-wrap">
          <div class="reel-progress-text">${state.index + 1} / ${total}</div>
          <div class="reel-progress-bar-bg">
            <div class="reel-progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="reel-card-area">
          <div class="reel-card${isShaky ? ' reel-shaky' : ''}" id="reel-card-el">
            ${cardInner}
          </div>
        </div>
        ${state.autoCram ? `<div class="reel-auto-fill-bar"><div class="reel-auto-fill"></div></div>` : ''}
        <div class="reel-controls">
          <button class="reel-ctrl-btn" id="reel-prev">← Prev</button>
          <button class="reel-ctrl-btn" id="reel-next">${state.revealed ? 'Next →' : 'Reveal'}</button>
          <button class="reel-ctrl-btn${state.autoCram ? ' reel-active' : ''}" id="reel-auto">${autoLabel}</button>
          <button class="reel-ctrl-btn${isShaky ? ' reel-shaky-active' : ''}" id="reel-shaky">Shaky (S)</button>
          <span class="reel-swipe-hint">swipe up = next, swipe down = prev</span>
        </div>
      </div>
    `;
    container.innerHTML = html;

    document.getElementById('reel-back').addEventListener('click', () => {
      stopAuto();
      state.view = 'landing';
      render_();
    });

    container.querySelectorAll('[data-reel-mode]').forEach(btn => {
      btn.addEventListener('click', () => startReel(btn.dataset.reelMode));
    });

    document.getElementById('reel-reshuffle').addEventListener('click', () => startReel(state.reelMode));

    const cardEl = document.getElementById('reel-card-el');
    if (cardEl) {
      cardEl.addEventListener('click', () => {
        if (!state.revealed) reveal();
        else goNext();
      });

      let touchStartY = 0;
      cardEl.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });
      cardEl.addEventListener('touchend', e => {
        const dy = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(dy) > 25) {
          if (dy > 0) goNext();
          else goPrev();
        }
      }, { passive: true });
    }

    document.getElementById('reel-prev').addEventListener('click', goPrev);
    document.getElementById('reel-next').addEventListener('click', () => {
      if (!state.revealed) reveal();
      else goNext();
    });
    document.getElementById('reel-auto').addEventListener('click', toggleAutoCram);
    document.getElementById('reel-shaky').addEventListener('click', () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
    });

    if (state.autoCram && !state.autoPaused) {
      const fill = document.querySelector('.reel-auto-fill');
      if (fill) {
        fill.style.transition = 'none';
        fill.style.width = '0%';
      }
    }
  }

  function renderNarrated() {
    const card = state.deck[state.index];
    const total = state.deck.length;
    const pct = total > 0 ? ((state.index + 1) / total * 100).toFixed(1) : 0;

    const speedOptions = [0.8, 1.0, 1.25, 1.5];

    const speedPillsHtml = speedOptions.map(s =>
      `<button class="nr-speed-pill${nr.speed === s ? ' nr-speed-active' : ''}" data-speed="${s}">${s}x</button>`
    ).join('');

    let stageHtml = '';
    if (!card) {
      stageHtml = '<div class="nr-loading">No cards loaded.</div>';
    } else {
      const deckColor = {
        Python: '#1d6fa5', SQL: '#1a7a36', Stats: '#b45309',
        ML: '#6d28d9', Traps: '#b91c1c', Dialect: '#c2410c',
      }[card.deck] || '#6d28d9';

      const sentences = nrSplitSentences(nrGetScript(card));
      const captionsHtml = sentences.map((s, i) =>
        `<div class="nr-sentence" data-idx="${i}">${escHtml(s)}</div>`
      ).join('');

      stageHtml = `
        <div class="nr-deck-badge" style="color:${deckColor};border-color:${deckColor}44;background:${deckColor}11">${escHtml(card.deck)}</div>
        <div class="nr-tag">${escHtml(card.tag)}</div>
        <div class="nr-captions">${captionsHtml}</div>
      `;
    }

    const html = `
      <div class="nr-root" id="nr-root">
        <div class="nr-topbar">
          <button class="nr-back" id="nr-back">← back</button>
          <div class="nr-progress-text">${state.index + 1} / ${total}</div>
        </div>
        <div class="nr-progress-bar-bg">
          <div class="nr-progress-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="nr-stage" id="nr-stage">
          ${stageHtml}
        </div>
        <div class="nr-controls">
          <div class="nr-main-controls">
            <button class="nr-skip-btn" id="nr-prev">⏮ Prev</button>
            <button class="nr-play-btn" id="nr-play">▶</button>
            <button class="nr-skip-btn" id="nr-next">Next ⏭</button>
            <button class="nr-mute-btn${nr.muted ? ' nr-muted' : ''}" id="nr-mute">${nr.muted ? '🔇 Muted' : '🔊 Audio'}</button>
          </div>
          <div class="nr-speed-row">
            <span class="nr-speed-label">speed</span>
            ${speedPillsHtml}
          </div>
        </div>
      </div>
    `;
    container.innerHTML = html;

    // back — cancel speech before leaving
    document.getElementById('nr-back').addEventListener('click', () => {
      nrCancelSpeech();
      nr.playing = false;
      state.view = 'landing';
      render_();
    });

    // play/pause — THIS IS THE USER GESTURE THAT UNLOCKS iOS SPEECH
    document.getElementById('nr-play').addEventListener('click', () => {
      nrTogglePlay();
    });

    document.getElementById('nr-prev').addEventListener('click', () => nrSkipPrev());
    document.getElementById('nr-next').addEventListener('click', () => nrSkipNext());
    document.getElementById('nr-mute').addEventListener('click', () => nrToggleMute());

    container.querySelectorAll('.nr-speed-pill').forEach(btn => {
      btn.addEventListener('click', () => nrSetSpeed(parseFloat(btn.dataset.speed)));
    });
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render_() {
    if (!container.classList.contains('cram-root')) {
      container.classList.add('cram-root');
    }
    // cancel speech whenever we navigate away from narrated view
    if (state.view !== 'narrated') {
      nrCancelSpeech();
      nr.playing = false;
    }
    if (state.view === 'landing') {
      renderLanding();
    } else if (state.view === 'reel') {
      renderReel();
    } else if (state.view === 'narrated') {
      renderNarrated();
    } else {
      renderCram();
    }
  }

  // prime voices async (required on some browsers/iOS)
  if (window.speechSynthesis) {
    const loadVoices = () => { nr.voicesReady = true; };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    if (window.speechSynthesis.getVoices().length > 0) loadVoices();
  }

  // kill narration + auto-timers if the user leaves the cram route via the top
  // nav (render_ only fires on internal cram nav). Rebind each mount so the
  // handler always references the current closure's state.
  if (container._cramRouteHandler) {
    window.removeEventListener('hashchange', container._cramRouteHandler);
  }
  container._cramRouteHandler = () => {
    if (!location.hash.startsWith('#/cram')) {
      nrCancelSpeech();
      nr.playing = false;
      if (typeof stopAuto === 'function') stopAuto();
      window.removeEventListener('hashchange', container._cramRouteHandler);
      container._cramRouteHandler = null;
    }
  };
  window.addEventListener('hashchange', container._cramRouteHandler);

  // fetch data and boot
  fetch('data/bank/brainrot.json')
    .then(r => {
      if (!r.ok) throw new Error('Failed to load brainrot.json: ' + r.status);
      return r.json();
    })
    .then(data => {
      allCards = data;
      container.classList.add('cram-root');
      render_();
    })
    .catch(err => {
      container.classList.add('cram-root');
      container.innerHTML = `<div class="cram-empty" style="color:#f85149">Error loading cards: ${escHtml(err.message)}</div>`;
    });
}
