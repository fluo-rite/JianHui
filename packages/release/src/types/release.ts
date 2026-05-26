export interface ReleaseComponentData {
  id: string;
  type: string;
  options: Record<string, any>;
}

export interface ReleasePageData {
  id: number;
  components: ReleaseComponentData[];
  [key: string]: any;
}
