import type {ReactNode} from 'react';
import {useState, useEffect, useRef} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import Breadcrumbs from '@site/src/components/Breadcrumbs';
import articalBox from '@site/src/css/artical.module.css';
import ReactMarkdown from 'react-markdown';
import {useLocation} from 'react-router-dom';
import {blogApi, type BlogListResponse, type Blog} from '@site/src/utils/api';

export default function BlogArticlePage(): ReactNode {
  // 相关文章数据
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const blogId = params.get('id') || '';

  // 使用useState和useEffect来管理内容
  const [blogContent, setBlogContent] = useState<Blog | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (!blogId) {
      setError('缺少博客ID参数');
      return;
    }

    const loadBlogContent = async () => {
      try {
        setLoading(true);
        const blog = await blogApi.getBlogDetail(Number(blogId));
        setBlogContent(blog);
        const blogList = await blogApi.getBlogList();
        setRelatedArticles(blogList.items.filter(item => item.id !== Number(blogId)).slice(0, 5) || []);
      } catch (err) {
        console.error('加载博客内容失败:', err);
        setError(err instanceof Error ? err.message : '加载博客内容失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadBlogContent();
  }, [blogId]);

  // 监听滚动事件，控制回到顶部按钮的显示
  useEffect(() => {
    const handleScroll = () => {
      // 当滚动超过300px时显示回到顶部按钮
      setShowBackToTop(window.scrollY > 300);
    };

    // 添加滚动监听
    window.addEventListener('scroll', handleScroll);
    
    // 组件卸载时移除监听
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 平滑滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Layout
      title="博客"
      description="九问平台博客">
      <main className="container margin-vert--lg">
        <Breadcrumbs items={[{label: '博客', to: '/blog-page'}, {label: blogContent?.title || '博客详情', to: `/blogs/blog-artical?id=${encodeURIComponent(blogId)}`}]} />
        <div className={articalBox.articalContainer}>
            <div className={articalBox.leftRow}>
                {/* 左侧边栏 */}
                {/* 作者信息 */}
                <div className={articalBox.authorPic}>
                    {/* 根据作者名称选择不同的图片 */}
                    {blogContent?.author === "openJiuwen官方" ? (
                        <img src="/img/blog/artical/jiuwen_logo.png" alt="作者" className={articalBox.authorPicImg} />
                    ) : (
                        <img src="/img/blog/artical/default_author.png" alt="作者" className={articalBox.authorPicImg} />
                    )}
                </div>
                <div className={articalBox.authorMedia}>
                    <img src="/img/blog/artical/mail.png" alt="邮件" className={articalBox.Icon} />
                    <img src="/img/blog/artical/gitee.svg" alt="Gitee" className={articalBox.Icon} />
                    <img src="/img/blog/artical/wechat.png" alt="微信" className={articalBox.Icon} />
                </div>
                <div className={articalBox.relatedArticles}>
                    <Heading as="h3" className={articalBox.relatedArticlesTitle}>相关文章</Heading>
                    <ul className={articalBox.relatedArticlesList}>
                        {relatedArticles.map((article, index) => (
                            <li key={index}>
                                <a href={`/blogs/blog-artical?id=${encodeURIComponent(article.id)}`}>{article.title}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className={articalBox.rightRow}>
                {/* 右侧边栏 */}
                <div className={articalBox.articalContent}>
                    <h1 className={articalBox.articalTitle}>{blogContent?.title || '博客详情'}</h1>
                    <p className={articalBox.articalMeta}>
                        作者：{blogContent?.author || '未知'} &nbsp;&nbsp;
                        查看次数：{blogContent?.view_count || 0} &nbsp;&nbsp;
                        更新时间：{blogContent?.updated_at ? blogContent.updated_at.split('T')[0] : '未知'} &nbsp;&nbsp;
                        创建时间：{blogContent?.created_at ? blogContent.created_at.split('T')[0] : '未知'}
                    </p>
                    <div className={articalBox.articalBody}>
                        {loading ? (
                          <div className={articalBox.loading}>加载中...</div>
                        ) : (
                          <div>
                            <ReactMarkdown>{blogContent?.content || '暂无内容'}</ReactMarkdown>
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        {/* 回到顶部 - 浮动图标 */}
        <div 
          className={`${articalBox.backToTop} ${showBackToTop ? articalBox.visible : ''}`}
          onClick={scrollToTop}
          aria-label="回到顶部"
        >
            <span className={articalBox.backToTopText}>回到顶部</span>
            <svg className={articalBox.backToTopIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V20M4 12L12 4M12 4L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
      </main>
    </Layout>
  );
}
