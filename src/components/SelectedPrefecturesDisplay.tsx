"use client";

import { PopulationApiResponse, SelectedPrefecturesDisplayProps } from "@/lib/types";
import styles from "@/styles/SelectedPrefecturesDisplay.module.scss";
import Highcharts from "highcharts";
import { useEffect, useRef, useState } from "react";

/**
 * 選択された都道府県の人口データを簡素に表示
 */
export default function SelectedPrefecturesDisplay({ selectedPrefectures }: SelectedPrefecturesDisplayProps) {
  // populationData変数の構造と内容について
  // 構造: 都道府県コードをキーとし、各都道府県の人口データを格納するオブジェクト
  // 内容: 都道府県ごとに総人口、年少人口、生産年齢人口、老年人口が同列に格納されている
  // 例: { 13: { message: null, result: { data: [...] } }, ... }
  const [populationData, setPopulationData] = useState<Record<number, PopulationApiResponse>>({});
  const [populationType, setPopulationType] = useState<"総人口" | "年少人口" | "生産年齢人口" | "老年人口">("総人口");
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const chartRef = useRef<HTMLDivElement>(null);

  // 🐛 デバッグ用：populationDataを常に監視
  useEffect(() => {
    console.log("📊 populationData更新:", populationData);
  }, [populationData, selectedPrefectures]);

  // 🐛 デバッグ用：populationTypeを常に監視
  useEffect(() => {
    console.log("📊 populationType:", populationType);
  }, [populationType]);

  /**
   * 人口データを取得
   */
  useEffect(() => {
    selectedPrefectures.forEach(async (prefecture) => {
      const prefCode = prefecture.prefCode;

      if (!populationData[prefCode] && !loading[prefCode]) {
        setLoading((prev) => ({ ...prev, [prefCode]: true }));

        try {
          const response = await fetch(`/api/population?prefCode=${prefCode}`);
          const data: PopulationApiResponse = await response.json();
          setPopulationData((prev) => ({ ...prev, [prefCode]: data }));
        } catch (error) {
          console.error(`エラー(${prefecture.prefName}):`, error);
        } finally {
          setLoading((prev) => ({ ...prev, [prefCode]: false }));
        }
      }
    });
  }, [selectedPrefectures, populationData, loading]);

  /**
   * Highchartsでグラフを描画
   */
  useEffect(() => {
    if (!chartRef.current || selectedPrefectures.length === 0) return;

    // 🔧 現在のスクロール位置を保存
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // グラフ用のデータを準備
    const series = selectedPrefectures
      .filter((prefecture) => populationData[prefecture.prefCode])
      .map((prefecture) => {
        const data = populationData[prefecture.prefCode];
        const totalPopulation = data.result.data.find((item) => item.label === populationType);

        if (!totalPopulation) return null;

        return {
          name: prefecture.prefName, // 都道府県名を使用
          data: totalPopulation.data.map((item) => [item.year, item.value]),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (series.length === 0) return;

    // Highchartsのオプション
    const options: Highcharts.Options = {
      chart: {
        type: "line",
        height: 400,
      },
      title: {
        text: populationType,
      },
      xAxis: {
        title: {
          text: "年",
        },
        type: "linear",
      },
      yAxis: {
        title: {
          text: "人口（人）",
        },
        labels: {
          formatter: function () {
            return (this.value as number).toLocaleString();
          },
        },
      },
      tooltip: {
        formatter: function () {
          return `<b>${this.series.name}</b><br/>
                  ${this.x}年: ${(this.y as number).toLocaleString()}人`;
        },
      },
      legend: {
        enabled: true,
      },
      series: series as Highcharts.SeriesOptionsType[],
      credits: {
        enabled: false,
      },
    };

    // チャートを作成
    const chart = Highcharts.chart(chartRef.current, options);

    // 🔧 スクロール位置を復元
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);

    // クリーンアップ
    return () => {
      chart.destroy();
    };
  }, [selectedPrefectures, populationData, populationType]);

  if (selectedPrefectures.length === 0) {
    return null;
  }

  return (
    <div className={styles.selectedInfo}>
      {/* Highchartsグラフ */}
      {selectedPrefectures.length > 0 && (
        <div className={styles.chartContainer}>
          {/* 人口タイプを切り替えるためのUI */}
          <div className={styles.populationTypeSelector}>
            <label>
              <input
                type="radio"
                name="populationType"
                value="総人口"
                defaultChecked
                onChange={() => setPopulationType("総人口")}
              />
              総人口
            </label>
            <label>
              <input
                type="radio"
                name="populationType"
                value="年少人口"
                onChange={() => setPopulationType("年少人口")}
              />
              年少人口
            </label>
            <label>
              <input
                type="radio"
                name="populationType"
                value="生産年齢人口"
                onChange={() => setPopulationType("生産年齢人口")}
              />
              生産年齢人口
            </label>
            <label>
              <input
                type="radio"
                name="populationType"
                value="老年人口"
                onChange={() => setPopulationType("老年人口")}
              />
              老年人口
            </label>
          </div>
          <div ref={chartRef} className={styles.chart}></div>
        </div>
      )}
    </div>
  );
}
