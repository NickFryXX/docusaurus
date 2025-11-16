/**
 * 登录导航栏项组件
 */
import React, {type ReactNode, useState, useCallback, useEffect, useRef} from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import {useHistory} from '@docusaurus/router';
import {useAuth} from '@site/src/contexts/AuthContext';
import styles from './LoginNavbarItem.module.css';

export default function LoginNavbarItem(props: {
  mobile?: boolean;
}): ReactNode {
  // SSR 时不渲染
  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }

  // 在客户端，安全地获取 auth context
  // useAuth 会处理 context 未定义的情况，返回安全的默认值
  const {user, loading, logout} = useAuth();
  const history = useHistory();
  const [showDropdown, setShowDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogin = useCallback(() => {
    history.push('/login');
  }, [history]);

  const handleLogout = useCallback(async () => {
    await logout();
    setShowDropdown(false);
  }, [logout]);

  const handleProfile = useCallback(() => {
    setShowDropdown(false);
    // 可以跳转到用户资料页面
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <button
        className={styles.loginButton}
        onClick={handleLogin}
        type="button">
        登录
      </button>
    );
  }

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        className={styles.userButton}
        onClick={() => setShowDropdown(!showDropdown)}
        type="button">
        <span className={styles.username}>{user.username}</span>
        <span className={styles.role}>{user.role === 'root' ? 'Root' : user.role === 'admin' ? '管理员' : '开发者'}</span>
        <span className={styles.dropdownArrow}>▼</span>
      </button>
      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownItem} onClick={handleProfile}>
            个人资料
          </div>
          <div className={styles.dropdownItem} onClick={handleLogout}>
            退出登录
          </div>
        </div>
      )}
    </div>
  );
}

