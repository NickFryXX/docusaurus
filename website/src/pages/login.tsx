/**
 * 登录页面
 */
import type {ReactNode} from 'react';
import {useState, useCallback, useEffect} from 'react';
import {useHistory} from '@docusaurus/router';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Layout from '@theme/Layout';
import {useAuth} from '@site/src/contexts/AuthContext';
import styles from './login.module.css';

export default function Login(): ReactNode {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const history = useHistory();
  
  // 必须在顶层调用 hook
  const auth = useAuth();

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      setIsClient(true);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth?.login) {
        setError('认证系统未准备好，请稍后重试');
        return;
      }

      setError(null);
      setLoading(true);

      try {
        await auth.login(username, password);
        // 登录成功后，如果 context 存在，等待一下让状态更新
        // 然后跳转到首页
        if (auth.refreshUser) {
          // 如果 context 存在，刷新用户状态
          await auth.refreshUser();
        }
        // 使用 history.push 而不是 window.location，这样不会完全刷新页面
        // 但如果 context 不存在，上面的 login 函数会使用 window.location.href
        setTimeout(() => {
          history.push('/');
        }, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : '登录失败，请检查用户名和密码');
        setLoading(false);
      }
    },
    [username, password, auth, history]
  );

  // SSR 时返回简单的占位符
  if (!isClient) {
    return (
      <Layout title="登录" description="用户登录页面">
        <div className={styles.container}>
          <div className={styles.loginBox}>
            <h1 className={styles.title}>登录</h1>
            <div style={{textAlign: 'center', padding: '2rem'}}>加载中...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // 如果认证系统正在初始化，且用户已登录（有 user），说明正在验证已登录状态
  // 如果 loading 为 true 但没有 user，且没有 token，说明用户未登录，直接显示登录表单
  if (auth.loading) {
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('auth_token');
    // 如果有 token 但还在加载，说明正在验证已登录状态，显示加载
    // 如果没有 token，说明用户未登录，直接显示登录表单
    if (hasToken) {
      return (
        <Layout title="登录" description="用户登录页面">
          <div className={styles.container}>
            <div className={styles.loginBox}>
              <h1 className={styles.title}>登录</h1>
              <div style={{textAlign: 'center', padding: '2rem'}}>验证登录状态中...</div>
            </div>
          </div>
        </Layout>
      );
    }
    // 没有 token，直接显示登录表单，不等待
  }

  return (
    <Layout title="登录" description="用户登录页面">
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h1 className={styles.title}>登录</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                required
                autoComplete="username"
                placeholder="请输入用户名"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="current-password"
                placeholder="请输入密码"
              />
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          <div className={styles.footer}>
            <p className={styles.hint}>
              默认账号：
              <br />
              开发者：developer001 / 123456
              <br />
              管理员：管理员001 / Poisson@123
              <br />
              Root：jiuwen_root / Poisson@123
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

