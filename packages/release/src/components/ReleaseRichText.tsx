interface ReleaseRichTextProps {
  html: string;
}

export default function ReleaseRichText({ html }: ReleaseRichTextProps) {
  if (!html)
    return (
      <div id="placeholder" className="w-full h-20">
        璇峰湪瀵屾枃鏈緭鍏ュ唴瀹?
      </div>
    );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
