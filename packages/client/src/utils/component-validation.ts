import {
  getComponentOptionsValidationIssues,
  type ValidationIssue,
} from "@lowcode/share";
import type { useStoreComponents } from "~/hooks";

const FIELD_LABELS: Record<string, string> = {
  title: "标题",
  description: "描述",
  url: "地址",
  link: "跳转链接",
  placeholder: "占位文本",
  text: "内容",
  size: "尺寸",
  icon: "图标",
  iconSize: "图标大小",
  color: "颜色",
  bgColor: "背景色",
  interval: "轮播间隔",
  images: "图片列表",
  items: "列表项",
  options: "选项",
  value: "值",
};

interface PathSegment {
  name: string;
  index?: number;
}

export interface PageComponentValidationFailure {
  componentIndex: number;
  fieldPath: string;
  fieldLabel: string;
  message: string;
}

function getFieldLabel(fieldName: string) {
  return FIELD_LABELS[fieldName] ?? fieldName;
}

function parsePathSegments(path: string): PathSegment[] {
  if (!path) return [];

  return path
    .split(".")
    .filter(Boolean)
    .map((segment) => {
      const match = segment.match(/^([^\[]+)(?:\[(\d+)\])?$/);
      if (!match) {
        return { name: segment };
      }

      return {
        name: match[1],
        index: match[2] === undefined ? undefined : Number(match[2]),
      };
    });
}

function formatIndexedSegment(segment: PathSegment, nextSegment?: PathSegment) {
  const baseLabel = getFieldLabel(segment.name);
  if (segment.index === undefined) {
    return baseLabel;
  }

  const indexLabel = `${baseLabel}第 ${segment.index + 1} 项`;
  if (!nextSegment) {
    return indexLabel;
  }

  return `${indexLabel}的${getFieldLabel(nextSegment.name)}`;
}

function formatFieldLabel(path: string) {
  if (!path) {
    return "";
  }

  const segments = parsePathSegments(path);
  if (segments.length === 0) {
    return path;
  }

  if (segments.length === 1) {
    return formatIndexedSegment(segments[0]);
  }

  const [firstSegment, secondSegment, ...restSegments] = segments;
  if (firstSegment.index !== undefined) {
    return `${formatIndexedSegment(firstSegment, secondSegment)}${
      restSegments.length > 0
        ? `.${restSegments.map((segment) => getFieldLabel(segment.name)).join(".")}`
        : ""
    }`;
  }

  if (secondSegment.index !== undefined) {
    return formatIndexedSegment(secondSegment, segments[2]);
  }

  return getFieldLabel(segments[segments.length - 1].name);
}

function formatValidationFailure(
  componentIndex: number,
  issue: ValidationIssue
): PageComponentValidationFailure {
  return {
    componentIndex,
    fieldPath: issue.path,
    fieldLabel: formatFieldLabel(issue.path),
    message: issue.message,
  };
}

export function validatePageComponentOptionsBeforeSave(
  storeComponents: ReturnType<typeof useStoreComponents>["store"],
  getComponentById: ReturnType<typeof useStoreComponents>["getComponentById"]
): PageComponentValidationFailure | null {
  for (
    let index = 0;
    index < storeComponents.sortableCompConfig.length;
    index += 1
  ) {
    const componentId = storeComponents.sortableCompConfig[index];
    const component = getComponentById(componentId);
    const validationIssues = getComponentOptionsValidationIssues(
      component.type,
      component.props
    );

    if (validationIssues.length > 0) {
      return formatValidationFailure(index, validationIssues[0]);
    }
  }

  return null;
}
