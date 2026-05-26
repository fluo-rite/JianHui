export interface ReleaseComponentData {
  id: string;
  type: string;
  options: Record<string, any>;
}

export interface ReleasePageData {
  id: number;
  status: "draft" | "published" | "closed";
  components: ReleaseComponentData[];
  [key: string]: any;
}
