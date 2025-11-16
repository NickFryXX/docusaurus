/**
 * 管理台页面（管理员和 root 用户可访问）
 */
import type {ReactNode} from 'react';
import {useState, useEffect, useCallback} from 'react';
import {useHistory} from '@docusaurus/router';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Layout from '@theme/Layout';
import {useAuth} from '@site/src/contexts/AuthContext';
import {adminApi, type SiteConfig, type News} from '@site/src/utils/api';
import styles from './admin.module.css';

export default function Admin(): ReactNode {
  // 使用 useAuth hook 获取认证状态
  // 注意：不要解构，直接使用 auth 对象，确保获取最新的值
  const auth = useAuth();
  const history = useHistory();
  
  // 所有 Hooks 必须在组件顶层调用，不能在条件语句中
  const [activeTab, setActiveTab] = useState<'config' | 'news'>('config');
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 简化逻辑：直接使用 auth.isAdmin 判断，不依赖 _isRealContext 标记
  // 如果 auth.isAdmin 为 true，说明用户是管理员；否则显示加载或无权限

  // 调试信息
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      console.log('[Admin] Auth state:', {
        loading: auth.loading,
        isAdmin: auth.isAdmin,
        user: auth.user ? {id: auth.user.id, username: auth.user.username, role: auth.user.role} : null,
        tokenExists: typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false,
        authIsAdmin: auth.isAdmin,
        authIsRoot: auth.isRoot,
      });
      // 如果用户未登录，尝试手动刷新（但只尝试一次，避免无限循环）
      if (!auth.loading && !auth.user && !refreshAttempted && typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
        console.log('[Admin] User is null but token exists, calling refreshUser...');
        setRefreshAttempted(true);
        auth.refreshUser();
      }
    }
  }, [auth.loading, auth.isAdmin, auth.user, auth, refreshAttempted]);

  // 检查权限（只有在加载完成且确认不是管理员时才重定向）
  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) {
      return;
    }

    // 如果还在加载中，不执行重定向
    if (auth.loading) {
      return;
    }

    // 只有在加载完成且确认不是管理员时才重定向
    // 如果 user 为 null 但 token 存在，说明可能还在验证中，不立即重定向
    if (!auth.isAdmin && auth.user === null && typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
      // token 存在但 user 为 null，可能还在验证中，等待一下
      console.log('[Admin] Waiting for user verification...');
      return;
    }

    // 确认不是管理员且没有 token，才重定向
    if (!auth.isAdmin && (!auth.user || auth.user.role !== 'admin' && auth.user.role !== 'root')) {
      console.log('[Admin] Not admin, redirecting to home...');
      history.push('/');
    }
  }, [auth.isAdmin, auth.loading, history, auth.user]);

  // 加载配置
  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getConfigs();
      setConfigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载新闻
  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getNewsList();
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载新闻失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM || !auth.isAdmin) {
      return;
    }

    if (activeTab === 'config') {
      loadConfigs();
    } else {
      loadNews();
    }
  }, [activeTab, auth.isAdmin, loadConfigs, loadNews]);

  // SSR 时不渲染
  if (!ExecutionEnvironment.canUseDOM) {
    return (
      <Layout title="管理台" description="网站管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>加载中...</div>
        </div>
      </Layout>
    );
  }
  
  // 检查是否是 fallback 值（Context 未准备好）
  // fallback 值的特征是：没有 _isRealContext 标记
  const isFallbackValue = typeof (auth as any)._isRealContext === 'undefined';
  const tokenExists = typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false;
  
  // 如果 Context 未准备好（fallback 值），显示加载中
  if (isFallbackValue) {
    console.log('[Admin] Context not ready (fallback value), waiting...');
    return (
      <Layout title="管理台" description="网站管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>初始化中...</div>
        </div>
      </Layout>
    );
  }
  
  // 如果正在加载认证状态，显示加载中
  // 注意：如果 auth.isAdmin 为 false 但 token 存在，可能还在验证中，也显示加载中
  const isWaitingForAuth = auth.loading || (!auth.isAdmin && tokenExists && auth.user === null);
  
  if (isWaitingForAuth) {
    console.log('[Admin] Waiting for auth, loading:', auth.loading, 'isAdmin:', auth.isAdmin, 'user:', auth.user);
    return (
      <Layout title="管理台" description="网站管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>验证权限中...</div>
        </div>
      </Layout>
    );
  }

  // 如果正在加载认证状态，显示加载提示（但设置超时，避免无限等待）
  // 使用 auth.loading 而不是解构的 authLoading，确保获取最新值
  const [authTimeout, setAuthTimeout] = useState(false);
  useEffect(() => {
    if (auth.loading) {
      const timer = setTimeout(() => {
        setAuthTimeout(true);
      }, 3000); // 3秒超时
      return () => clearTimeout(timer);
    }
    setAuthTimeout(false);
    return undefined;
  }, [auth.loading]);

  if (auth.loading && !authTimeout) {
    console.log('[Admin] Showing loading - auth.loading is true');
    return (
      <Layout title="管理台" description="网站管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>验证权限中...</div>
        </div>
      </Layout>
    );
  }

  // 如果超时或未授权，显示错误或重定向
  // 只有在确认不是管理员且没有 token 时才显示无权限
  // 如果 token 存在但 user 为 null，说明可能还在验证中，显示加载中
  // 使用 auth.isAdmin 而不是解构的 isAdmin，确保获取最新值
  // 添加调试信息 - 每次渲染都记录，以便追踪问题
  console.log('[Admin] Render check - auth.isAdmin:', auth.isAdmin, 'auth.user:', auth.user, 'auth.loading:', auth.loading);
  console.log('[Admin] Full auth object:', {
    isAdmin: auth.isAdmin,
    isRoot: auth.isRoot,
    loading: auth.loading,
    user: auth.user ? {id: auth.user.id, username: auth.user.username, role: auth.user.role} : null,
    // 添加对象引用信息，检查是否是同一个对象
    authObjectId: Object.keys(auth).join(','),
  });
  
  // 如果正在加载，显示加载中
  if (auth.loading) {
    console.log('[Admin] Showing loading - auth.loading is true');
    return (
      <Layout title="管理台" description="网站管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>验证权限中...</div>
        </div>
      </Layout>
    );
  }
  
  // 如果 token 存在但 user 为 null，说明可能还在验证中，显示加载中
  // 但只等待一段时间，避免无限等待
  const [waitingForAuth, setWaitingForAuth] = useState(true);
  useEffect(() => {
    if (auth.user || !localStorage.getItem('auth_token')) {
      setWaitingForAuth(false);
    } else {
      // 如果 2 秒后还没有用户信息，停止等待
      const timer = setTimeout(() => {
        setWaitingForAuth(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [auth.user]);
  
  // 关键修复：使用 useEffect 监听 auth.isAdmin 的变化，并添加调试信息
  useEffect(() => {
    console.log('[Admin] Auth state changed in useEffect:', {
      isAdmin: auth.isAdmin,
      user: auth.user,
      loading: auth.loading,
      // 添加更详细的调试信息
      contextUser: auth.user ? {id: auth.user.id, username: auth.user.username, role: auth.user.role} : null,
    });
  }, [auth.isAdmin, auth.user, auth.loading]);
  
  // 直接使用 auth 对象的属性，确保获取最新值
  // 不要解构，直接使用，让 React 在 context 更新时自动重新渲染
  // 注意：这里直接使用 auth.isAdmin 等属性，而不是创建新的变量
  // 这样可以确保每次渲染时都获取最新的值
  
  // 如果正在加载，显示加载中
  if (auth.loading) {
    console.log('[Admin] Showing loading - auth.loading is true');
    return (
      <Layout title="管理台" description="网站管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>验证权限中...</div>
        </div>
      </Layout>
    );
  }
  
  // 如果 token 存在但 user 为 null，说明可能还在验证中，显示加载中
  if (!auth.isAdmin && auth.user === null && waitingForAuth && typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
    console.log('[Admin] Showing "验证权限中..." - user is null but token exists, waiting...');
    return (
      <Layout title="管理台" description="网站管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>验证权限中...</div>
        </div>
      </Layout>
    );
  }
  
  // 确认不是管理员，显示无权限
  // 关键：直接使用 auth.isAdmin，不要使用任何中间变量
  if (!auth.isAdmin) {
    console.log('[Admin] Showing "无权限访问" - not admin, user:', auth.user, 'auth.isAdmin:', auth.isAdmin);
    return (
      <Layout title="管理台" description="网站管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>无权限访问，正在跳转...</div>
        </div>
      </Layout>
    );
  }
  
  console.log('[Admin] Rendering admin page - user is admin, user:', auth.user);

  return (
    <Layout title="管理台" description="网站管理后台">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>管理台</h1>
          <p className={styles.subtitle}>管理网站配置和新闻资讯</p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'config' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('config')}>
            网站配置
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'news' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('news')}>
            新闻管理
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'config' && (
            <ConfigManagement configs={configs} loading={loading} onRefresh={loadConfigs} />
          )}
          {activeTab === 'news' && (
            <NewsManagement news={news} loading={loading} onRefresh={loadNews} />
          )}
        </div>
      </div>
    </Layout>
  );
}

// 配置管理组件
function ConfigManagement({
  configs,
  loading,
  onRefresh,
}: {
  configs: SiteConfig[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (config: SiteConfig) => {
    setEditingKey(config.key);
    setEditValue(config.value || '');
  };

  const handleSave = async (key: string) => {
    try {
      await adminApi.updateConfig(key, {value: editValue});
      setEditingKey(null);
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : '保存失败');
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.configList}>
      {configs.map((config) => (
        <div key={config.key} className={styles.configItem}>
          <div className={styles.configHeader}>
            <h3>{config.key}</h3>
            {config.description && <p className={styles.configDesc}>{config.description}</p>}
          </div>
          {editingKey === config.key ? (
            <div className={styles.configEdit}>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className={styles.textarea}
                rows={5}
              />
              <div className={styles.configActions}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => handleSave(config.key)}>
                  保存
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={handleCancel}>
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.configDisplay}>
              <p>{config.value || '(空)'}</p>
              <button
                className={styles.btnEdit}
                onClick={() => handleEdit(config)}>
                编辑
              </button>
            </div>
          )}
        </div>
      ))}
      {configs.length === 0 && (
        <div className={styles.empty}>暂无配置项</div>
      )}
    </div>
  );
}

