/**
 * 用户认证 Context
 */
import type {ReactNode} from 'react';
import {createContext, useContext, useState, useEffect, useCallback, useMemo} from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import {authApi, type User, setAuthToken, removeAuthToken, getAuthToken} from '@site/src/utils/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isRoot: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    // 使用 typeof window 检查，更可靠
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // 确保在客户端环境
    if (!ExecutionEnvironment.canUseDOM) {
      setLoading(false);
      return;
    }

    try {
      const token = getAuthToken();
      console.log('[AuthContext] refreshUser - token exists:', !!token);
      if (!token) {
        console.log('[AuthContext] No token found, setting user to null');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('[AuthContext] Calling getCurrentUser API...');
      try {
        const currentUser = await authApi.getCurrentUser();
        console.log('[AuthContext] getCurrentUser response:', currentUser);
        if (currentUser && currentUser.id) {
          setUser(currentUser);
          setLoading(false);
        } else {
          console.error('[AuthContext] Invalid user response:', currentUser);
          removeAuthToken();
          setUser(null);
          setLoading(false);
        }
      } catch (apiError) {
        console.error('[AuthContext] getCurrentUser API error:', apiError);
        throw apiError; // 重新抛出，让外层 catch 处理
      }
    } catch (error) {
      console.error('[AuthContext] Failed to get current user:', error);
      console.error('[AuthContext] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      removeAuthToken();
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 确保在客户端执行
    if (typeof window !== 'undefined' && ExecutionEnvironment.canUseDOM) {
      console.log('[AuthContext] useEffect - Initializing, calling refreshUser...');
      refreshUser();
      
      // 监听登录/登出事件，自动刷新用户状态
      const handleAuthLogin = (event: CustomEvent) => {
        const user = event.detail;
        console.log('[AuthContext] auth:login event received, user:', user);
        if (user) {
          setUser(user);
          setLoading(false);
        }
      };
      
      const handleAuthLogout = () => {
        console.log('[AuthContext] auth:logout event received');
        setUser(null);
        setLoading(false);
      };
      
      // 监听 localStorage 变化（用于跨标签页同步）
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'auth_token') {
          console.log('[AuthContext] localStorage auth_token changed:', !!e.newValue);
          if (e.newValue) {
            refreshUser();
          } else {
            setUser(null);
            setLoading(false);
          }
        }
      };
      
      window.addEventListener('auth:login', handleAuthLogin as EventListener);
      window.addEventListener('auth:logout', handleAuthLogout);
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('auth:login', handleAuthLogin as EventListener);
        window.removeEventListener('auth:logout', handleAuthLogout);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    // SSR 时直接设置 loading 为 false
    setLoading(false);
    return undefined;
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    console.log('[AuthContext] Login called for user:', username);
    const response = await authApi.login({username, password});
    console.log('[AuthContext] Login response:', response);
    setAuthToken(response.access_token);
    console.log('[AuthContext] Token saved, user set to:', response.user);
    // 直接使用登录响应中的用户信息，不需要再次调用 API
    setUser(response.user);
    setLoading(false);
    // 触发登录事件，通知其他组件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:login', { detail: response.user }));
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const response = await authApi.register({username, email, password});
    setAuthToken(response.access_token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'root';
  const isRoot = user?.role === 'root';

  // 调试信息：每次 user 或 loading 变化时输出
  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      console.log('[AuthContext] State updated:', {
        user: user ? {id: user.id, username: user.username, role: user.role} : null,
        loading,
        isAdmin,
        isRoot,
        tokenExists: !!getAuthToken(),
      });
    }
  }, [user, loading, isAdmin, isRoot]);

  // 使用 useMemo 确保 value 对象在依赖变化时更新，避免不必要的重新渲染
  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAdmin,
    isRoot,
  }), [user, loading, login, register, logout, refreshUser, isAdmin, isRoot]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  // 添加调试信息，记录 context 是否为 undefined
  if (ExecutionEnvironment.canUseDOM) {
    console.log('[useAuth] Called, context is:', context === undefined ? 'UNDEFINED (using fallback)' : 'defined');
    if (context !== undefined) {
      console.log('[useAuth] Returning context:', {
        hasUser: !!context.user,
        username: context.user?.username,
        role: context.user?.role,
        isAdmin: context.isAdmin,
        isRoot: context.isRoot,
        loading: context.loading,
      });
    }
  }
  
  // 如果 context 存在，添加一个标记，表示这是真正的 Context 值
  if (context !== undefined) {
    // 添加一个不可枚举的属性，用于标识这是真正的 Context 值
    // 注意：不要修改原对象，而是返回一个新对象
    return {
      ...context,
      _isRealContext: true, // 内部标记，用于区分 fallback 值
    };
  }

  // context 未定义的情况处理
  // SSR 时返回默认值，避免构建错误
  if (!ExecutionEnvironment.canUseDOM) {
    return {
      user: null,
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      refreshUser: async () => {},
      isAdmin: false,
      isRoot: false,
    };
  }

  // 客户端时，如果 context 未定义，说明 AuthProvider 没有正确包装
  // 记录警告，以便调试
  console.warn('[useAuth] AuthProvider context is UNDEFINED! Returning fallback values. This should not happen in production.');
  console.warn('[useAuth] Stack trace:', new Error().stack);
  
  // 这种情况下，我们返回一个可以工作的默认值
  // 但会尝试通过事件通知其他组件刷新
  return {
    user: null,
    loading: false,
    login: async (username: string, password: string) => {
      // 如果 AuthProvider 真的不存在，直接调用 API
      console.warn('AuthProvider context not found, using direct API call');
      try {
        const response = await authApi.login({username, password});
        setAuthToken(response.access_token);
        // 触发自定义事件，通知其他组件刷新
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:login', { detail: response.user }));
        }
        // 使用 location.href 强制刷新页面，让 AuthProvider 重新初始化
        window.location.href = '/';
      } catch (error) {
        throw error;
      }
    },
    register: async (username: string, email: string, password: string) => {
      console.warn('AuthProvider context not found, using direct API call');
      try {
        const response = await authApi.register({username, email, password});
        setAuthToken(response.access_token);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:login', { detail: response.user }));
        }
        window.location.href = '/';
      } catch (error) {
        throw error;
      }
    },
    logout: async () => {
      removeAuthToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      window.location.href = '/';
    },
    refreshUser: async () => {},
    isAdmin: false,
    isRoot: false,
  };
}


