'use client';

import { useRef, useEffect, createContext, useContext } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { WeatherType, TimePhase } from '@/types';

const WeatherReadyCtx = createContext(false);
export const useWeatherReady = () => useContext(WeatherReadyCtx);

export default function WeatherCanvas({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { weatherType, timePhase, ready } = useWeather();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: unknown[] = [];
    let animFrameId: number | null = null;
    let sceneTime = 0;
    let stars: { x: number; y: number; r: number; twinkle: number; speed: number }[] | null = null;
    let sceneGroundRatio = 0.80; // 각 scene이 설정하는 ground 위치 비율
    let sceneIsSnow = false;

    const currentTimePhase: TimePhase = timePhase;

    function resizeCanvas() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function ensureStars() {
      if (stars) return;
      stars = Array.from({ length: 160 }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height * 0.65,
        r: Math.random() * 1.4 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
      }));
    }

    function drawGlow(x: number, y: number, r: number, color: string, alpha: number) {
      const g = ctx!.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color.replace('__A__', String(alpha)));
      g.addColorStop(0.5, color.replace('__A__', String(alpha * 0.4)));
      g.addColorStop(1, color.replace('__A__', '0'));
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawNightOverlay() {
      if (currentTimePhase !== 'night' && currentTimePhase !== 'dusk' && currentTimePhase !== 'dawn') return;
      const W = canvas!.width, H = canvas!.height;
      const t = sceneTime;

      if (currentTimePhase === 'night') {
        ensureStars();
        for (const s of stars!) {
          const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.twinkle);
          ctx!.save();
          ctx!.globalAlpha = (0.4 + 0.5 * twinkle) * 0.9;
          ctx!.fillStyle = '#fff';
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        }

        const mx = W * 0.78, my = H * 0.1;
        ctx!.save();
        ctx!.fillStyle = 'rgba(240,235,210,0.88)';
        ctx!.shadowColor = 'rgba(220,215,180,0.5)';
        ctx!.shadowBlur = 30;
        ctx!.beginPath();
        ctx!.arc(mx, my, 28, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();

        drawGlow(mx, my, 120, 'rgba(200,200,160,__A__)', 0.06);
      }

      if (currentTimePhase === 'dusk') {
        // 저녁 달 — 단순 동그란 달
        const mx = W * 0.2, my = H * 0.1;
        ctx!.save();
        ctx!.fillStyle = 'rgba(240,235,210,0.88)';
        ctx!.shadowColor = 'rgba(220,215,180,0.5)';
        ctx!.shadowBlur = 30;
        ctx!.beginPath();
        ctx!.arc(mx, my, 28, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
        drawGlow(mx, my, 120, 'rgba(200,200,160,__A__)', 0.06);
      }

      if (currentTimePhase === 'dawn' || currentTimePhase === 'dusk') {
        const isDawn = currentTimePhase === 'dawn';
        const hx = isDawn ? W * 0.25 : W * 0.75;
        const groundY = H * sceneGroundRatio;
        const sunR = Math.min(W, H) * 0.065;

        // 지는/뜨는 태양 — 눈 scene은 ground가 덮으므로 클립 없이, 나머지는 반원 클립
        ctx!.save();
        if (!sceneIsSnow) {
          ctx!.beginPath();
          ctx!.rect(0, 0, W, groundY);
          ctx!.clip();
        }
        ctx!.shadowColor = isDawn ? '#ffcc44' : '#ff5500';
        ctx!.shadowBlur = 50;
        ctx!.fillStyle = isDawn ? 'rgba(255,200,80,0.92)' : 'rgba(255,110,30,0.92)';
        ctx!.beginPath();
        ctx!.arc(hx, groundY, sunR, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();

        // 노을빛 — 화면 바닥에서 위로 번짐
        const c1 = isDawn ? 'rgba(255,160,80,__A__)' : 'rgba(255,80,40,__A__)';
        const c2 = isDawn ? 'rgba(200,100,160,__A__)' : 'rgba(160,40,100,__A__)';
        drawGlow(hx, H, W * 0.7, c1, 0.28);
        drawGlow(hx, H, W * 0.4, c2, 0.18);
      }
    }

    function drawGround(color: string, alpha: number, yRatio = 0.82) {
      const y = canvas!.height * yRatio;
      const grad = ctx!.createLinearGradient(0, y, 0, canvas!.height);
      grad.addColorStop(0, color.replace('__A__', String(alpha)));
      grad.addColorStop(1, color.replace('__A__', String(alpha * 0.4)));
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, y, canvas!.width, canvas!.height - y);
    }

    function drawPersonUmbrella(x: number, y: number, scale: number, alpha: number) {
      ctx!.save();
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = '#000';
      ctx!.strokeStyle = '#000';
      const s = scale;

      ctx!.beginPath();
      ctx!.arc(x, y - s * 38, s * 22, Math.PI, 0, false);
      ctx!.lineTo(x + s * 22, y - s * 38);
      ctx!.fill();

      ctx!.lineWidth = s * 1.2;
      for (let i = -2; i <= 2; i++) {
        ctx!.beginPath();
        ctx!.moveTo(x, y - s * 38);
        ctx!.lineTo(x + i * s * 10.5, y - s * 16);
        ctx!.stroke();
      }

      ctx!.lineWidth = s * 2;
      ctx!.beginPath();
      ctx!.moveTo(x, y - s * 16);
      ctx!.lineTo(x, y - s * 2);
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(x, y - s * 34 + s * 10, s * 5, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.lineWidth = s * 3;
      ctx!.beginPath();
      ctx!.moveTo(x, y - s * 24);
      ctx!.lineTo(x, y - s * 10);
      ctx!.stroke();

      ctx!.lineWidth = s * 2.5;
      ctx!.beginPath();
      ctx!.moveTo(x, y - s * 10);
      ctx!.lineTo(x - s * 5, y);
      ctx!.moveTo(x, y - s * 10);
      ctx!.lineTo(x + s * 5, y);
      ctx!.stroke();

      ctx!.restore();
    }


    function drawBareTree(x: number, y: number, scale: number, alpha: number) {
      ctx!.save();
      ctx!.globalAlpha = alpha;
      ctx!.strokeStyle = '#000';
      ctx!.lineWidth = scale * 4;
      ctx!.lineCap = 'round';
      const s = scale;

      ctx!.beginPath();
      ctx!.moveTo(x, y);
      ctx!.lineTo(x, y - s * 50);
      ctx!.stroke();

      const branches: [number, number, number, number][] = [
        [x, y - s * 32, x - s * 20, y - s * 50],
        [x, y - s * 32, x + s * 18, y - s * 48],
        [x, y - s * 20, x - s * 14, y - s * 35],
        [x, y - s * 20, x + s * 12, y - s * 33],
      ];
      ctx!.lineWidth = scale * 2;
      for (const [x1, y1, x2, y2] of branches) {
        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawSnowman(x: number, y: number, scale: number, alpha: number) {
      ctx!.save();
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = 'rgba(220,235,245,0.9)';
      ctx!.strokeStyle = 'rgba(150,170,190,0.6)';
      ctx!.lineWidth = scale * 1.5;
      const s = scale;

      ctx!.beginPath();
      ctx!.arc(x, y - s * 18, s * 18, 0, Math.PI * 2);
      ctx!.fill(); ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(x, y - s * 46, s * 13, 0, Math.PI * 2);
      ctx!.fill(); ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(x, y - s * 66, s * 9, 0, Math.PI * 2);
      ctx!.fill(); ctx!.stroke();

      ctx!.fillStyle = 'rgba(50,60,80,0.8)';
      ctx!.beginPath(); ctx!.arc(x - s * 3, y - s * 68, s * 1.5, 0, Math.PI * 2); ctx!.fill();
      ctx!.beginPath(); ctx!.arc(x + s * 3, y - s * 68, s * 1.5, 0, Math.PI * 2); ctx!.fill();

      ctx!.fillStyle = 'rgba(220,100,30,0.8)';
      ctx!.beginPath(); ctx!.moveTo(x, y - s * 65); ctx!.lineTo(x + s * 8, y - s * 66); ctx!.lineTo(x, y - s * 67); ctx!.fill();

      ctx!.restore();
    }

    function drawBird(x: number, y: number, size: number, alpha: number) {
      ctx!.save();
      ctx!.globalAlpha = alpha;
      ctx!.strokeStyle = 'rgba(30,30,50,0.7)';
      ctx!.lineWidth = size * 1.2;
      ctx!.lineCap = 'round';
      ctx!.beginPath();
      ctx!.moveTo(x - size * 5, y - size * 2);
      ctx!.quadraticCurveTo(x, y, x + size * 5, y - size * 2);
      ctx!.stroke();
      ctx!.restore();
    }


    function drawRoundTree(x: number, y: number, scale: number, alpha: number) {
      ctx!.save();
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = 'rgba(40,80,30,0.8)';
      const s = scale;

      ctx!.fillRect(x - s * 4, y - s * 32, s * 8, s * 32);

      ctx!.fillStyle = 'rgba(50,100,40,0.75)';
      ctx!.beginPath(); ctx!.arc(x, y - s * 44, s * 20, 0, Math.PI * 2); ctx!.fill();
      ctx!.beginPath(); ctx!.arc(x - s * 12, y - s * 36, s * 15, 0, Math.PI * 2); ctx!.fill();
      ctx!.beginPath(); ctx!.arc(x + s * 12, y - s * 36, s * 15, 0, Math.PI * 2); ctx!.fill();

      ctx!.restore();
    }

    function drawSoftCloud(cx: number, cy: number, r: number, alpha: number, offset: number) {
      ctx!.save();
      ctx!.fillStyle = `rgba(255,255,255,${alpha})`;
      const x = cx + offset * 20;
      ctx!.beginPath();
      ctx!.arc(x, cy, r, 0, Math.PI * 2);
      ctx!.arc(x + r, cy - r * 0.3, r * 0.7, 0, Math.PI * 2);
      ctx!.arc(x + r * 1.7, cy, r * 0.8, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    }

    function makeRaindrops(count: number) {
      return Array.from({ length: count }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        len: Math.random() * 14 + 8,
        speed: Math.random() * 9 + 7,
        wx: Math.random() * 1.2 - 0.4,
      }));
    }

    function makeSnowflakes(count: number) {
      return Array.from({ length: count }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        r: Math.random() * 3 + 1,
        speed: Math.random() * 1.2 + 0.4,
        angle: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.4,
      }));
    }

    function sceneRain() {
      particles = makeRaindrops(180);
      sceneGroundRatio = 0.83;
      const W = canvas!.width, H = canvas!.height;

      const groundY = H * 0.83;
      const trees = [
        { x: W * 0.06, scale: 0.65, alpha: 0.28 },
        { x: W * 0.15, scale: 0.85, alpha: 0.33 },
        { x: W * 0.82, scale: 0.8, alpha: 0.32 },
        { x: W * 0.93, scale: 0.6, alpha: 0.25 },
      ];

      function draw() {
        ctx!.clearRect(0, 0, W, H);
        sceneTime++;
        drawNightOverlay();

        const grd = ctx!.createLinearGradient(0, groundY, 0, H);
        grd.addColorStop(0, 'rgba(20,35,50,0.55)');
        grd.addColorStop(1, 'rgba(20,35,50,0.2)');
        ctx!.fillStyle = grd;
        ctx!.fillRect(0, groundY, W, H - groundY);

        for (const t of trees) drawRoundTree(t.x, groundY, t.scale, t.alpha);

        ctx!.save();
        ctx!.strokeStyle = 'rgba(174,214,241,0.45)';
        ctx!.lineWidth = 0.9;
        for (const p of particles as { x: number; y: number; len: number; speed: number; wx: number }[]) {
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x + p.wx * 6, p.y + p.len);
          ctx!.stroke();
          p.x += p.wx; p.y += p.speed;
          if (p.y > H) { p.y = -p.len; p.x = Math.random() * W; }
        }
        ctx!.restore();

        animFrameId = requestAnimationFrame(draw);
      }
      draw();
    }

    function sceneThunder() {
      particles = makeRaindrops(230);
      sceneGroundRatio = 0.83;
      const W = canvas!.width, H = canvas!.height;
      const groundY = H * 0.83;
      let lightningCooldown = 200;
      let flashAlpha = 0;
      let boltPoints: { x: number; y: number }[] | null = null;

      const people = [
        { x: W * 0.2, scale: 0.7, alpha: 0.32 },
        { x: W * 0.55, scale: 0.9, alpha: 0.45 },
        { x: W * 0.85, scale: 0.6, alpha: 0.28 },
      ];

      function makeBolt() {
        const pts: { x: number; y: number }[] = [{ x: W * (0.3 + Math.random() * 0.4), y: 0 }];
        let y = 0;
        while (y < H * 0.65) {
          y += 20 + Math.random() * 35;
          pts.push({ x: pts[pts.length - 1].x + (Math.random() * 60 - 30), y });
        }
        return pts;
      }

      function draw() {
        ctx!.clearRect(0, 0, W, H);
        sceneTime++;
        drawNightOverlay();

        const grd = ctx!.createLinearGradient(0, groundY, 0, H);
        grd.addColorStop(0, 'rgba(5,10,20,0.7)');
        grd.addColorStop(1, 'rgba(5,10,20,0.3)');
        ctx!.fillStyle = grd;
        ctx!.fillRect(0, groundY, W, H - groundY);

        if (flashAlpha > 0) {
          ctx!.save();
          ctx!.fillStyle = `rgba(200,220,255,${flashAlpha})`;
          ctx!.fillRect(0, 0, W, H);
          flashAlpha = Math.max(0, flashAlpha - 0.04);
          ctx!.restore();
        }

        lightningCooldown--;
        if (lightningCooldown <= 0 && Math.random() < 0.03) {
          boltPoints = makeBolt();
          flashAlpha = 0.25;
          lightningCooldown = 150 + Math.random() * 200;
        }
        if (boltPoints) {
          ctx!.save();
          ctx!.strokeStyle = 'rgba(200,230,255,0.95)';
          ctx!.lineWidth = 2.5;
          ctx!.shadowColor = '#aaddff';
          ctx!.shadowBlur = 14;
          ctx!.beginPath();
          boltPoints.forEach((p, i) => i === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y));
          ctx!.stroke();
          ctx!.restore();
          if (flashAlpha <= 0) boltPoints = null;
        }

        for (const p of people) drawPersonUmbrella(p.x, groundY, p.scale, p.alpha);

        ctx!.save();
        ctx!.strokeStyle = 'rgba(140,180,220,0.5)';
        ctx!.lineWidth = 1;
        for (const p of particles as { x: number; y: number; len: number; speed: number; wx: number }[]) {
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x + p.wx * 7, p.y + p.len);
          ctx!.stroke();
          p.x += p.wx * 1.4; p.y += p.speed * 1.2;
          if (p.y > H) { p.y = -p.len; p.x = Math.random() * W; }
        }
        ctx!.restore();

        animFrameId = requestAnimationFrame(draw);
      }
      draw();
    }

    function sceneSnow() {
      particles = makeSnowflakes(130);
      sceneGroundRatio = 0.82;
      sceneIsSnow = true;
      const W = canvas!.width, H = canvas!.height;
      const groundY = H * 0.82;

      const trees = [
        { x: W * 0.08, scale: 0.55, alpha: 0.22 },
        { x: W * 0.9, scale: 0.6, alpha: 0.24 },
        { x: W * 0.18, scale: 0.8, alpha: 0.30 },
        { x: W * 0.78, scale: 0.85, alpha: 0.32 },
      ];

      function draw() {
        ctx!.clearRect(0, 0, W, H);
        sceneTime++;

        // 노을/새벽은 바닥보다 먼저 그려서 눈 지형이 태양 위에 실루엣처럼 덮히게
        drawNightOverlay();

        ctx!.save();
        const grd = ctx!.createLinearGradient(0, groundY - 10, 0, H);
        grd.addColorStop(0, 'rgba(230,240,250,1)');
        grd.addColorStop(0.3, 'rgba(210,225,240,1)');
        grd.addColorStop(1, 'rgba(200,218,235,1)');
        ctx!.fillStyle = grd;

        ctx!.beginPath();
        ctx!.moveTo(0, groundY);
        for (let x = 0; x <= W; x += 30) {
          const bump = Math.sin(x * 0.015 + sceneTime * 0.002) * 5 + Math.sin(x * 0.04) * 4;
          x === 0 ? ctx!.moveTo(x, groundY + bump) : ctx!.lineTo(x, groundY + bump);
        }
        ctx!.lineTo(W, H); ctx!.lineTo(0, H); ctx!.closePath();
        ctx!.fill();
        ctx!.restore();

        for (const t of trees) drawBareTree(t.x, groundY, t.scale, t.alpha);

        drawSnowman(W * 0.58, groundY, 0.9, 0.55);

        ctx!.save();
        ctx!.fillStyle = 'rgba(255,255,255,0.88)';
        for (const p of particles as { x: number; y: number; r: number; speed: number; angle: number; drift: number }[]) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fill();
          p.x += Math.sin(p.angle) * p.drift + p.drift;
          p.y += p.speed;
          p.angle += 0.008;
          if (p.y > groundY) { p.y = -p.r * 2; p.x = Math.random() * W; }
        }
        ctx!.restore();
        animFrameId = requestAnimationFrame(draw);
      }
      draw();
    }

    function sceneClear() {
      const W = canvas!.width, H = canvas!.height;
      const groundY = H * 0.8;

      const birds = Array.from({ length: 7 }, () => ({
        x: Math.random() * W,
        y: H * 0.05 + Math.random() * H * 0.25,
        size: 1.2 + Math.random() * 1.5,
        speed: 0.3 + Math.random() * 0.5,
        amp: Math.random() * 8,
        freq: 0.02 + Math.random() * 0.02,
        alpha: 0.35 + Math.random() * 0.35,
      }));

      const trees = [
        { x: W * 0.05, scale: 0.6, alpha: 0.25 },
        { x: W * 0.12, scale: 0.9, alpha: 0.3 },
        { x: W * 0.88, scale: 0.85, alpha: 0.3 },
        { x: W * 0.96, scale: 0.55, alpha: 0.22 },
      ];

      function draw() {
        ctx!.clearRect(0, 0, W, H);
        sceneTime++;
        const t = sceneTime * 0.008;

        if (currentTimePhase === 'day') {
          const sx = W * 0.82, sy = H * 0.08;
          drawGlow(sx, sy, W * 0.5, 'rgba(255,240,150,__A__)', 0.14);
          drawGlow(sx, sy, 80, 'rgba(255,255,200,__A__)', 0.55);

          ctx!.save();
          ctx!.fillStyle = 'rgba(255,248,180,0.85)';
          ctx!.beginPath();
          ctx!.arc(sx, sy, 36, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();

          ctx!.save();
          ctx!.strokeStyle = 'rgba(255,240,120,0.25)';
          ctx!.lineWidth = 2;
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 + t;
            ctx!.beginPath();
            ctx!.moveTo(sx + Math.cos(a) * 42, sy + Math.sin(a) * 42);
            ctx!.lineTo(sx + Math.cos(a) * 80, sy + Math.sin(a) * 80);
            ctx!.stroke();
          }
          ctx!.restore();
        }

        drawSoftCloud(W * 0.2, H * 0.12, 60, 0.12, t * 0.3);
        drawSoftCloud(W * 0.6, H * 0.07, 80, 0.1, t * 0.2);

        drawNightOverlay();

        const grd = ctx!.createLinearGradient(0, groundY, 0, H);
        grd.addColorStop(0, 'rgba(100,160,80,0.4)');
        grd.addColorStop(0.4, 'rgba(80,140,60,0.5)');
        grd.addColorStop(1, 'rgba(60,110,40,0.3)');
        ctx!.fillStyle = grd;
        ctx!.fillRect(0, groundY, W, H - groundY);

        for (const tree of trees) drawRoundTree(tree.x, groundY, tree.scale, tree.alpha);

        if (currentTimePhase === 'day' || currentTimePhase === 'dawn' || currentTimePhase === 'dusk') {
          for (const b of birds) {
            b.x += b.speed;
            const by = b.y + Math.sin(sceneTime * b.freq) * b.amp;
            if (b.x > W + 40) b.x = -40;
            drawBird(b.x, by, b.size, b.alpha);
          }
        }

        animFrameId = requestAnimationFrame(draw);
      }
      draw();
    }

    function sceneClouds() {
      sceneGroundRatio = 0.82;
      const W = canvas!.width, H = canvas!.height;

      const clouds = [
        { x: W * 0.05, y: H * 0.08, r: 28, speed: 0.18, alpha: 0.18 },
        { x: W * 0.35, y: H * 0.05, r: 38, speed: 0.14, alpha: 0.15 },
        { x: W * 0.65, y: H * 0.10, r: 32, speed: 0.20, alpha: 0.16 },
        { x: W * 0.80, y: H * 0.06, r: 24, speed: 0.16, alpha: 0.13 },
        { x: W * 0.20, y: H * 0.18, r: 30, speed: 0.12, alpha: 0.12 },
        { x: W * 0.55, y: H * 0.22, r: 26, speed: 0.15, alpha: 0.11 },
      ];

      const trees = [
        { x: W * 0.06, scale: 0.65, alpha: 0.28 },
        { x: W * 0.15, scale: 0.85, alpha: 0.33 },
        { x: W * 0.82, scale: 0.8, alpha: 0.32 },
        { x: W * 0.93, scale: 0.6, alpha: 0.25 },
      ];

      function draw() {
        ctx!.clearRect(0, 0, W, H);
        sceneTime++;

        for (const c of clouds) {
          ctx!.save();
          ctx!.fillStyle = `rgba(255,255,255,${c.alpha})`;
          ctx!.beginPath();
          ctx!.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx!.arc(c.x + c.r * 0.9, c.y - c.r * 0.25, c.r * 0.65, 0, Math.PI * 2);
          ctx!.arc(c.x + c.r * 1.6, c.y, c.r * 0.75, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();

          c.x += c.speed;
          if (c.x > W + c.r * 3) c.x = -c.r * 3;
        }

        drawNightOverlay();
        drawGround('rgba(80,100,120,__A__)', 0.35, 0.82);
        for (const t of trees) drawRoundTree(t.x, H * 0.82, t.scale, t.alpha);
        animFrameId = requestAnimationFrame(draw);
      }
      draw();
    }

    function sceneHeat() {
      const W = canvas!.width, H = canvas!.height;
      const groundY = H * 0.8;

      const heatLines = Array.from({ length: 10 }, (_, i) => ({
        baseY: groundY * 0.45 + i * (groundY * 0.055),
        offset: Math.random() * Math.PI * 2,
      }));

      function draw() {
        ctx!.clearRect(0, 0, W, H);
        sceneTime++;
        const t = sceneTime * 0.025;

        drawNightOverlay();

        const sx = W * 0.5, sy = H * 0.07;
        drawGlow(sx, sy, W * 0.7, 'rgba(255,180,60,__A__)', 0.18);
        drawGlow(sx, sy, 100, 'rgba(255,240,100,__A__)', 0.6);

        ctx!.save();
        ctx!.fillStyle = 'rgba(255,255,180,0.92)';
        ctx!.shadowColor = '#ffdd00';
        ctx!.shadowBlur = 30;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 44, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.strokeStyle = 'rgba(255,220,80,0.35)';
        ctx!.lineWidth = 3;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2 + t;
          ctx!.beginPath();
          ctx!.moveTo(sx + Math.cos(a) * 50, sy + Math.sin(a) * 50);
          ctx!.lineTo(sx + Math.cos(a) * (80 + Math.sin(sceneTime * 0.1 + i) * 10), sy + Math.sin(a) * (80 + Math.sin(sceneTime * 0.1 + i) * 10));
          ctx!.stroke();
        }
        ctx!.restore();

        ctx!.save();
        ctx!.strokeStyle = 'rgba(255,160,60,0.07)';
        ctx!.lineWidth = 2;
        for (const l of heatLines) {
          ctx!.beginPath();
          for (let x = 0; x <= W; x += 6) {
            const y = l.baseY + Math.sin(x * 0.018 + t + l.offset) * 7;
            x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
          }
          ctx!.stroke();
        }
        ctx!.restore();

        ctx!.save();
        ctx!.fillStyle = 'rgba(80,30,10,0.35)';
        const buildings = [
          { x: W * 0.02, w: W * 0.08, h: 90 },
          { x: W * 0.11, w: W * 0.06, h: 130 },
          { x: W * 0.18, w: W * 0.07, h: 70 },
          { x: W * 0.72, w: W * 0.07, h: 100 },
          { x: W * 0.80, w: W * 0.06, h: 140 },
          { x: W * 0.87, w: W * 0.09, h: 80 },
        ];
        for (const b of buildings) {
          ctx!.fillRect(b.x, groundY - b.h, b.w, b.h);
        }
        ctx!.restore();

        const grd = ctx!.createLinearGradient(0, groundY, 0, H);
        grd.addColorStop(0, 'rgba(60,30,10,0.55)');
        grd.addColorStop(1, 'rgba(40,20,5,0.3)');
        ctx!.fillStyle = grd;
        ctx!.fillRect(0, groundY, W, H - groundY);

        ctx!.save();
        const mist = ctx!.createLinearGradient(0, groundY - 20, 0, groundY + 30);
        mist.addColorStop(0, 'rgba(255,140,40,0)');
        mist.addColorStop(0.5, 'rgba(255,140,40,0.06)');
        mist.addColorStop(1, 'rgba(255,140,40,0)');
        ctx!.fillStyle = mist;
        ctx!.fillRect(0, groundY - 20, W, 50);
        ctx!.restore();
        animFrameId = requestAnimationFrame(draw);
      }
      draw();
    }

    resizeCanvas();

    const scenes: Record<WeatherType, () => void> = {
      clear: sceneClear,
      clouds: sceneClouds,
      rain: sceneRain,
      snow: sceneSnow,
      mist: sceneClear,
      heat: sceneHeat,
      thunder: sceneThunder,
    };

    (scenes[weatherType] || sceneClear)();

    const handleResize = () => {
      resizeCanvas();
      stars = null;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameId !== null) cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weatherType, timePhase]);

  return (
    <WeatherReadyCtx.Provider value={ready}>
      <canvas
        ref={canvasRef}
        id="weather-canvas"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </WeatherReadyCtx.Provider>
  );
}
