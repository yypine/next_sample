"use client";

import { useState } from "react";
import styles from "@/app/page.module.css";

// 仮のデータ（後でAPIから取得）
const mockPrefectures = [
  { prefCode: 1, prefName: "北海道" },
  { prefCode: 2, prefName: "青森県" },
  { prefCode: 3, prefName: "岩手県" },
  { prefCode: 4, prefName: "宮城県" },
  { prefCode: 5, prefName: "秋田県" },
  // 5つだけで開始
];

export default function Home() {
  const [selectedPrefectures, setSelectedPrefectures] = useState<number[]>([]);

  const handlePrefectureChange = (prefCode: number) => {
    if (selectedPrefectures.includes(prefCode)) {
      setSelectedPrefectures(selectedPrefectures.filter((code) => code !== prefCode));
    } else {
      setSelectedPrefectures([...selectedPrefectures, prefCode]);
    }
  };

  return (
    <div className={`${styles.page} mainContent`}>
      <main className={styles.main}>
        <h1 className={styles.mainTitle}>都道府県別人口推移グラフ</h1>

        <div>
          <h2 className={styles.subTitle}>都道府県</h2>
          <div className={styles.prefectureList}>
            {mockPrefectures.map((prefecture) => (
              <label key={prefecture.prefCode} className={styles.prefectureItem}>
                <input type="checkbox" checked={selectedPrefectures.includes(prefecture.prefCode)} onChange={() => handlePrefectureChange(prefecture.prefCode)} />
                <span>{prefecture.prefName}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedPrefectures.length > 0 && (
          <div className={styles.selectedInfo}>
            <h3>選択された都道府県:</h3>
            <p>{selectedPrefectures.map((code) => mockPrefectures.find((p) => p.prefCode === code)?.prefName).join(", ")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
