/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import React from 'react';
import clsx from 'clsx';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl, {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

import Image from '@theme/IdealImage';
import Layout from '@theme/Layout';
import {useAuth} from '@site/src/contexts/AuthContext';

import Tweet from '@site/src/components/Tweet';
import Tweets, {type TweetItem} from '@site/src/data/tweets';
import Features, {type FeatureItem} from '@site/src/data/features';
import Heading from '@theme/Heading';

import styles from './styles.module.css';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

function HeroBanner() {
  return (
    <div className={styles.hero}>
      <div className={styles.heroInner}>
        <Heading as="h1" className={styles.heroProjectTagline}>
          <img
            alt={translate({message: 'openJiuwen Logo'})}
            className={styles.heroLogo}
            src={useBaseUrl('/img/jiuwen-logo.svg')}
            width="120"
            height="120"
          />
          <span
            className={styles.heroTitleTextHtml}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: translate({
                id: 'homepage.hero.title',
                message:
                  '九问大模型应用开发平台',
                description:
                  'Home page hero title, can contain simple html tags',
              }),
            }}
          />
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate>
            打造开发、运行、调优一站式Agent平台
          </Translate>
        </p>
        <div className={clsx(styles.indexCtas, 'jiuwen-hero-buttons')}>
          <Link className="button button--primary button--lg jiuwen-btn-primary" to="/docs-page">
            <Translate>开始使用</Translate>
          </Link>
          <Link className="button button--outline button--lg jiuwen-btn-outline" to="/news">
            <Translate>最新动态</Translate>
          </Link>
          <Link className="button button--outline button--lg jiuwen-btn-outline" to="/community">
            <Translate>加入社区</Translate>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 项目介绍区块 - 简洁风格
function ProjectIntroSection() {
  return (
    <div className={clsx(styles.section, 'jiuwen-intro-section')}>
      <div className="container">
        <div className="row">
          <div className="col col--10 col--offset-1">
            <Heading as="h2" className={clsx('margin-bottom--lg', 'text--center')}>
              <Translate>关于九问</Translate>
            </Heading>
            <div className="text--center padding-horiz--md">
              <p className={styles.introText}>
                <Translate>
                  九问（openJiuwen）致力于打造下一代AI智能体开发平台，为开发者提供强大、易用、高效的AI应用开发工具和解决方案。
                  我们提供完整的开发框架、丰富的API接口、完善的文档和活跃的社区支持，帮助开发者快速构建和部署大模型应用。
                </Translate>
              </p>
              <div className="margin-top--xl">
                <Link className="button button--primary button--lg" to="/docs-page">
                  <Translate>查看文档</Translate>
                </Link>
                <Link className="button button--secondary button--lg margin-left--sm" to="/community">
                  <Translate>加入社区</Translate>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Jiuwen开发者日历区块 - 参考 MindSpore 设计
function DeveloperCalendarSection() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [activeTab, setActiveTab] = React.useState<'all' | 'meeting' | 'activity' | 'peak'>('all');
  const [expandedEventIndex, setExpandedEventIndex] = React.useState<number | null>(null);
  
  // 在组件顶层调用 hook
  const allIconUrl = useBaseUrl('/img/all.svg');
  const meetingIconUrl = useBaseUrl('/img/metting.svg');
  const activityIconUrl = useBaseUrl('/img/activity.svg');
  const peakIconUrl = useBaseUrl('/img/peak.svg');

  // 示例活动数据 - 分散到2025年11月~12月
  const events = [
    { 
      date: '2025-11-05', 
      title: 'Jiuwen 技术分享会', 
      type: 'meeting',
      organizer: '张工程师',
      platform: '腾讯会议',
      meetingId: '123 456 789',
      joinLink: 'https://meeting.tencent.com/dm/xxx',
      description: '分享最新的AI智能体开发技术和实践经验'
    },
    { 
      date: '2025-11-12', 
      title: '开发者社区活动', 
      type: 'activity',
      organizer: '李开发者',
      platform: '线下活动',
      meetingId: '-',
      joinLink: 'https://community.openjiuwen.com/activity/xxx',
      description: '社区开发者线下交流活动，探讨技术难题'
    },
    { 
      date: '2025-11-18', 
      title: 'AI 技术峰会', 
      type: 'peak',
      organizer: '王技术总监',
      platform: 'Zoom',
      meetingId: '987 654 321',
      joinLink: 'https://zoom.us/j/xxx',
      description: '年度AI技术峰会，汇聚行业专家和开发者'
    },
    { 
      date: '2025-11-25', 
      title: 'SIG 月度会议', 
      type: 'meeting',
      organizer: '赵架构师',
      platform: '钉钉会议',
      meetingId: '456 789 012',
      joinLink: 'https://meeting.dingtalk.com/j/xxx',
      description: 'SIG小组月度例会，讨论项目进展和规划'
    },
    { 
      date: '2025-12-03', 
      title: '社区线下聚会', 
      type: 'activity',
      organizer: '陈社区经理',
      platform: '线下活动',
      meetingId: '-',
      joinLink: 'https://community.openjiuwen.com/meetup/xxx',
      description: '社区成员线下聚会，增进交流与友谊'
    },
    { 
      date: '2025-12-10', 
      title: '开发者大会', 
      type: 'peak',
      organizer: '刘大会主席',
      platform: '飞书会议',
      meetingId: '789 012 345',
      joinLink: 'https://vc.feishu.cn/j/xxx',
      description: '年度开发者大会，展示最新成果和技术趋势'
    },
    { 
      date: '2025-12-15', 
      title: '技术培训课程', 
      type: 'meeting',
      organizer: '周培训师',
      platform: '腾讯会议',
      meetingId: '234 567 890',
      joinLink: 'https://meeting.tencent.com/dm/yyy',
      description: '深入讲解openJiuwen平台的高级功能和使用技巧'
    },
    { 
      date: '2025-12-20', 
      title: '开源贡献者聚会', 
      type: 'activity',
      organizer: '吴开源负责人',
      platform: '线下活动',
      meetingId: '-',
      joinLink: 'https://community.openjiuwen.com/contributor/xxx',
      description: '感谢开源贡献者，分享贡献经验和心得'
    },
    { 
      date: '2025-12-28', 
      title: '年终技术总结会', 
      type: 'meeting',
      organizer: '郑技术负责人',
      platform: '腾讯会议',
      meetingId: '345 678 901',
      joinLink: 'https://meeting.tencent.com/dm/zzz',
      description: '回顾2025年技术发展，展望2026年规划'
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // 填充上个月的日期
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, isCurrentMonth: false });
    }
    // 当前月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true });
    }
    // 填充下个月的日期
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: i, isCurrentMonth: false });
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  };

  const getEventsForDate = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  // 获取未来30天内的活动
  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today && eventDate <= thirtyDaysLater;
    });
  };

  // 获取选中日期的活动
  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getFilteredEvents = () => {
    // 如果有选中日期，显示该日期的活动
    if (selectedDate) {
      const selectedEvents = getSelectedDateEvents();
      if (activeTab === 'all') return selectedEvents;
      return selectedEvents.filter(event => event.type === activeTab);
    }
    
    // 否则显示未来30天的活动
    const upcomingEvents = getUpcomingEvents();
    if (activeTab === 'all') return upcomingEvents;
    return upcomingEvents.filter(event => event.type === activeTab);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return meetingIconUrl;
      case 'activity':
        return activityIconUrl;
      case 'peak':
        return peakIconUrl;
      default:
        return allIconUrl;
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className={clsx(styles.section, 'jiuwen-calendar-section')}>
      <div className="container">
        <div className="row">
          <div className="col">
            <Heading as="h2" className={clsx('margin-bottom--lg', 'text--center')}>
              <Translate>Jiuwen开发者日历</Translate>
            </Heading>
            <div className={styles.calendarContainer}>
              <div className={styles.calendarWrapper}>
                <div className={styles.calendarHeader}>
                  <button className={styles.calendarNavButton} onClick={prevMonth} type="button">
                    ‹
                  </button>
                  <h3 className={styles.calendarMonth}>{formatDate(currentDate)}</h3>
                  <button className={styles.calendarNavButton} onClick={nextMonth} type="button">
                    ›
                  </button>
                </div>
                <div className={styles.calendarGrid}>
                  {weekDays.map(day => (
                    <div key={day} className={styles.calendarWeekday}>
                      {day}
                    </div>
                  ))}
                  {days.map((day, index) => {
                    const dayEvents = getEventsForDate(day.date, day.isCurrentMonth);
                    const isToday = day.isCurrentMonth &&
                      day.date === new Date().getDate() &&
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear();
                    
                    // 判断是否被选中
                    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
                    const isSelected = selectedDate && 
                      day.isCurrentMonth &&
                      dayDate.getDate() === selectedDate.getDate() &&
                      dayDate.getMonth() === selectedDate.getMonth() &&
                      dayDate.getFullYear() === selectedDate.getFullYear();
                    
                    // 获取该日期所有事件的类型图标
                    const eventTypes = Array.from(new Set(dayEvents.map(e => e.type)));
                    
                    return (
                      <div
                        key={index}
                        className={clsx(styles.calendarDay, {
                          [styles.calendarDayOtherMonth]: !day.isCurrentMonth,
                          [styles.calendarDayToday]: isToday,
                          [styles.calendarDayHasEvent]: dayEvents.length > 0,
                          [styles.calendarDaySelected]: isSelected,
                        })}
                        onClick={() => {
                          if (day.isCurrentMonth) {
                            const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
                            // 如果点击的是已选中的日期，则取消选中
                            if (isSelected) {
                              setSelectedDate(null);
                            } else {
                              setSelectedDate(clickedDate);
                            }
                            // 切换日期时重置展开状态
                            setExpandedEventIndex(null);
                          }
                        }}>
                        <span className={styles.calendarDayNumber}>{day.date}</span>
                        {dayEvents.length > 0 && (
                          <div className={styles.calendarDayEvents}>
                            {eventTypes.map((type, idx) => (
                              <img
                                key={idx}
                                src={getEventTypeIcon(type)}
                                alt={type}
                                className={styles.calendarDayEventIcon}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={styles.calendarEvents}>
                <div className={styles.calendarEventsHeader}>
                  <h3 className={styles.calendarEventsTitle}>
                    {selectedDate ? (
                      <Translate
                        id="calendar.selectedDate"
                        values={{
                          date: selectedDate.toLocaleDateString('zh-CN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        }}>
                        {'{date} 的活动'}
                      </Translate>
                    ) : (
                      <Translate>近期活动</Translate>
                    )}
                  </h3>
                  {selectedDate && (
                    <button
                      className={styles.calendarClearSelection}
                      onClick={() => {
                        setSelectedDate(null);
                        setExpandedEventIndex(null);
                      }}
                      type="button"
                      title="清除选择">
                      ✕
                    </button>
                  )}
                </div>
                <div className={styles.calendarTabs}>
                  <button
                    className={clsx(styles.calendarTab, {[styles.calendarTabActive]: activeTab === 'all'})}
                    onClick={() => setActiveTab('all')}
                    type="button">
                    <img src={allIconUrl} alt="全部" className={styles.calendarTabIcon} />
                    <Translate>全部</Translate>
                  </button>
                  <button
                    className={clsx(styles.calendarTab, {[styles.calendarTabActive]: activeTab === 'meeting'})}
                    onClick={() => setActiveTab('meeting')}
                    type="button">
                    <img src={meetingIconUrl} alt="会议" className={styles.calendarTabIcon} />
                    <Translate>会议</Translate>
                  </button>
                  <button
                    className={clsx(styles.calendarTab, {[styles.calendarTabActive]: activeTab === 'activity'})}
                    onClick={() => setActiveTab('activity')}
                    type="button">
                    <img src={activityIconUrl} alt="活动" className={styles.calendarTabIcon} />
                    <Translate>活动</Translate>
                  </button>
                  <button
                    className={clsx(styles.calendarTab, {[styles.calendarTabActive]: activeTab === 'peak'})}
                    onClick={() => setActiveTab('peak')}
                    type="button">
                    <img src={peakIconUrl} alt="峰会" className={styles.calendarTabIcon} />
                    <Translate>峰会</Translate>
                  </button>
                </div>
                <div className={styles.calendarEventsList}>
                  {getFilteredEvents().length === 0 ? (
                    <div className={styles.calendarNoEvents}>
                      {selectedDate ? (
                        <Translate>该日期暂无活动</Translate>
                      ) : (
                        <Translate>暂无近期活动</Translate>
                      )}
                    </div>
                  ) : (
                    (selectedDate ? getFilteredEvents() : getFilteredEvents().slice(0, 5)).map((event, index) => {
                      const isExpanded = expandedEventIndex === index;
                      return (
                        <div key={index} className={styles.calendarEventItem}>
                        <div 
                          className={styles.calendarEventHeader}
                          onClick={() => setExpandedEventIndex(isExpanded ? null : index)}
                        >
                          <img
                            src={getEventTypeIcon(event.type)}
                            alt={event.type}
                            className={styles.calendarEventIcon}
                          />
                          <div className={styles.calendarEventContent}>
                            <div className={styles.calendarEventDate}>{event.date}</div>
                            <div className={styles.calendarEventTitle}>{event.title}</div>
                          </div>
                          <span className={clsx(styles.calendarEventExpandIcon, {
                            [styles.calendarEventExpandIconExpanded]: isExpanded
                          })}>
                            ▼
                          </span>
                        </div>
                        {isExpanded && (
                          <div className={styles.calendarEventDetails}>
                            <div className={styles.calendarEventDetailRow}>
                              <span className={styles.calendarEventDetailLabel}>会议名称：</span>
                              <span className={styles.calendarEventDetailValue}>{event.title}</span>
                            </div>
                            <div className={styles.calendarEventDetailRow}>
                              <span className={styles.calendarEventDetailLabel}>发起人：</span>
                              <span className={styles.calendarEventDetailValue}>{event.organizer}</span>
                            </div>
                            <div className={styles.calendarEventDetailRow}>
                              <span className={styles.calendarEventDetailLabel}>平台：</span>
                              <span className={styles.calendarEventDetailValue}>{event.platform}</span>
                            </div>
                            <div className={styles.calendarEventDetailRow}>
                              <span className={styles.calendarEventDetailLabel}>会议ID：</span>
                              <span className={styles.calendarEventDetailValue}>{event.meetingId}</span>
                            </div>
                            <div className={styles.calendarEventDetailRow}>
                              <span className={styles.calendarEventDetailLabel}>参会链接：</span>
                              <a 
                                href={event.joinLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.calendarEventDetailLink}
                              >
                                {event.joinLink}
                              </a>
                            </div>
                            {event.description && (
                              <div className={styles.calendarEventDetailRow}>
                                <span className={styles.calendarEventDetailLabel}>活动描述：</span>
                                <span className={styles.calendarEventDetailValue}>{event.description}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                    })
                  )}
                </div>
                <div className={styles.calendarEventsFooter}>
                  <Link className="button button--outline" to="/community">
                    <Translate>查看完整日历</Translate>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 新闻资讯区块
function NewsSection() {
  return (
    <div className={clsx(styles.section, styles.sectionAlt, 'jiuwen-news-section')}>
      <div className="container">
        <div className="row">
          <div className="col">
            <Heading as="h2" className={clsx('margin-bottom--lg', 'text--center')}>
              <Translate>最新动态</Translate>
            </Heading>
            <div className="row">
              <div className="col col--4">
                <div className="card margin-bottom--md">
                  <div className="card__header">
                    <h3><Translate>平台更新</Translate></h3>
                  </div>
                  <div className="card__body">
                    <p><Translate>最新版本发布，带来更多功能和性能优化...</Translate></p>
                    <Link to="/news" className="button button--link">
                      <Translate>了解更多 →</Translate>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col col--4">
                <div className="card margin-bottom--md">
                  <div className="card__header">
                    <h3><Translate>社区活动</Translate></h3>
                  </div>
                  <div className="card__body">
                    <p><Translate>参与我们的社区活动，与开发者交流分享...</Translate></p>
                    <Link to="/community" className="button button--link">
                      <Translate>查看日历 →</Translate>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col col--4">
                <div className="card margin-bottom--md">
                  <div className="card__header">
                    <h3><Translate>技术博客</Translate></h3>
                  </div>
                  <div className="card__body">
                    <p><Translate>阅读最新的技术文章和最佳实践...</Translate></p>
                    <Link to="/blog-page" className="button button--link">
                      <Translate>阅读更多 →</Translate>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="text--center margin-top--lg">
              <Link className="button button--primary" to="/news">
                <Translate>查看所有动态</Translate>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function VideoContainer() {
  return (
    <div className="container text--center margin-top--xl">
      <div className="row">
        <div className="col">
          <Heading as="h2">
            <Translate>Check it out in the intro video</Translate>
          </Heading>
          <div className="video-container">
            <LiteYouTubeEmbed
              id="_An9EsKPhp0"
              params="autoplay=1&autohide=1&showinfo=0&rel=0"
              title="Explain Like I'm 5: openJiuwen"
              poster="maxresdefault"
              webp
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  feature,
  className,
}: {
  feature: FeatureItem;
  className?: string;
}) {
  const {withBaseUrl} = useBaseUrlUtils();

  return (
    <div className={clsx('col', className)}>
      <img
        className={styles.featureImage}
        alt={feature.title}
        width={Math.floor(feature.image.width)}
        height={Math.floor(feature.image.height)}
        src={withBaseUrl(feature.image.src)}
        loading="lazy"
      />
      <Heading as="h3" className={clsx(styles.featureHeading)}>
        {feature.title}
      </Heading>
      <p className="padding-horiz--md">{feature.text}</p>
    </div>
  );
}

function FeaturesContainer() {
  const firstRow = Features.slice(0, 3);
  const secondRow = Features.slice(3);

  return (
    <div className="container text--center">
      <Heading as="h2" className={clsx('margin-bottom--xl', 'text--center')}>
        <Translate>为什么选择九问</Translate>
      </Heading>
      <div className="row margin-top--lg margin-bottom--lg">
        {firstRow.map((feature, idx) => (
          <Feature feature={feature} key={idx} />
        ))}
      </div>
      <div className="row">
        {secondRow.map((feature, idx) => (
          <Feature
            feature={feature}
            key={idx}
            className={clsx('col--4', idx === 0 && 'col--offset-2')}
          />
        ))}
      </div>
    </div>
  );
}

function TopBanner() {
  // TODO We should be able to strongly type customFields
  //  Refactor to use a CustomFields interface + TS declaration merging
  const announcedVersion = useDocusaurusContext().siteConfig.customFields
    ?.announcedVersion as string;

  return (
    <div className={styles.topBanner}>
      <div className={styles.topBannerTitle}>
        {'🎉\xa0'}
        <Link
          to={`/blog/releases/${announcedVersion}`}
          className={styles.topBannerTitleText}>
          <Translate
            id="homepage.banner.launch.newVersion"
            values={{newVersion: announcedVersion}}>
            {'openJiuwen\xa0{newVersion} is\xa0out!️'}
          </Translate>
        </Link>
        {'\xa0🥳'}
      </div>
      {/*
      <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{flex: 1, whiteSpace: 'nowrap'}}>
          <div className={styles.topBannerDescription}>
            We are on{' '}
            <b>
              <Link to="https://www.producthunt.com/posts/docusaurus-2-0">
                ProductHunt
              </Link>{' '}
              and{' '}
              <Link to="https://news.ycombinator.com/item?id=32303052">
                Hacker News
              </Link>{' '}
              today!
            </b>
          </div>
        </div>
        <div
          style={{
            flexGrow: 1,
            flexShrink: 0,
            padding: '0.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}>
          <ProductHuntCard />
          <HackerNewsIcon />
        </div>
      </div>
      */}
    </div>
  );
}

// 管理导航栏（仅管理员和 root 用户可见）
function AdminNavigation(): ReactNode {
  // 只在客户端检查
  if (!ExecutionEnvironment.canUseDOM) {
    return <></>;
  }

  const {isAdmin, isRoot, loading} = useAuth();

  // 如果正在加载或不是管理员，不显示
  if (loading || !isAdmin) {
    return <></>;
  }

  return (
    <div style={{
      backgroundColor: 'var(--ifm-color-primary)',
      color: 'white',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      flexWrap: 'wrap',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <span style={{fontWeight: 600, fontSize: '0.95rem'}}>管理功能：</span>
        <Link
          to="/admin/"
          style={{
            color: 'white',
            textDecoration: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transition: 'background-color 0.2s',
            fontSize: '0.9rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}>
          管理台
        </Link>
        {isRoot && (
          <Link
            to="/admin/users/"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transition: 'background-color 0.2s',
              fontSize: '0.9rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}>
            用户管理
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const {
    siteConfig: {customFields, tagline},
  } = useDocusaurusContext();
  const {description} = customFields as {description: string};
  return (
    <Layout title={tagline} description={description}>
      <main>
        {/* 管理台功能已暂时隐藏 */}
        {/* <AdminNavigation /> */}
        <HeroBanner />
        <ProjectIntroSection />
        <div className={styles.section}>
          <FeaturesContainer />
        </div>
        <DeveloperCalendarSection />
        <NewsSection />
      </main>
    </Layout>
  );
}
