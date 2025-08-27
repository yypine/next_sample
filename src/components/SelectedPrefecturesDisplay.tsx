"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/styles/page.module.scss";
import common from "@/styles/common.module.scss";
import Highcharts from "highcharts";
import { SelectedPrefecturesDisplayProps, PopulationApiResponse, Prefecture } from "@/lib/types";

/**
 * 選択された都道府県の人口データを簡素に表示
 */
export default function SelectedPrefecturesDisplay({ selectedPrefectures }: SelectedPrefecturesDisplayProps) {
  const [populationData, setPopulationData] = useState<Record<number, PopulationApiResponse>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const chartRef = useRef<HTMLDivElement>(null);

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
  }, [selectedPrefectures]);

  /**
   * Highchartsでグラフを描画
   */
  useEffect(() => {
    if (!chartRef.current || selectedPrefectures.length === 0) return;

    // グラフ用のデータを準備
    const series = selectedPrefectures
      .filter((prefecture) => populationData[prefecture.prefCode])
      .map((prefecture) => {
        const data = populationData[prefecture.prefCode];
        const totalPopulation = data.result.data.find((item) => item.label === "総人口");

        if (!totalPopulation) return null;

        return {
          name: prefecture.prefName, // 都道府県名を使用
          data: totalPopulation.data.map((item) => [item.year, item.value]),
        };
      })
      .filter(Boolean);

    if (series.length === 0) return;

    // Highchartsのオプション
    const options: Highcharts.Options = {
      chart: {
        type: "line",
        height: 400,
      },
      title: {
        text: "都道府県別人口推移比較",
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

    // クリーンアップ
    return () => {
      chart.destroy();
    };
  }, [selectedPrefectures, populationData]);

  if (selectedPrefectures.length === 0) {
    return null;
  }

  return (
    <div className={styles.selectedInfo}>
      <small>({selectedPrefectures.length}件選択中)</small>

      {/* Highchartsグラフ */}
      {selectedPrefectures.length > 0 && (
        <div className={styles.chartContainer}>
          <h4 className={common.subTitle}>人口推移グラフ</h4>
          <div ref={chartRef} className={styles.chart}></div>
        </div>
      )}
    </div>
  );
}
