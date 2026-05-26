import type { IComponent } from "@lowcode/share";
import { useRequest } from "ahooks";
import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { getQuestionDataByTypeRequest } from "~/api/low-code";
import { useStorePage } from "../../hooks/useStorePage";

interface DataSourceProps {
  currentSelected?: IComponent;
  pageId: number;
}

interface OptionItem {
  id: string;
  value: string;
}

interface ChartItem {
  name: string;
  count: number;
  percent: number;
}

function formatPercent(percent: number) {
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(2)}%`;
}

function formatCountAndPercent(item: ChartItem) {
  return `${item.count}人 / ${formatPercent(item.percent)}`;
}

export default function DataSource({
  currentSelected,
  pageId,
}: DataSourceProps) {
  const [currentData, setCurrentData] = useState<string[][]>([]);
  const [currentOptions, setCurrentOptions] = useState<OptionItem[]>([]);

  const { store } = useStorePage();

  const isRadio = useMemo(
    () => currentSelected?.type === "radio",
    [currentSelected]
  );
  const isCheckbox = useMemo(
    () => currentSelected?.type === "checkbox",
    [currentSelected]
  );

  const { run: execGetQuestionData } = useRequest(
    () =>
      getQuestionDataByTypeRequest({
        id: currentSelected!.id,
        page_id: pageId,
      }),
    {
      manual: true,
      onSuccess: ({ data }) => {
        setCurrentData(data.map((item: any) => item.value));

        if (
          ["radio", "checkbox"].includes(currentSelected?.type ?? "") &&
          data.length > 0 &&
          Array.isArray(data[0]?.options)
        ) {
          setCurrentOptions(
            data[0].options.map((item: any) => ({
              id: item.id,
              value: item.value,
            }))
          );
        } else {
          setCurrentOptions([]);
        }
      },
    }
  );

  useEffect(() => {
    currentSelected && execGetQuestionData();
  }, [currentSelected, execGetQuestionData]);

  function generatorTexts() {
    return (
      <div className="p-10">
        <span>《{store.title}》问卷填写数据：</span>
        <br />
        <br />
        {currentData.flat().map((item, index) => {
          return (
            <span key={index}>
              填写: {item} <br />
            </span>
          );
        })}
      </div>
    );
  }

  const itemTitle = useMemo(
    () => currentSelected?.options.title ?? "默认展示的标题",
    [currentSelected]
  );

  const totalSubmissions = useMemo(() => currentData.length, [currentData]);

  const result = useMemo(() => {
    return currentData.reduce((acc, prev) => {
      prev.forEach((id) => {
        acc[id ?? ""] = (acc[id ?? ""] ?? 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
  }, [currentData]);

  const chartData = useMemo<ChartItem[]>(() => {
    return currentOptions.map((item) => {
      const count = result[item.id] ?? 0;
      const percent =
        totalSubmissions === 0
          ? 0
          : Number(((count / totalSubmissions) * 100).toFixed(2));

      return {
        name: item.value,
        count,
        percent,
      };
    });
  }, [currentOptions, result, totalSubmissions]);

  function getPieOptions() {
    return {
      title: {
        text: itemTitle,
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: ({ data }: { data: ChartItem }) =>
          `${data.name}<br/>${formatCountAndPercent(data)}`,
      },
      legend: {
        orient: "vertical",
        left: "20%",
      },
      series: [
        {
          name: "分类人数",
          type: "pie",
          radius: "50%",
          data: chartData.map((item) => ({
            ...item,
            value: item.count,
          })),
          label: {
            formatter: ({ data }: { data: ChartItem }) =>
              `${data.name}\n${formatCountAndPercent(data)}`,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  }

  function getTopOptions() {
    return {
      width: "500px",
      backgroundColor: "#fff",
      grid: {
        left: "25%",
        containLabel: true,
      },
      tooltip: {
        trigger: "item",
        axisPointer: {
          type: "none",
        },
        formatter: ({ data }: { data: ChartItem }) =>
          `${data.name}<br/>${formatCountAndPercent(data)}`,
      },
      xAxis: {
        show: false,
        type: "value",
        max: 100,
      },
      yAxis: [
        {
          type: "category",
          inverse: true,
          axisLabel: {
            show: true,
            align: "right",
            textStyle: {
              fontSize: 14,
              color: "#333",
              rich: {
                name: {
                  width: 7 * 14,
                  align: "left",
                  textAlign: "left",
                },
              },
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          data: chartData.map((item) => item.name),
        },
        {
          type: "category",
          inverse: true,
          axisTick: "none",
          axisLine: "none",
          show: true,
          axisLabel: {
            textStyle: {
              color: "#3196fa",
              fontSize: "12",
            },
            formatter: (_: string, index: number) =>
              formatCountAndPercent(chartData[index]),
          },
          data: chartData.map((item) => item.name),
        },
      ],
      series: [
        {
          name: "百分比",
          type: "bar",
          zlevel: 1,
          itemStyle: {
            normal: {
              barBorderRadius: 30,
              color: "#3196fa",
            },
          },
          barWidth: 20,
          data: chartData.map((item) => ({
            value: item.percent,
            ...item,
          })),
        },
        {
          name: "背景",
          type: "bar",
          barWidth: 20,
          barGap: "-100%",
          data: Array.from({ length: chartData.length }).fill(100),
          itemStyle: {
            normal: {
              color: "#ededed",
              barBorderRadius: 30,
            },
          },
        },
      ],
    };
  }

  return (
    <>
      {isRadio ? (
        <ReactECharts option={getPieOptions()} />
      ) : isCheckbox ? (
        <ReactECharts option={getTopOptions()} />
      ) : (
        generatorTexts()
      )}
    </>
  );
}
