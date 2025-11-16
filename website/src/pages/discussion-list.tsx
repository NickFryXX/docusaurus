/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {useState, useEffect} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Breadcrumbs from '@site/src/components/Breadcrumbs';
import {discussionsApi, type Discussion} from '@site/src/utils/api';
import clsx from 'clsx';
import styles from './discussion.module.css';

const getCategoryBadgeClass = (category: string) => {
  const categoryMap: Record<string, string> = {
    usage: 'badge--success',
    bug: 'badge--danger',
    feature: 'badge--info',
    other: 'badge--secondary',
  };
  return categoryMap[category] || 'badge--secondary';
};

const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    usage: '使用问题',
    bug: 'Bug 反馈',
    feature: '功能建议',
    other: '其他',
  };
  return categoryMap[category] || category;
};

export default function DiscussionList(): ReactNode {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  useEffect(() => {
    // 只在客户端执行 API 调用，避免 SSR 问题
    // 使用 typeof window 检查更可靠
    if (typeof window === 'undefined') {
      console.log('[DiscussionList] SSR environment, skipping API call');
      return;
    }

    console.log('[DiscussionList] Client environment, starting API call');
    
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: {
          limit?: number;
          category?: string;
          status?: string;
        } = {
          limit: 50,
        };
        
        if (category !== 'all') {
          params.category = category;
        }
        if (status !== 'all') {
          params.status = status;
        }
        
        console.log('[DiscussionList] Fetching discussions with params:', params);
        const response = await discussionsApi.getList(params);
        console.log('[DiscussionList] Received response:', response);
        setDiscussions(response.items || []);
      } catch (error) {
        console.error('[DiscussionList] Failed to fetch discussions:', error);
        setError('加载讨论列表失败，请稍后重试');
        setDiscussions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [category, status]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout
      title="讨论区"
      description="九问社区讨论区，查看问题、参与讨论">
      <main className="container margin-vert--lg">
        <Breadcrumbs items={[{label: '社区', to: '/community'}, {label: '讨论区'}]} />
        <div className={styles.listHeader}>
          <Heading as="h1">
            <Translate>讨论区</Translate>
          </Heading>
          <Link
            className="button button--primary button--lg"
            to="/discussion">
            <Translate>创建问题</Translate>
          </Link>
        </div>

        <div className="card margin-top--md">
          <div className="card__body">
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <label className="margin-right--sm">
                  <strong>
                    <Translate>筛选：</Translate>
                  </strong>
                </label>
                <select
                  className={styles.filterSelect}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}>
                  <option value="all">
                    <Translate>全部</Translate>
                  </option>
                  <option value="usage">
                    <Translate>使用问题</Translate>
                  </option>
                  <option value="bug">
                    <Translate>Bug 反馈</Translate>
                  </option>
                  <option value="feature">
                    <Translate>功能建议</Translate>
                  </option>
                  <option value="other">
                    <Translate>其他</Translate>
                  </option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className="margin-right--sm">
                  <strong>
                    <Translate>状态：</Translate>
                  </strong>
                </label>
                <select
                  className={styles.filterSelect}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}>
                  <option value="all">
                    <Translate>全部</Translate>
                  </option>
                  <option value="open">
                    <Translate>待解决</Translate>
                  </option>
                  <option value="solved">
                    <Translate>已解决</Translate>
                  </option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text--center padding-vert--xl">
                <p className="text--muted">
                  <Translate>加载中...</Translate>
                </p>
              </div>
            ) : error ? (
              <div className="text--center padding-vert--xl">
                <p className="text--danger">
                  {error}
                </p>
                <Link
                  className="button button--primary margin-top--md"
                  to="/community">
                  <Translate>返回社区</Translate>
                </Link>
              </div>
            ) : discussions.length > 0 ? (
              <div className={styles.questionsList}>
                {discussions.map((question) => (
                  <Link
                    key={question.id}
                    to={`/discussion-detail?id=${question.id}`}
                    className={styles.questionItem}>
                    <div className={styles.questionHeader}>
                      <span
                        className={clsx(
                          'badge',
                          getCategoryBadgeClass(question.category),
                          styles.categoryBadge,
                        )}>
                        {getCategoryLabel(question.category)}
                      </span>
                      {question.status === 'solved' && (
                        <span className={clsx('badge', 'badge--success', styles.statusBadge)}>
                          <Translate>已解决</Translate>
                        </span>
                      )}
                      {question.status === 'open' && (
                        <span className={clsx('badge', 'badge--warning', styles.statusBadge)}>
                          <Translate>待解决</Translate>
                        </span>
                      )}
                    </div>
                    <h3 className={styles.questionTitle}>{question.title}</h3>
                    <div className={styles.questionMeta}>
                      {question.author && (
                        <span>
                          <Translate
                            values={{
                              author: question.author,
                            }}>
                            {'提问者：{author}'}
                          </Translate>
                        </span>
                      )}
                      <span>
                        <Translate
                          values={{
                            date: formatDate(question.created_at),
                          }}>
                          {'发布时间：{date}'}
                          </Translate>
                      </span>
                      <span>
                        <Translate
                          values={{
                            views: question.view_count,
                          }}>
                          {'浏览：{views}'}
                        </Translate>
                      </span>
                      <span>
                        <Translate
                          values={{
                            replies: question.reply_count,
                          }}>
                          {'回复：{replies}'}
                        </Translate>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text--center padding-vert--xl">
                <p className="text--muted">
                  <Translate>暂无讨论，快来发布第一个问题吧！</Translate>
                </p>
                <Link
                  className="button button--primary margin-top--md"
                  to="/discussion">
                  <Translate>创建问题</Translate>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}

