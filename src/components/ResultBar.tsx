'use client';

import { useState, useEffect } from 'react';

interface ResultBarProps {
  optionA: string;
  optionB: string;
  percentA: number;
  percentB: number;
  countA: number;
  countB: number;
  total: number;
}

export default function ResultBar({ percentA, percentB, countA, countB, total }: ResultBarProps) {
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
        <div className="split-fill split-a" style={{ width: `${widthA}%` }}>
          {widthA > 12 && <span className="bar-label bar-label-a">{percentA}%</span>}
        </div>
        <div className="split-fill split-b" style={{ width: `${widthB}%` }}>
          {widthB > 12 && <span className="bar-label bar-label-b">{percentB}%</span>}
        </div>
      </div>
      <div className="result-counts">
        <span className="result-count-a">{countA.toLocaleString()}표</span>
        <span className="result-count-b">{countB.toLocaleString()}표</span>
      </div>
      <p className="result-total">총 {total.toLocaleString()}명 참여</p>
    </>
  );
}