// 新闻管理组件
function NewsManagement({
  news,
  loading,
  onRefresh,
}: {
  news: News[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
  });

  const handleCreate = async () => {
    try {
      await adminApi.createNews(formData);
      setShowCreateForm(false);
      setFormData({title: '', content: '', author: ''});
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : '创建失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条新闻吗？')) {
      return;
    }
    try {
      await adminApi.deleteNews(id);
      onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : '删除失败');
    }
  };

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.newsList}>
      <div className={styles.newsHeader}>
        <h2>新闻列表</h2>
        <button
          className={styles.btnPrimary}
          onClick={() => setShowCreateForm(true)}>
          新增新闻
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createForm}>
          <h3>新增新闻</h3>
          <div className={styles.formGroup}>
            <label>标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>作者</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>内容</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className={styles.textarea}
              rows={10}
            />
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnPrimary} onClick={handleCreate}>
              创建
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => {
                setShowCreateForm(false);
                setFormData({title: '', content: '', author: ''});
              }}>
              取消
            </button>
          </div>
        </div>
      )}

      <div className={styles.newsItems}>
        {news.map((item) => (
          <div key={item.id} className={styles.newsItem}>
            <div className={styles.newsItemHeader}>
              <h3>{item.title}</h3>
              <span className={styles.newsMeta}>
                {item.author} · {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className={styles.newsContent}>{item.content}</p>
            <div className={styles.newsActions}>
              <button
                className={styles.btnDanger}
                onClick={() => handleDelete(item.id)}>
                删除
              </button>
            </div>
          </div>
        ))}
        {news.length === 0 && (
          <div className={styles.empty}>暂无新闻</div>
        )}
      </div>
    </div>
  );
}

