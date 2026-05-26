import type { IComponent } from "@lowcode/share";
import { useRequest } from "ahooks";
import { Button, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { getQuestionData } from "~/api/low-code";
import { useStorePage } from "~/hooks";
import { excelToZip, jsonToExcel } from "~/utils/excel";

export default function ComponentDatas(props: {
  components: IComponent[];
  handleDisable: () => void;
  pageId: number;
}) {
  const [dataSource, setDataSource] = useState<any[]>([]);

  const columns: ColumnsType<any> = useMemo(() => {
    return props.components.map((item) => {
      return {
        key: item.id,
        dataIndex: item.id,
        title: item.options.title ?? "默认展示的标题",
      };
    });
  }, [props.components]);

  const { loading } = useRequest(() => getQuestionData(props.pageId), {
    onSuccess: ({ data }) => {
      if (data.length === 0) {
        props.handleDisable();
        message.warning("还没有用户提交数据");
        return;
      }

      const result = data.map((res: any) => {
        return res
          .map((item: any) => {
            let value: any = item.result?.value;
            if (["radio", "checkbox"].includes(item.type)) {
              if (!value || (Array.isArray(value) && value.length === 0)) {
                value = "";
              } else if (Array.isArray(value)) {
                value = value
                  .map(
                    (v) =>
                      item.options?.find((option: any) => option.id === v)?.value
                  )
                  .filter(Boolean)
                  .join(",");
              } else {
                value = item.options?.find((option: any) => option.id === value)?.value;
              }
            }

            return {
              value,
              key: item.result.id,
            };
          })
          .reduce((pre: any, cur: any) => {
            return {
              key: cur.key,
              [cur.key]: cur.value,
              ...pre,
            };
          }, {});
      });
      setDataSource(result);
    },
  });

  const { store } = useStorePage();

  async function handleExportExcel(isWriteFile?: boolean) {
    return jsonToExcel({
      columns,
      dataSource,
      title: store.title,
      isWriteFile: isWriteFile ?? true,
    });
  }

  async function handleExportZip() {
    const excel = await jsonToExcel({
      columns,
      dataSource,
      title: store.title,
      isWriteFile: false,
    });

    excelToZip(excel);
  }

  return (
    <div className="relative">
      <Table columns={columns} dataSource={dataSource} loading={loading}></Table>
      <div className="absolute z-10 right-2 bottom-[-40px]">
        <Space>
          <Button onClick={handleExportZip}>导出压缩包</Button>
          <Button type="primary" onClick={() => handleExportExcel()}>
            导出Excel
          </Button>
        </Space>
      </div>
    </div>
  );
}
