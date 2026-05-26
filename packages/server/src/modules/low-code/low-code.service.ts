import type {
  GetPageListItemResponse,
  PostQuestionDataRequest,
  TPageStatus,
  UpdatePageRequest,
} from "@lowcode/share";
import { objectOmit } from "@lowcode/share";
import { In } from "typeorm";
import type { DataSource, Repository } from "typeorm";
import { Component } from "../../entities/component.entity";
import { ComponentData } from "../../entities/component-data.entity";
import { Page } from "../../entities/page.entity";
import { HttpError } from "../../utils/http";
import type { TCurrentUser } from "../../utils/request-user";
import { sanitizeRichTextHtml } from "./rich-text";

function sanitizeComponentOptions(component: UpdatePageRequest["components"][number]) {
  if (component.type !== "richText") {
    return component;
  }

  const options =
    component.options && typeof component.options === "object"
      ? { ...component.options }
      : {};

  options.content =
    typeof options.content === "string"
      ? sanitizeRichTextHtml(options.content)
      : "";

  return {
    ...component,
    options,
  };
}

export class LowCodeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly pageRepository: Repository<Page>,
    private readonly componentRepository: Repository<Component>,
    private readonly componentDataRepository: Repository<ComponentData>
  ) {}

  private async getOwnedPage(pageId: number, userId: number) {
    return this.pageRepository.findOneBy({
      id: pageId,
      account_id: userId,
    });
  }

  private async getPageComponents(page: Page) {
    const components: Component[] = [];

    for (const componentId of page.components) {
      const component = await this.componentRepository.findOneBy({
        id: Number(componentId),
      });
      if (component) {
        components.push(component);
      }
    }

    return components;
  }

  private async buildPageDetail(page: Page) {
    const components = await this.getPageComponents(page);
    const submission_count = await this.componentDataRepository.countBy({
      page_id: page.id,
    });

    return {
      ...objectOmit(page, ["components"]),
      componentIds: page.components,
      components,
      submission_count,
    };
  }

  private assertPageStatus(page: Page, expected: TPageStatus, message: string) {
    if (page.status !== expected) {
      throw new HttpError(400, message);
    }
  }

  async createPage(user: TCurrentUser) {
    const page = await this.pageRepository.save({
      account_id: user.id,
      page_name: "未命名页面",
      desc: "",
      tdk: "",
      components: [],
      status: "draft",
      published_at: null,
      closed_at: null,
    });

    return {
      msg: "页面已创建",
      data: await this.buildPageDetail(page),
    };
  }

  async getPages(user: TCurrentUser): Promise<GetPageListItemResponse[]> {
    const pages = await this.pageRepository.find({
      where: { account_id: user.id },
      order: { updated_at: "DESC" },
    });

    return Promise.all(
      pages.map(async (page) => {
        const submission_count = await this.componentDataRepository.countBy({
          page_id: page.id,
        });

        return {
          ...objectOmit(page, ["components"]),
          submission_count,
        };
      })
    );
  }

  async getPageDetail(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, "页面不存在");
    }

    return this.buildPageDetail(page);
  }

  async updatePage(pageId: number, body: UpdatePageRequest, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, "页面不存在");
    }
    this.assertPageStatus(page, "draft", "仅未发布页面允许编辑");

    const { components, ...pageFields } = body;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Page, page.id, {
        ...pageFields,
        components: [],
        updated_at: new Date(),
      });

      for (const componentId of page.components) {
        await queryRunner.manager.delete(Component, Number(componentId));
      }

      const insertedComponentIds: string[] = [];
      for (const component of components.map(sanitizeComponentOptions)) {
        const insertResult = await queryRunner.manager.insert(Component, {
          ...component,
          page_id: page.id,
          account_id: user.id,
        });
        insertedComponentIds.push(String(insertResult.identifiers[0].id));
      }

      await queryRunner.manager.update(Page, page.id, {
        components: insertedComponentIds,
        updated_at: new Date(),
      });

      await queryRunner.commitTransaction();

      const updatedPage = await this.getOwnedPage(page.id, user.id);
      if (!updatedPage) {
        throw new HttpError(404, "页面不存在");
      }

      return {
        msg: "页面已保存",
        data: await this.buildPageDetail(updatedPage),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpError(500, `页面保存失败：${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async publishPage(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, "页面不存在");
    }
    this.assertPageStatus(page, "draft", "仅未发布页面允许发布");

    await this.pageRepository.update(page.id, {
      status: "published",
      published_at: new Date(),
      closed_at: null,
      updated_at: new Date(),
    });

    return { msg: "页面已发布" };
  }

  async closePage(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, "页面不存在");
    }
    this.assertPageStatus(page, "published", "仅已发布页面允许关闭");

    await this.pageRepository.update(page.id, {
      status: "closed",
      closed_at: new Date(),
      updated_at: new Date(),
    });

    return { msg: "页面已关闭" };
  }

  async reopenPage(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, "页面不存在");
    }
    this.assertPageStatus(page, "closed", "仅已关闭页面允许重新打开");

    await this.pageRepository.update(page.id, {
      status: "published",
      published_at: new Date(),
      closed_at: null,
      updated_at: new Date(),
    });

    return { msg: "页面已重新打开" };
  }

  async deletePage(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, "页面不存在");
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(ComponentData, { page_id: page.id });

      for (const componentId of page.components) {
        await queryRunner.manager.delete(Component, Number(componentId));
      }

      await queryRunner.manager.delete(Page, page.id);
      await queryRunner.commitTransaction();

      return { msg: "页面已删除" };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpError(500, `页面删除失败：${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getPublicReleaseData(id?: number | null) {
    if (!id) {
      return null;
    }

    const page = await this.pageRepository.findOneBy({ id });
    if (!page || page.status === "draft") {
      return null;
    }

    if (page.status === "closed") {
      return {
        ...objectOmit(page, ["components"]),
        componentIds: [],
        components: [],
        submission_count: await this.componentDataRepository.countBy({
          page_id: page.id,
        }),
      };
    }

    return this.buildPageDetail(page);
  }

  async isQuestionDataPosted(key: string, pageId: number) {
    const page = await this.pageRepository.findOneBy({ id: pageId });
    if (!page || page.status !== "published") {
      return false;
    }

    const isExist = await this.componentDataRepository.findOneBy({
      user: key,
      page_id: pageId,
    });
    return !!isExist;
  }

  async postQuestionData(body: PostQuestionDataRequest, key: string) {
    const { page_id, props } = body;
    const page = await this.pageRepository.findOneBy({ id: page_id });
    if (!page || page.status !== "published") {
      throw new HttpError(400, "页面当前不可提交");
    }

    const isExist = await this.componentDataRepository.findOneBy({
      user: key,
      page_id,
    });

    if (!isExist) {
      await this.componentDataRepository.save({ user: key, page_id, props });
    }

    return { msg: "提交成功！感谢您的参与！" };
  }

  async getQuestionComponents(user: TCurrentUser, pageId: number) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, "页面不存在");
    }

    return this.componentRepository.findBy({
      account_id: user.id,
      page_id: page.id,
      type: In(["input", "textArea", "radio", "checkbox"]),
    });
  }

  async getQuestionData(userId: number, pageId: number) {
    const page = await this.getOwnedPage(pageId, userId);
    if (!page) {
      throw new HttpError(404, "页面不存在");
    }

    const componentDatas = await this.componentDataRepository.findBy({
      page_id: page.id,
    });

    return Promise.all(
      componentDatas.map(async (componentData) =>
        Promise.all(
          componentData.props.map(async (item) => {
            const component = await this.componentRepository.findOneBy({
              id: item.id,
              page_id: page.id,
            });
            return {
              result: item,
              type: component?.type,
              options: component?.options?.options || {},
            };
          })
        )
      )
    );
  }

  async getQuestionDataByIdRequest({
    id,
    page_id,
    userId,
  }: {
    id: number;
    page_id: number;
    userId: number;
  }) {
    const page = await this.getOwnedPage(page_id, userId);
    if (!page) {
      throw new HttpError(404, "页面不存在");
    }

    const componentDatas = await this.componentDataRepository.findBy({
      page_id: page.id,
    });

    return Promise.all(
      componentDatas
        .map((componentData) =>
          componentData.props
            .filter((item) => item.id === id)
            .map(async (item) => {
              const component = await this.componentRepository.findOneBy({
                id: item.id,
                page_id: page.id,
              });
              return {
                value: Array.isArray(item.value)
                  ? item.value
                  : item.value == null
                    ? []
                    : [item.value],
                options: component?.options?.options || null,
              };
            })
        )
        .flat()
    );
  }
}
