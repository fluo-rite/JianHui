import type {
  GetPageListItemResponse,
  PostQuestionDataRequest,
  QuestionDistributionResponse,
  SubmissionRecordPageResponse,
  TPageStatus,
  TQuestionComponentType,
  UpdatePageRequest,
} from '@lowcode/share';
import type { Response } from 'express';
import { In } from 'typeorm';
import type { DataSource, Repository } from 'typeorm';
import { Component } from '../../entities/component.entity';
import { Page } from '../../entities/page.entity';
import { SubmissionAnswer } from '../../entities/submission-answer.entity';
import { Submission } from '../../entities/submission.entity';
import { HttpError } from '../../utils/http';
import type { TCurrentUser } from '../../utils/request-user';
import { sanitizeRichTextHtml } from './rich-text';

const QUESTION_COMPONENT_TYPES = [
  'input',
  'textArea',
  'radio',
  'checkbox',
] as const satisfies TQuestionComponentType[];
const CSV_BATCH_SIZE = 500;

interface SubmissionCountRow {
  page_id: number | string;
  submission_count: number | string;
}

interface DistributionCountRow {
  value_option_id: string | null;
  count: number | string;
}

interface SubmissionCursor {
  createdAt: string;
  id: number;
}

interface QuestionOptionItem {
  id: string;
  value: string;
}

function sanitizeComponentOptions(
  component: UpdatePageRequest['components'][number],
) {
  if (component.type !== 'richText') {
    return component;
  }

  const options: Record<string, any> =
    component.options && typeof component.options === 'object'
      ? { ...component.options }
      : {};

  options.content =
    typeof options.content === 'string'
      ? sanitizeRichTextHtml(options.content)
      : '';

  return {
    ...component,
    options,
  };
}

function isDuplicateEntryError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ER_DUP_ENTRY'
  );
}

function encodeSubmissionCursor(submission: Submission) {
  return Buffer.from(
    JSON.stringify({
      createdAt: submission.created_at.toISOString(),
      id: submission.id,
    } satisfies SubmissionCursor),
    'utf8',
  ).toString('base64');
}

