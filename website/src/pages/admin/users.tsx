/**
 * 用户管理页面（仅 root 用户可访问）
 */
import type {ReactNode} from 'react';
import {useState, useEffect, useCallback} from 'react';
import {useHistory} from '@docusaurus/router';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Layout from '@theme/Layout';
import {useAuth} from '@site/src/contexts/AuthContext';
import {usersApi, type User} from '@site/src/utils/api';
import styles from './users.module.css';

export default function UserManagement(): ReactNode {
  const auth = useAuth();
  const {isRoot, loading: authLoading, user} = auth;
  const history = useHistory();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 调试信息
  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      console.log('[UserManagement] Auth state:', {
        loading: authLoading,
        isRoot,
        user: user?.username,
        role: user?.role,
      });
    }
  }, [authLoading, isRoot, user]);

  // 检查权限
  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) {
      return;
    }

    if (!authLoading && !isRoot) {
      history.push('/');
    }
  }, [isRoot, authLoading, history]);

  // 加载用户列表
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getList();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM || !isRoot) {
      return;
    }

    loadUsers();
  }, [isRoot, loadUsers]);

  // SSR 时不渲染
  if (!ExecutionEnvironment.canUseDOM) {
    return (
      <Layout title="用户管理" description="用户管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>加载中...</div>
        </div>
      </Layout>
    );
  }

  // 如果正在加载认证状态，显示加载提示（但设置超时，避免无限等待）
  const [authTimeout, setAuthTimeout] = useState(false);
  useEffect(() => {
    if (authLoading) {
      const timer = setTimeout(() => {
        setAuthTimeout(true);
      }, 3000); // 3秒超时
      return () => clearTimeout(timer);
    }
    setAuthTimeout(false);
    return undefined;
  }, [authLoading]);

  if (authLoading && !authTimeout) {
    return (
      <Layout title="用户管理" description="用户管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>验证权限中...</div>
        </div>
      </Layout>
    );
  }

  // 如果超时或未授权，显示错误或重定向
  if (!isRoot) {
    return (
      <Layout title="用户管理" description="用户管理后台">
        <div className={styles.container}>
          <div className={styles.loading}>无权限访问，正在跳转...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="用户管理" description="用户管理后台">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>用户管理</h1>
          <p className={styles.subtitle}>管理用户账号和权限</p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() => setShowCreateForm(true)}>
            新增用户
          </button>
        </div>

        {showCreateForm && (
          <CreateUserForm
            onSuccess={() => {
              setShowCreateForm(false);
              loadUsers();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {editingUser && (
          <EditUserForm
            user={editingUser}
            onSuccess={() => {
              setEditingUser(null);
              loadUsers();
            }}
            onCancel={() => setEditingUser(null)}
          />
        )}

        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          <div className={styles.userList}>
            {users.map((user) => (
              <div key={user.id} className={styles.userItem}>
                <div className={styles.userInfo}>
                  <h3>{user.username}</h3>
                  <p className={styles.userEmail}>{user.email}</p>
                  <div className={styles.userMeta}>
                    <span className={`${styles.role} ${styles[`role${user.role}`]}`}>
                      {user.role === 'root' ? 'Root' : user.role === 'admin' ? '管理员' : '开发者'}
                    </span>
                    <span className={styles.status}>
                      {user.is_active ? '✓ 激活' : '✗ 禁用'}
                    </span>
                  </div>
                </div>
                <div className={styles.userActions}>
                  <button
                    className={styles.btnEdit}
                    onClick={() => setEditingUser(user)}>
                    编辑
                  </button>
                  <button
                    className={styles.btnDanger}
                    onClick={async () => {
                      if (confirm(`确定要删除用户 ${user.username} 吗？`)) {
                        try {
                          await usersApi.delete(user.id);
                          loadUsers();
                        } catch (err) {
                          alert(err instanceof Error ? err.message : '删除失败');
                        }
                      }
                    }}>
                    删除
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className={styles.empty}>暂无用户</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

// 创建用户表单
function CreateUserForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'developer',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersApi.create(formData);
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : '创建失败');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>新增用户</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>用户名 *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>邮箱 *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>密码 *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>角色 *</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className={styles.select}
          >
            <option value="developer">开发者</option>
            <option value="admin">管理员</option>
            <option value="root">Root</option>
          </select>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            创建
          </button>
          <button type="button" className={styles.btnSecondary} onClick={onCancel}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

// 编辑用户表单
function EditUserForm({
  user,
  onSuccess,
  onCancel,
}: {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    email: user.email,
    role: user.role,
    password: '',
    is_active: user.is_active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData: any = {
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await usersApi.update(user.id, updateData);
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : '更新失败');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>编辑用户：{user.username}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>邮箱 *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>密码（留空不修改）</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>角色 *</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className={styles.select}
          >
            <option value="developer">开发者</option>
            <option value="admin">管理员</option>
            <option value="root">Root</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            />
            激活状态
          </label>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            保存
          </button>
          <button type="button" className={styles.btnSecondary} onClick={onCancel}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

