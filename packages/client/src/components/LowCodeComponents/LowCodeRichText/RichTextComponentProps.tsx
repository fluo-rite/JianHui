import type { IRichTextComponentProps } from "@lowcode/share";
import { useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { useStoreComponents } from "~/hooks";

export default function RichTextComponentProps(
  props: IRichTextComponentProps
) {
  const { updateCurrentComponent } = useStoreComponents();
  const editorRef = useRef<ReactQuill>(null);

  return (
    <div className="flex items-center justify-center">
      <ReactQuill
        theme="snow"
        value={props.content ?? ""}
        onChange={(_value, _delta, _source, editor) =>
          updateCurrentComponent({
            content: editor.getHTML(),
          })
        }
        ref={editorRef}
        modules={{
          toolbar: [
            [
              { header: [1, 2, 3, 4, false] },
              "bold",
              "italic",
              "underline",
              { color: [] },
              { background: [] },
              { align: [] },
              { list: "ordered" },
              { list: "bullet" },
              { font: [] },
            ],
            ["code-block"],
          ],
        }}
        placeholder="请输入内容"
      />
    </div>
  );
}
