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
          {widthA > 15 && (
            <span className="bar-label bar-label-a">{percentA}% · {countA.toLocaleString()}표</span>
          )}
        </div>
        <div className="split-fill split-b" style={{ width: `${widthB}%` }}>
          {widthB > 15 && (
            <span className="bar-label bar-label-b">{percentB}% · {countB.toLocaleString()}표</span>
          )}
        </div>
      </div>
      <p className="result-total">총 {total.toLocaleString()}명 참여</p>
    </>
  );
}
