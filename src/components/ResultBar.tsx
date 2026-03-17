'use client';

import { useState, useEffect } from 'react';

interface ResultBarProps {
  percentA: number;
  percentB: number;
  total: number;
}

export default function ResultBar({ percentA, percentB, total }: ResultBarProps) {
  const [widthA, setWidthA] = useState(0);
  const [widthB, setWidthB] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidthA(percentA);
      setWidthB(percentB);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentA, percentB]);

  return (
    <>
      <div className="result-split-bar">
        <div
          className="split-fill split-a"
          style={{ width: `${widthA}%` }}
        />
        <div
          className="split-fill split-b"
          style={{ width: `${widthB}%` }}
        />
      </div>
      <p className="result-total">총 {total.toLocaleString()}명 참여</p>
    </>
  );
}
