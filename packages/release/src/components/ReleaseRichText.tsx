interface ReleaseRichTextProps {
  html: string;
}

export default function ReleaseRichText({ html }: ReleaseRichTextProps) {
  if (!html)
    return (
      <div id="placeholder" className="w-full h-20">
        请在富文本输入内容
      </div>
    );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
