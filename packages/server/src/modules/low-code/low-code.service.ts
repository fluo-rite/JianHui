import type {
  PostQuestionDataRequest,
  PostReleaseRequest,
} from '@lowcode/share';
import { objectOmit } from '@lowcode/share';
import { In } from 'typeorm';
import type { DataSource, Repository } from 'typeorm';
import { Component } from '../../entities/component.entity';
import { ComponentData } from '../../entities/component-data.entity';
import { Page } from '../../entities/page.entity';
import { HttpError } from '../../utils/http';
import type { TCurrentUser } from '../../utils/request-user';

export class LowCodeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly pageRepository: Repository<Page>,
    private readonly componentRepository: Repository<Component>,
    private readonly componentDataRepository: Repository<ComponentData>,
  ) {}

  async release(body: PostReleaseRequest, user: TCurrentUser) {
    const { components, ...pageFields } = body;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingPage = await queryRunner.manager.findOneBy(Page, {
        account_id: user.id,
      });

      let pageId = existingPage?.id;

      if (existingPage) {
        await queryRunner.manager.update(Page, existingPage.id, {
          ...pageFields,
          components: [],
        });

        for (const componentId of existingPage.components) {
          await queryRunner.manager.delete(Component, Number(componentId));
        }

        await queryRunner.manager.delete(ComponentData, {
          page_id: existingPage.id,
        });
      } else {
        const insertResult = await queryRunner.manager.insert(Page, {
          ...pageFields,
          account_id: user.id,
          components: [],
        });
        pageId = insertResult.identifiers[0].id;
      }

      const insertedComponentIds: string[] = [];
      for (const component of components) {
        const insertResult = await queryRunner.manager.insert(Component, {
          ...component,
          page_id: pageId,
          account_id: user.id,
        });
        insertedComponentIds.push(String(insertResult.identifiers[0].id));
      }

      await queryRunner.manager.update(Page, pageId, {
        components: insertedComponentIds,
      });

      await queryRunner.commitTransaction();

      return {
        msg: '发布成功',
        data: pageId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpError(500, `发布失败，${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getReleaseData(id?: number | null, user?: TCurrentUser) {
    let lowCode: Page | null = null;

    if (user?.id !== undefined) {
      lowCode = id
        ? await this.pageRepository.findOneBy({ id, account_id: user.id })
        : await this.pageRepository.findOneBy({ account_id: user.id });
    } else if (id) {
      lowCode = await this.pageRepository.findOneBy({ id });
    }

    if (!lowCode) {
      return null;
    }

    const components = [];
    for (const componentId of lowCode.components) {
      const component = await this.componentRepository.findOneBy({
        id: Number(componentId),
      });
      if (component) {
        components.push(component);
      }
    }

    return {
      components,
      componentIds: lowCode.components,
      ...objectOmit(lowCode, ['components']),
    };
  }

  async isQuestionDataPosted(key: string, pageId: number) {
    const isExist = await this.componentDataRepository.findOneBy({
      user: key,
      page_id: pageId,
    });
    return !!isExist;
  }

  async postQuestionData(body: PostQuestionDataRequest, key: string) {
    const { page_id, props } = body;
    const isExist = await this.componentDataRepository.findOneBy({
      user: key,
      page_id,
    });

    if (!isExist) {
      await this.componentDataRepository.save({ user: key, page_id, props });
    }

    return { msg: '提交成功！感谢您的参与！' };
  }

  async getQuestionComponents(user: TCurrentUser) {
    return this.componentRepository.findBy({
      account_id: user.id,
      type: In(['input', 'textArea', 'radio', 'checkbox']),
    });
  }

  async getQuestionData(userId: number) {
    const lowCodePage = await this.pageRepository.findOneBy({
      account_id: userId,
    });
    if (!lowCodePage) {
      throw new HttpError(400, '未找到页面，请先发布页面信息');
    }

    const componentDatas = await this.componentDataRepository.findBy({
      page_id: lowCodePage.id,
    });

    return Promise.all(
      componentDatas.map(async (componentData) =>
        Promise.all(
          componentData.props.map(async (item) => {
            const component = await this.componentRepository.findOneBy({
              id: item.id,
            });
            return {
              result: item,
              type: component?.type,
              options: component?.options?.options || {},
            };
          }),
        ),
      ),
    );
  }

  async getQuestionDataByIdRequest({
    id,
    userId,
  }: {
    id: number;
    userId: number;
  }) {
    const lowCodePage = await this.pageRepository.findOneBy({
      account_id: userId,
    });
    if (!lowCodePage) {
      throw new HttpError(400, '未找到页面，请先发布页面信息');
    }

    const componentDatas = await this.componentDataRepository.findBy({
      page_id: lowCodePage.id,
    });

    return Promise.all(
      componentDatas
        .map((componentData) =>
          componentData.props
            .filter((item) => item.id === id)
            .map(async (item) => {
              const component = await this.componentRepository.findOneBy({
                id: item.id,
              });
              return {
                value: Array.isArray(item.value)
                  ? item.value
                  : item.value == null
                    ? []
                    : [item.value],
                options: component?.options?.options || null,
              };
            }),
        )
        .flat(),
    );
  }
}
