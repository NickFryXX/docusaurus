/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {useState, useEffect} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import Breadcrumbs from '@site/src/components/Breadcrumbs';
import blogBox from '@site/src/css/blog.module.css'
import {blogApi, type BlogListResponse, type Blog} from '@site/src/utils/api';

export default function BlogPage(): ReactNode {
  const monthName = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', 
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };
  
  const [blogList, setBlogList] = useState<BlogListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogList = async () => {
      try {
        setLoading(true);
        const blogList = await blogApi.getBlogList();
        
        // 验证响应格式是否正确
        if (blogList && typeof blogList === 'object' && Array.isArray(blogList.items)) {
          setBlogList(blogList);
        } else {
          console.error('博客列表数据格式错误:', blogList);
          setError('博客列表数据格式错误');
          
          // 设置默认的空博客列表，避免渲染错误
          setBlogList({ items: [], total: 0 } as BlogListResponse);
        }
      } catch (err) {
        console.error('加载博客列表失败:', err);
        setError(err instanceof Error ? 
          (err.message.includes('Unexpected token') ? 'API返回格式错误，无法解析数据' : err.message) : 
          '加载博客列表失败，请稍后重试');
        
        // 设置默认的空博客列表，避免渲染错误
        setBlogList({ items: [], total: 0 } as BlogListResponse);
      } finally {
        setLoading(false);
      }
    };

    // 添加错误边界处理
    try {
      loadBlogList();
    } catch (globalError) {
      console.error('全局错误:', globalError);
      setError('页面加载时发生错误');
      setLoading(false);
      setBlogList({ items: [], total: 0 } as BlogListResponse);
    }
  }, []);

  return (
    <Layout
      title="博客"
      description="九问平台博客">
      <main className="container margin-vert--lg">
        <Breadcrumbs items={[{label: '博客'}]} />
        <Heading as="h1" className={blogBox.blogTitle}>
          <Translate>博客</Translate>
        </Heading>
        <p className={blogBox.blogDescription}>
          <Translate>
            这里提供九问平台的最新动态、技术文章和最佳实践，帮助您快速上手和深入理解平台功能。
          </Translate>
        </p>
        {loading ? (
          <div className="text--center padding-vert--xl">
            <p><Translate>加载中...</Translate></p>
          </div>
        ) : error ? (
          <div className="alert alert--danger">
            <h4><Translate>加载失败</Translate></h4>
            <p>{error}</p>
            <Link to="/" className="button button--primary">
              <Translate>返回首页</Translate>
            </Link>
          </div>
        ) : blogList?.items?.length !== 0 ? (
          <>
            <div className={blogBox.blogContainer}>
              <div className={blogBox.blogItems}>
                {/* 遍历blogList */}
                {blogList?.items?.map((item: Blog) => {
                  // 格式化日期，确保日期有前导零，处理ISO格式(2025-11-21T00:00:00)
                  const dateString = item.updated_at || item.created_at;
                  // 先移除T后面的时间部分
                  const dateWithoutTime = dateString.includes('T') ? dateString.split('T')[0] : dateString;
                  const dateParts = dateWithoutTime?.split('-') ?? [];
                  if (dateParts.length !== 3) {
                    return null; // 无效日期格式时跳过
                  }
                  const [year = '', month = '', day = ''] = dateParts;
                  const formattedDay = day.padStart(2, '0');
                  const formattedMonth = month.padStart(2, '0');

                  return (
                    <div className={blogBox.blogItem} key={item.id}>
                      <div className={blogBox.blogItemMeta}>
                        <div className={blogBox.blogItemMetaBlock}>
                          <span className={blogBox.blogItemDate}>
                            <div className={blogBox.blogItemDateNumber}>{formattedDay}</div>
                            <div className={blogBox.blogItemDateSeparator}>/</div>
                            <div className={blogBox.blogItemDateYearBlock}>
                              <div className={blogBox.blogItemDateMonth}>{monthName[formattedMonth as keyof typeof monthName]}</div>
                              <div className={blogBox.blogItemDateYear}>{year}</div>
                            </div>
                          </span>
                        </div>
                      </div>
                      <div className={blogBox.blogItemContentBlock}>
                        <div className={blogBox.blogItemContent}>
                          <h3 className={blogBox.blogItemTitleWrapper}>
                            <div className={blogBox.blogItemTitleText}>
                              <a href={`/blogs/blog-artical?id=${encodeURIComponent(item.id)}`}>{item.title}</a>
                            </div>
                            <div className={blogBox.blogItemSubWrapper}>
                              <div className={blogBox.blogItemAuthor}>
                                <img src="/img/blog/author.png" alt="user" className={blogBox.blogItemAuthorIcon} />
                                <span>{item.author}</span>
                              </div>
                              <div className={blogBox.blogItemView}>
                                <img src="/img/blog/watched.png" alt="view" className={blogBox.blogItemViewIcon} />
                                <span className={blogBox.blogItemViewCount}>{item.view_count}</span>
                              </div>
                            </div>
                          </h3>
                          <div className={blogBox.blogItemStyle}>
                            <Translate>
                              {item.excerpt ? item.excerpt : item.content?.slice(0, 100) + '...'}
                            </Translate>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={blogBox.blogCheckMore}>
              <span> 查看更多博客 </span>
              <i className="el-icon" style={{ width: '24px', height: '24px', marginBottom: '2px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" transform="translate(0, 1)">
                  <path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"></path>
                </svg>
              </i>
            </div>
          </>
        ) : (
          <div className="alert alert--warning">
            <p><Translate>未找到文档内容</Translate></p>
            <Link to="/" className="button button--primary">
              <Translate>返回首页</Translate>
            </Link>
          </div>
        )}
      </main>
    </Layout>
  );
}

