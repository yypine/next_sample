"use client";

import { useState } from "react";
import styles from "@/styles/page.module.scss";

/**
 * 都道府県のモックデータ
 * 本来はRESAS APIから取得するが、開発初期段階では仮データを使用
 * @todo 後でRESAS APIと接続する
 */
const mockPrefectures = [
  { prefCode: 1, prefName: "北海道" },
  { prefCode: 2, prefName: "青森県" },
  { prefCode: 3, prefName: "岩手県" },
  { prefCode: 4, prefName: "宮城県" },
  { prefCode: 5, prefName: "秋田県" },
  // 5つだけで開始
];

export default function Home() {
  // 選択された都道府県のコードを管理するstate
  const [selectedPrefectures, setSelectedPrefectures] = useState<number[]>([]);

  /**
   * 都道府県の選択状態を切り替える関数
   * チェックボックスがクリックされた時に呼び出される
   *
   * @param prefCode - 都道府県コード
   */
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
        <h1 className="mainTitle">都道府県別人口推移グラフ</h1>
        <div>
          <h2 className={styles.subTitle}>都道府県</h2>
          <div className={styles.prefectureList}>
            {/* 都道府県のチェックボックスリストを動的生成 */}
            {mockPrefectures.map((prefecture) => (
              <label key={prefecture.prefCode} className={styles.prefectureItem}>
                <input type="checkbox" checked={selectedPrefectures.includes(prefecture.prefCode)} onChange={() => handlePrefectureChange(prefecture.prefCode)} />
                <span>{prefecture.prefName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 選択された都道府県の表示（選択がある場合のみ） */}
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
