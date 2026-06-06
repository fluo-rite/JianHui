import type { IComponent, QuestionDistributionResponse } from "@lowcode/share";
import { useRequest } from "ahooks";
import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { getQuestionDistribution } from "~/api/low-code";

interface DataSourceProps {
  currentSelected?: IComponent;
  pageId: number;
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
  const isDistributionType =
    currentSelected?.type === "radio" || currentSelected?.type === "checkbox";

  const { data, loading } = useRequest(
    () => getQuestionDistribution(pageId, currentSelected!.id),
    {
      ready: !!currentSelected && isDistributionType,
      refreshDeps: [pageId, currentSelected?.id, currentSelected?.type],
    }
  );

  const distribution = data?.data as QuestionDistributionResponse | undefined;

  const chartData = useMemo<ChartItem[]>(() => {
    return (distribution?.options ?? []).map((item) => ({
      name: item.label,
      count: item.count,
      percent: item.percent,
    }));
  }, [distribution]);

  const itemTitle = currentSelected?.options.title ?? "默认显示的标题";

  function getPieOptions() {
    return {
      title: {
        text: itemTitle,
        left: "center",
        top: 12,
      },
      tooltip: {
        trigger: "item",
        formatter: ({ data }: { data: ChartItem }) =>
          `${data.name}<br/>${formatCountAndPercent(data)}`,
      },
      legend: {
        type: "scroll",
        bottom: 0,
        left: "center",
      },
      series: [
        {
          name: "分类人数",
          type: "pie",
          center: ["50%", "52%"],
          radius: ["42%", "62%"],
          avoidLabelOverlap: true,
          data: chartData.map((item) => ({
            ...item,
            value: item.count,
          })),
          label: {
            position: "outside",
            formatter: ({ data }: { data: ChartItem }) =>
              `${data.name}\n${formatPercent(data.percent)}`,
            lineHeight: 18,
          },
          minShowLabelAngle: 8,
          labelLine: {
            length: 12,
            length2: 10,
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

  function getBarOptions() {
    return {
      backgroundColor: "#fff",
      grid: {
        left: "25%",
        right: "12%",
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

  if (!currentSelected) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center p-6 text-sm text-gray-500">
        请选择一个问题查看统计结果。
      </div>
    );
  }

  if (!isDistributionType) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center p-6 text-center text-sm text-gray-500">
        文本题不提供分布统计，请在左侧分页记录中查看具体内容。
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center p-6 text-sm text-gray-500">
        正在加载统计结果...
      </div>
    );
  }

  return currentSelected.type === "radio" ? (
    <div className="h-full min-h-[420px] p-4">
      <ReactECharts
        key={`${currentSelected.id}-radio`}
        option={getPieOptions()}
        notMerge={true}
        style={{ height: "100%", minHeight: 420 }}
      />
    </div>
  ) : (
    <div className="h-full min-h-[420px] overflow-auto p-4">
      <ReactECharts
        key={`${currentSelected.id}-checkbox`}
        option={getBarOptions()}
        notMerge={true}
        style={{ height: Math.max(chartData.length * 56, 420) }}
      />
    </div>
  );
}