function sanitizeCsvFilename(pageName: string, pageId: number) {
  const normalized = (pageName || `page-${pageId}`).trim() || `page-${pageId}`;
  return normalized.replace(/[\\/:*?"<>|]+/g, '_');
}

function escapeCsvCell(value: string) {
  const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export class LowCodeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly pageRepository: Repository<Page>,
    private readonly componentRepository: Repository<Component>,
    private readonly submissionRepository: Repository<Submission>,
    private readonly submissionAnswerRepository: Repository<SubmissionAnswer>,
  ) {}

  private async getOwnedPage(pageId: number, userId: number) {
    return this.pageRepository.findOneBy({
      id: pageId,
      account_id: userId,
    });
  }

  private async getPageComponents(pageId: number) {
    return this.componentRepository.find({
      where: { page_id: pageId },
      order: { sort_index: 'ASC' },
    });
  }

  private async getQuestionComponentsForPage(pageId: number) {
    return this.componentRepository.find({
      where: {
        page_id: pageId,
        type: In([...QUESTION_COMPONENT_TYPES]),
      },
      order: { sort_index: 'ASC' },
    });
  }

  private async getSubmissionCount(pageId: number) {
    return this.submissionRepository.countBy({
      page_id: pageId,
    });
  }

  private async getSubmissionCountMap(pageIds: number[]) {
    if (pageIds.length === 0) {
      return new Map<number, number>();
    }

    const rows = await this.submissionRepository
      .createQueryBuilder('submission')
      .select('submission.page_id', 'page_id')
      .addSelect('COUNT(*)', 'submission_count')
      .where('submission.page_id IN (:...pageIds)', { pageIds })
      .groupBy('submission.page_id')
      .getRawMany<SubmissionCountRow>();

    return new Map(
      rows.map((row) => [Number(row.page_id), Number(row.submission_count)]),
    );
  }

  private async buildPageDetail(page: Page) {
    const [components, submission_count] = await Promise.all([
      this.getPageComponents(page.id),
      this.getSubmissionCount(page.id),
    ]);

    return {
      ...page,
      components,
      submission_count,
    };
  }

  private assertPageStatus(page: Page, expected: TPageStatus, message: string) {
    if (page.status !== expected) {
      throw new HttpError(400, message);
    }
  }

  private getQuestionOptionItems(component: Component): QuestionOptionItem[] {
    const options = (component.options as Record<string, unknown>)?.options;
    if (!Array.isArray(options)) {
      return [];
    }

    return options
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const record = item as Record<string, unknown>;
        if (typeof record.id !== 'string' || typeof record.value !== 'string') {
          return null;
        }

        return {
          id: record.id,
          value: record.value,
        };
      })
      .filter((item): item is QuestionOptionItem => item !== null);
  }

  private buildOptionLabelMap(components: Component[]) {
    return new Map(
      components.map((component) => [
        component.id,
        new Map(
          this.getQuestionOptionItems(component).map((item) => [item.id, item.value]),
        ),
      ]),
    );
  }

  private buildSubmissionAnswerRecordMap(
    submissions: Submission[],
    components: Component[],
    answers: SubmissionAnswer[],
  ) {
    const emptyRecord = Object.fromEntries(
      components.map((component) => [String(component.id), '']),
    ) as Record<string, string>;
    const componentMap = new Map(
      components.map((component) => [component.id, component]),
    );
    const optionLabelMap = this.buildOptionLabelMap(components);
    const recordMap = new Map<number, Record<string, string>>(
      submissions.map((submission) => [submission.id, { ...emptyRecord }]),
    );

    for (const answer of answers) {
      const record = recordMap.get(answer.submission_id);
      const component = componentMap.get(answer.component_id);
      if (!record || !component) {
        continue;
      }

      const key = String(answer.component_id);
      if (component.type === 'input' || component.type === 'textArea') {
        record[key] = answer.value_text ?? '';
        continue;
      }

      const label =
        answer.value_option_id == null
          ? ''
          : optionLabelMap.get(component.id)?.get(answer.value_option_id) ?? '';

      if (component.type === 'radio') {
        record[key] = label;
        continue;
      }

      if (component.type === 'checkbox' && label) {
        record[key] = record[key] ? `${record[key]}; ${label}` : label;
      }
    }

    return recordMap;
  }

  private async getSubmissionAnswersBySubmissionIds(
    pageId: number,
    submissionIds: number[],
  ) {
    if (submissionIds.length === 0) {
      return [];
    }

    return this.submissionAnswerRepository.find({
      where: {
        page_id: pageId,
        submission_id: In(submissionIds),
      },
      order: {
        submission_id: 'ASC',
        id: 'ASC',
      },
    });
  }

  async createPage(user: TCurrentUser) {
    const page = await this.pageRepository.save({
      account_id: user.id,
      page_name: '未命名页面',
      desc: '',
      tdk: '',
      status: 'draft',
      published_at: null,
      closed_at: null,
    });

    return {
      msg: '页面已创建',
      data: await this.buildPageDetail(page),
    };
  }

  async getPages(user: TCurrentUser): Promise<GetPageListItemResponse[]> {
    const pages = await this.pageRepository.find({
      where: { account_id: user.id },
      order: { created_at: 'DESC' },
    });
    const submissionCountMap = await this.getSubmissionCountMap(
      pages.map((page) => page.id),
    );

    return pages.map((page) => ({
      ...page,
      submission_count: submissionCountMap.get(page.id) ?? 0,
    }));
  }

  async getPageDetail(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }

    return this.buildPageDetail(page);
  }

  async updatePage(pageId: number, body: UpdatePageRequest, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }
    this.assertPageStatus(page, 'draft', '仅未发布页面允许编辑');

    const { components, ...pageFields } = body;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Page, page.id, {
        ...pageFields,
        updated_at: new Date(),
      });

      await queryRunner.manager.delete(Component, { page_id: page.id });

      const nextComponents = components.map((component, index) => {
        const normalized = sanitizeComponentOptions(component);
        return {
          ...normalized,
          page_id: page.id,
          sort_index: index,
        };
      });

      if (nextComponents.length > 0) {
        await queryRunner.manager.insert(
          Component,
          nextComponents as Array<Partial<Component>>,
        );
      }

      await queryRunner.commitTransaction();

      const updatedPage = await this.getOwnedPage(page.id, user.id);
      if (!updatedPage) {
        throw new HttpError(404, '页面不存在');
      }

      return {
        msg: '页面已保存',
        data: await this.buildPageDetail(updatedPage),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpError(500, `页面保存失败: ${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async publishPage(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }
    this.assertPageStatus(page, 'draft', '仅未发布页面允许发布');

    await this.pageRepository.update(page.id, {
      status: 'published',
      published_at: new Date(),
      closed_at: null,
      updated_at: new Date(),
    });

    return { msg: '页面已发布' };
  }

  async closePage(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }
    this.assertPageStatus(page, 'published', '仅已发布页面允许关闭');

    await this.pageRepository.update(page.id, {
      status: 'closed',
      closed_at: new Date(),
      updated_at: new Date(),
    });

    return { msg: '页面已关闭' };
  }

  async reopenPage(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }
    this.assertPageStatus(page, 'closed', '仅已关闭页面允许重新打开');

    await this.pageRepository.update(page.id, {
      status: 'published',
      published_at: new Date(),
      closed_at: null,
      updated_at: new Date(),
    });

    return { msg: '页面已重新打开' };
  }

  async deletePage(pageId: number, user: TCurrentUser) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Page, page.id);
      await queryRunner.commitTransaction();

      return { msg: '页面已删除' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpError(500, `页面删除失败: ${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getPublicReleaseData(id?: number | null) {
    if (!id) {
      return null;
    }

    const page = await this.pageRepository.findOneBy({ id });
    if (!page || page.status === 'draft') {
      return null;
    }

    if (page.status === 'closed') {
      return {
        ...page,
        components: [],
        submission_count: await this.getSubmissionCount(page.id),
      };
    }

    return this.buildPageDetail(page);
  }

  async isQuestionDataPosted(key: string, pageId: number) {
    const page = await this.pageRepository.findOneBy({ id: pageId });
    if (!page || page.status !== 'published') {
      return false;
    }

    const isExist = await this.submissionRepository.findOneBy({
      submitter_key: key,
      page_id: pageId,
    });
    return !!isExist;
  }

  async postQuestionData(
    pageId: number,
    body: PostQuestionDataRequest,
    key: string,
  ) {
    const page = await this.pageRepository.findOneBy({ id: pageId });
    if (!page || page.status !== 'published') {
      throw new HttpError(400, '页面当前不可提交');
    }

    const components = await this.getQuestionComponentsForPage(pageId);
    const componentMap = new Map(components.map((component) => [component.id, component]));
    const providedIds = new Set<number>();
    const answerRows: Array<Partial<SubmissionAnswer>> = [];

    for (const item of body.props) {
      if (providedIds.has(item.id)) {
        throw new HttpError(400, '问卷数据中存在重复组件');
      }
      providedIds.add(item.id);

      const component = componentMap.get(item.id);
      if (!component) {
        throw new HttpError(400, '问卷数据中存在无效组件');
      }

      if (component.type === 'input' || component.type === 'textArea') {
        if (Array.isArray(item.value)) {
          throw new HttpError(400, '文本题答案格式错误');
        }

        answerRows.push({
          page_id: pageId,
          component_id: component.id,
          component_type: component.type,
          value_text: item.value,
          value_option_id: null,
        });
        continue;
      }

      const optionIds = new Set(
        this.getQuestionOptionItems(component).map((option) => option.id),
      );

      if (component.type === 'radio') {
        if (Array.isArray(item.value)) {
          throw new HttpError(400, '单选题答案格式错误');
        }

        if (item.value && !optionIds.has(item.value)) {
          throw new HttpError(400, '单选题答案无效');
        }

        answerRows.push({
          page_id: pageId,
          component_id: component.id,
          component_type: component.type as TQuestionComponentType,
          value_text: null,
          value_option_id: item.value || null,
        });
        continue;
      }

      if (!Array.isArray(item.value)) {
        throw new HttpError(400, '多选题答案格式错误');
      }

      const seenValueIds = new Set<string>();
      for (const value of item.value) {
        if (!optionIds.has(value)) {
          throw new HttpError(400, '多选题答案无效');
        }

        if (seenValueIds.has(value)) {
          continue;
        }
        seenValueIds.add(value);

        answerRows.push({
          page_id: pageId,
          component_id: component.id,
          component_type: component.type as TQuestionComponentType,
          value_text: null,
          value_option_id: value,
        });
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const insertResult = await queryRunner.manager.insert(Submission, {
        page_id: pageId,
        submitter_key: key,
      });
      const submissionId = Number(
        insertResult.identifiers[0]?.id ?? insertResult.raw?.insertId,
      );

      if (!Number.isFinite(submissionId)) {
        throw new HttpError(500, '提交记录创建失败');
      }

      if (answerRows.length > 0) {
        await queryRunner.manager.insert(
          SubmissionAnswer,
          answerRows.map((item) => ({
            ...item,
            submission_id: submissionId,
          })),
        );
      }

      await queryRunner.commitTransaction();
      return { msg: '提交成功！感谢您的参与！' };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (isDuplicateEntryError(error)) {
        return { msg: '提交成功！感谢您的参与！' };
      }

      if (error instanceof HttpError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      throw new HttpError(500, `问卷提交失败: ${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getQuestionComponents(user: TCurrentUser, pageId: number) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }

    return this.getQuestionComponentsForPage(page.id);
  }

  async getSubmissionRecords(
    user: TCurrentUser,
    pageId: number,
    query: {
      limit: number;
      cursor: SubmissionCursor | null;
    },
  ): Promise<SubmissionRecordPageResponse> {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }

    const components = await this.getQuestionComponentsForPage(page.id);
    const qb = this.submissionRepository
      .createQueryBuilder('submission')
      .where('submission.page_id = :pageId', { pageId: page.id })
      .orderBy('submission.created_at', 'DESC')
      .addOrderBy('submission.id', 'DESC')
      .take(query.limit + 1);

    if (query.cursor) {
      qb.andWhere(
        '(submission.created_at < :createdAt OR (submission.created_at = :createdAt AND submission.id < :cursorId))',
        {
          createdAt: query.cursor.createdAt,
          cursorId: query.cursor.id,
        },
      );
    }

    const submissions = await qb.getMany();
    const hasMore = submissions.length > query.limit;
    const pageSubmissions = hasMore ? submissions.slice(0, query.limit) : submissions;
    const answers = await this.getSubmissionAnswersBySubmissionIds(
      page.id,
      pageSubmissions.map((submission) => submission.id),
    );
    const answerRecordMap = this.buildSubmissionAnswerRecordMap(
      pageSubmissions,
      components,
      answers,
    );

    return {
      items: pageSubmissions.map((submission) => ({
        submissionId: submission.id,
        submittedAt: submission.created_at.toISOString(),
        answers: answerRecordMap.get(submission.id) ?? {},
      })),
      nextCursor:
        hasMore && pageSubmissions.length > 0
          ? encodeSubmissionCursor(pageSubmissions[pageSubmissions.length - 1])
          : null,
      hasMore,
    };
  }

  async getQuestionDistribution(
    user: TCurrentUser,
    pageId: number,
    componentId: number,
  ): Promise<QuestionDistributionResponse> {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }

    const component = await this.componentRepository.findOneBy({
      id: componentId,
      page_id: page.id,
    });
    if (!component) {
      throw new HttpError(404, '组件不存在');
    }

    if (component.type !== 'radio' && component.type !== 'checkbox') {
      throw new HttpError(400, '当前题型不支持结果分布统计');
    }

    const [totalSubmissions, countRows] = await Promise.all([
      this.getSubmissionCount(page.id),
      this.submissionAnswerRepository
        .createQueryBuilder('answer')
        .select('answer.value_option_id', 'value_option_id')
        .addSelect('COUNT(*)', 'count')
        .where('answer.page_id = :pageId', { pageId: page.id })
        .andWhere('answer.component_id = :componentId', { componentId })
        .andWhere('answer.value_option_id IS NOT NULL')
        .andWhere("answer.value_option_id <> ''")
        .groupBy('answer.value_option_id')
        .getRawMany<DistributionCountRow>(),
    ]);

    const countMap = new Map(
      countRows
        .filter((row) => row.value_option_id)
        .map((row) => [String(row.value_option_id), Number(row.count)]),
    );

    return {
      componentId: component.id,
      componentType: component.type,
      title: String(component.options?.title ?? '默认显示的标题'),
      totalSubmissions,
      options: this.getQuestionOptionItems(component).map((option) => {
        const count = countMap.get(option.id) ?? 0;
        const percent =
          totalSubmissions === 0
            ? 0
            : Number(((count / totalSubmissions) * 100).toFixed(2));

        return {
          optionId: option.id,
          label: option.value,
          count,
          percent,
        };
      }),
    };
  }

  async streamSubmissionCsv(user: TCurrentUser, pageId: number, res: Response) {
    const page = await this.getOwnedPage(pageId, user.id);
    if (!page) {
      throw new HttpError(404, '页面不存在');
    }

    const components = await this.getQuestionComponentsForPage(page.id);
    const filename = `${sanitizeCsvFilename(page.page_name, page.id)}-submissions.csv`;

    res.status(200);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    res.setHeader('Cache-Control', 'no-store');

    const headerCells = [
      'submission_id',
      'submitted_at',
      ...components.map((component) =>
        String(component.options?.title ?? '默认展示的标题'),
      ),
    ];

    res.write('\uFEFF');
    res.write(`${headerCells.map(escapeCsvCell).join(',')}\r\n`);

    let afterId = 0;

    while (true) {
      const submissions = await this.submissionRepository
        .createQueryBuilder('submission')
        .where('submission.page_id = :pageId', { pageId: page.id })
        .andWhere('submission.id > :afterId', { afterId })
        .orderBy('submission.id', 'ASC')
        .take(CSV_BATCH_SIZE)
        .getMany();

      if (submissions.length === 0) {
        break;
      }

      const answers = await this.getSubmissionAnswersBySubmissionIds(
        page.id,
        submissions.map((submission) => submission.id),
      );
      const answerRecordMap = this.buildSubmissionAnswerRecordMap(
        submissions,
        components,
        answers,
      );

      for (const submission of submissions) {
        const answerRecord = answerRecordMap.get(submission.id) ?? {};
        const rowCells = [
          String(submission.id),
          submission.created_at.toISOString(),
          ...components.map((component) => answerRecord[String(component.id)] ?? ''),
        ];
        res.write(`${rowCells.map(escapeCsvCell).join(',')}\r\n`);
      }

      afterId = submissions[submissions.length - 1].id;
    }

    res.end();
  }
}
