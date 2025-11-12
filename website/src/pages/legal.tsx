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

export default function Legal(): ReactNode {
  return (
    <Layout
      title="法律声明"
      description="九问平台法律声明">
      <main className="container margin-vert--lg">
        <Heading as="h1">
          <Translate>法律声明</Translate>
        </Heading>
        
        <div className="margin-top--lg">
          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>1. 版权声明</Translate>
            </Heading>
            <p>
              <Translate>
                九问平台的所有内容，包括但不限于文字、图片、音频、视频、软件、程序等，均受版权法保护。
                未经授权，不得复制、传播、修改或用于商业用途。
              </Translate>
            </p>
          </div>

          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>2. 免责声明</Translate>
            </Heading>
            <p>
              <Translate>
                九问平台提供的服务按"现状"提供，不提供任何明示或暗示的保证。
                我们不保证服务的准确性、完整性、及时性或适用性。
                使用本平台的风险由用户自行承担。
              </Translate>
            </p>
          </div>

          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>3. 用户行为</Translate>
            </Heading>
            <p>
              <Translate>
                用户在使用九问平台时，应遵守相关法律法规，不得从事以下行为：
              </Translate>
            </p>
            <ul>
              <li><Translate>发布违法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他令人反感的内容</Translate></li>
              <li><Translate>侵犯他人知识产权或其他合法权益</Translate></li>
              <li><Translate>干扰或破坏平台正常运行</Translate></li>
              <li><Translate>未经授权访问或使用平台系统</Translate></li>
            </ul>
          </div>

          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>4. 服务变更</Translate>
            </Heading>
            <p>
              <Translate>
                我们保留随时修改、暂停或终止服务的权利，无需事先通知。
                我们不对因服务变更而导致的任何损失承担责任。
              </Translate>
            </p>
          </div>

          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>5. 适用法律</Translate>
            </Heading>
            <p>
              <Translate>
                本法律声明的解释和执行适用中华人民共和国法律。
                如发生争议，应通过友好协商解决；协商不成的，可向有管辖权的人民法院提起诉讼。
              </Translate>
            </p>
          </div>

          <div className="margin-top--lg">
            <Heading as="h2">
              <Translate>6. 联系我们</Translate>
            </Heading>
            <p>
              <Translate>
                如果您对本法律声明有任何疑问，请通过以下方式联系我们：
              </Translate>
            </p>
            <p>
              <Translate>
                邮箱：legal@jiuwen.com
              </Translate>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

