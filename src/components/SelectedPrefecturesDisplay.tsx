"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/page.module.scss";

interface SelectedPrefecturesDisplayProps {
  /** 選択された都道府県コードの配列 */
  selectedPrefectures: number[];
}

/**
 * 選択された都道府県の人口データを簡素に表示
 */
export default function SelectedPrefecturesDisplay({ selectedPrefectures }: SelectedPrefecturesDisplayProps) {
  const [populationData, setPopulationData] = useState<Record<number, any>>({});

  useEffect(() => {
    selectedPrefectures.forEach(async (prefCode) => {
      if (!populationData[prefCode]) {
        try {
          const response = await fetch(`/api/population?prefCode=${prefCode}`);
          const data = await response.json();
          setPopulationData((prev) => ({ ...prev, [prefCode]: data }));
        } catch (error) {
          console.error(`エラー(${prefCode}):`, error);
        }
      }
    });
  }, [selectedPrefectures]);

  if (selectedPrefectures.length === 0) {
    return null;
  }

  return (
    <div className={styles.selectedInfo}>
      <h3>選択された都道府県:</h3>
      {selectedPrefectures.map((prefCode) => (
        <div key={prefCode}>
          <p>都道府県コード: {prefCode}</p>
          {populationData[prefCode] && <p>総人口データ: {populationData[prefCode].result?.data?.[0]?.data?.[0]?.value?.toLocaleString()}人</p>}
        </div>
      ))}
      <small>({selectedPrefectures.length}件選択中)</small>
    </div>
  );
}
