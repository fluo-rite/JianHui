import { makeAutoObservable } from "mobx";

interface IStorePage {
  title: string;
  description: string;
  tdk: string;
}

export function createStorePage() {
  return makeAutoObservable<IStorePage>({
    title: "简汇页面",
    description: "简汇页面详情",
    tdk: "简汇,低代码,问卷,页面搭建,表单",
  });
}

export type TStorePage = ReturnType<typeof createStorePage>;
