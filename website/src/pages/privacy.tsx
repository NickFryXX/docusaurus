/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';

export default function Privacy(): ReactNode {
  return (
    <Layout
      title="隐私政策"
      description="九问平台隐私政策">
      <main className="container margin-vert--lg">
        <Heading as="h1">
          <Translate>隐私政策</Translate>
        </Heading>
        
        <div className="margin-top--lg">
          <p className="text--lg">
            <Translate>
              最后更新时间：2024年
            </Translate>
          </p>
          
          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>1. 信息收集</Translate>
            </Heading>
            <p>
              <Translate>
                九问平台致力于保护用户隐私。我们可能收集以下类型的信息：
              </Translate>
            </p>
            <ul>
              <li><Translate>您主动提供的信息（如注册信息、反馈等）</Translate></li>
              <li><Translate>使用服务时自动收集的信息（如访问日志、设备信息等）</Translate></li>
              <li><Translate>从第三方获取的信息（如通过社交账号登录）</Translate></li>
            </ul>
          </div>

          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>2. 信息使用</Translate>
            </Heading>
            <p>
              <Translate>
                我们使用收集的信息用于：
              </Translate>
            </p>
            <ul>
              <li><Translate>提供、维护和改进我们的服务</Translate></li>
              <li><Translate>处理您的请求和交易</Translate></li>
              <li><Translate>发送重要通知和更新</Translate></li>
              <li><Translate>进行数据分析和研究</Translate></li>
            </ul>
          </div>

          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>3. 信息共享</Translate>
            </Heading>
            <p>
              <Translate>
                我们不会出售、交易或出租您的个人信息给第三方。我们可能在以下情况下共享信息：
              </Translate>
            </p>
            <ul>
              <li><Translate>获得您的明确同意</Translate></li>
              <li><Translate>法律法规要求</Translate></li>
              <li><Translate>保护我们的权利和财产</Translate></li>
            </ul>
          </div>

          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>4. 数据安全</Translate>
            </Heading>
            <p>
              <Translate>
                我们采用行业标准的安全措施来保护您的个人信息，防止未经授权的访问、使用或披露。
              </Translate>
            </p>
          </div>

          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>5. 联系我们</Translate>
            </Heading>
            <p>
              <Translate>
                如果您对本隐私政策有任何疑问，请通过以下方式联系我们：
              </Translate>
            </p>
            <p>
              <Translate>
                邮箱：privacy@jiuwen.com
              </Translate>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

