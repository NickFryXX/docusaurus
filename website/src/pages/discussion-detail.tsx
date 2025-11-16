/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {useState, useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import Breadcrumbs from '@site/src/components/Breadcrumbs';
import {discussionsApi, type Discussion, type DiscussionReply} from '@site/src/utils/api';
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function DiscussionDetail(): ReactNode {
  const location = useLocation();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 只在客户端执行 API 调用，避免 SSR 问题
    if (typeof window === 'undefined') {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        
        if (!id) {
          setError('缺少讨论 ID');
          setLoading(false);
          return;
        }

        const discussionId = parseInt(id, 10);
        if (isNaN(discussionId)) {
          setError('无效的讨论 ID');
          setLoading(false);
          return;
        }

        console.log('[DiscussionDetail] Fetching discussion:', discussionId);
        
        // 并行获取讨论详情和回复列表
        const [discussionData, repliesData] = await Promise.all([
          discussionsApi.getById(discussionId),
          discussionsApi.getReplies(discussionId),
        ]);

        console.log('[DiscussionDetail] Received discussion:', discussionData);
        console.log('[DiscussionDetail] Received replies:', repliesData);
        
        setDiscussion(discussionData);
        setReplies(repliesData.items || []);
      } catch (error) {
        console.error('[DiscussionDetail] Failed to fetch data:', error);
        setError('加载讨论详情失败，请稍后重试');
        setDiscussion(null);
        setReplies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  if (loading) {
    return (
      <Layout title="问题详情" description="查看问题详情">
        <main className="container margin-vert--lg">
          <Breadcrumbs
            items={[
              {label: '社区', to: '/community'},
              {label: '讨论区', to: '/discussion-list'},
              {label: '问题详情'},
            ]}
          />
          <div className="card">
            <div className="card__body">
              <p className="text--center">
                <Translate>加载中...</Translate>
              </p>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (error || !discussion) {
    return (
      <Layout title="问题详情" description="查看问题详情">
        <main className="container margin-vert--lg">
          <Breadcrumbs
            items={[
              {label: '社区', to: '/community'},
              {label: '讨论区', to: '/discussion-list'},
              {label: '问题详情'},
            ]}
          />
          <div className="card">
            <div className="card__body">
              <p className="text--danger">
                {error || <Translate>问题不存在或已被删除</Translate>}
              </p>
              <Link className="button button--primary margin-top--md" to="/discussion-list">
                <Translate>返回列表</Translate>
              </Link>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout
      title={discussion.title}
      description="查看问题详情">
      <main className="container margin-vert--lg">
        <Breadcrumbs
          items={[
            {label: '社区', to: '/community'},
            {label: '讨论区', to: '/discussion-list'},
            {label: discussion.title},
          ]}
        />
        <div className={styles.detailHeader}>
          <Link className="button button--outline" to="/discussion-list">
            <Translate>← 返回列表</Translate>
          </Link>
        </div>

        <div className="card margin-top--md">
          <div className="card__header">
            <div className={styles.questionHeader}>
              <span
                className={clsx(
                  'badge',
                  getCategoryBadgeClass(discussion.category),
                  styles.categoryBadge,
                )}>
                {getCategoryLabel(discussion.category)}
              </span>
              {discussion.status === 'solved' && (
                <span className={clsx('badge', 'badge--success', styles.statusBadge)}>
                  <Translate>已解决</Translate>
                </span>
              )}
              {discussion.status === 'open' && (
                <span className={clsx('badge', 'badge--warning', styles.statusBadge)}>
                  <Translate>待解决</Translate>
                </span>
              )}
            </div>
            <Heading as="h1" className={styles.detailTitle}>
              {discussion.title}
            </Heading>
            <div className={styles.questionMeta}>
              {discussion.author && (
                <span>
                  <Translate
                    values={{
                      author: discussion.author,
                    }}>
                    {'提问者：{author}'}
                  </Translate>
                </span>
              )}
              <span>
                <Translate
                  values={{
                    date: formatDate(discussion.created_at),
                  }}>
                  {'发布时间：{date}'}
                </Translate>
              </span>
              <span>
                <Translate
                  values={{
                    views: discussion.view_count,
                  }}>
                  {'浏览：{views}'}
                </Translate>
              </span>
              <span>
                <Translate
                  values={{
                    replies: discussion.reply_count,
                  }}>
                  {'回复：{replies}'}
                </Translate>
              </span>
            </div>
          </div>
          <div className="card__body">
            <div className={styles.questionContent}>
              <pre className={styles.contentText}>{discussion.content}</pre>
            </div>
          </div>
        </div>

        <div className="margin-top--lg">
          <Heading as="h2" className="margin-bottom--md">
            <Translate
              values={{
                count: replies.length,
              }}>
              {'回复 ({count})'}
            </Translate>
          </Heading>
          {replies.length > 0 ? (
            replies.map((reply) => (
              <div key={reply.id} className="card margin-bottom--md">
                <div className="card__header">
                  <div className={styles.replyHeader}>
                    <strong>{reply.author || '匿名用户'}</strong>
                    <span className="text--sm text--muted">{formatDate(reply.created_at)}</span>
                  </div>
                </div>
                <div className="card__body">
                  <p className={styles.replyContent}>{reply.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              <div className="card__body">
                <p className="text--muted text--center">
                  <Translate>暂无回复</Translate>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card margin-top--lg">
          <div className="card__header">
            <Heading as="h3">
              <Translate>发表回复</Translate>
            </Heading>
          </div>
          <div className="card__body">
            <textarea
              className={clsx('textarea', styles.textarea)}
              rows={5}
              placeholder="请输入您的回复..."
            />
            <div className={styles.formActions}>
              <button className="button button--primary">
                <Translate>提交回复</Translate>
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

