"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/page.module.scss";
import common from "@/styles/common.module.scss";
import SelectedPrefecturesDisplay from "@/components/SelectedPrefecturesDisplay";
import { Prefecture } from "@/lib/types";

interface PrefectureSelectorProps {
  prefectures: Prefecture[];
}

/**
 * 都道府県選択コンポーネント（Client Component）
 * ユーザーが都道府県を選択できるチェックボックス一覧を表示
 */
export default function PrefectureSelector({ prefectures }: PrefectureSelectorProps) {
  const [selectedPrefectures, setSelectedPrefectures] = useState<number[]>([]);

  // 簡素なデバッグ監視
  useEffect(() => {
    console.log("選択中:", selectedPrefectures);
  }, [selectedPrefectures]);

  const handlePrefectureChange = (prefCode: number) => {
    if (selectedPrefectures.includes(prefCode)) {
      // 既に選択されている場合は削除
      setSelectedPrefectures(selectedPrefectures.filter((code) => code !== prefCode));
    } else {
      // 未選択の場合は追加
      setSelectedPrefectures([...selectedPrefectures, prefCode]);
    }
  };

  return (
    <div className={styles.prefectureSection}>
      <h2>都道府県を選択してください</h2>

      <div className={styles.prefectureList}>
        {prefectures.map((prefecture) => (
          <label key={prefecture.prefCode} className={styles.prefectureItem}>
            <input type="checkbox" checked={selectedPrefectures.includes(prefecture.prefCode)} onChange={() => handlePrefectureChange(prefecture.prefCode)} />
            <span className={styles.prefectureName}>{prefecture.prefName}</span>
          </label>
        ))}
      </div>

      <SelectedPrefecturesDisplay selectedPrefectures={selectedPrefectures} />
    </div>
  );
}
