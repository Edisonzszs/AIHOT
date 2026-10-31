# AI 观潮

**面向 AI 产品团队与行业从业者的资讯雷达。**

持续关注模型能力、AI 产品创新、Agent 生态、开源项目与工具实践。聚合公开信源，以模型辅助筛选、中文摘要和事件归组减少重复阅读，并自动生成日报、周报和月报。

- **网站**：[AI 观潮](http://47.251.118.253:911)
- **日报归档**：[查看往期](http://47.251.118.253:911/daily/archive)
- **Agent 接入**：[MCP / API / RSS / Markdown](http://47.251.118.253:911/agent)
- **项目仓库**：[Edisonzszs/AIHOT](https://github.com/Edisonzszs/AIHOT)

## 内容与栏目

| 栏目 | 内容 |
|---|---|
| 模型 | 模型发布、能力变化、价格和可用性 |
| 产品 | AI 产品与平台的正式发布和重大更新 |
| 开源项目 | 社区项目、框架及可复用工程成果 |
| Skills | Agent Skills、MCP、插件与技能生态动态 |
| 工具发现 | 新工具、应用和 Demo 的发现与使用场景 |
| 行业、论文、教程、观点 | 产业变化、研究进展、实践经验和趋势分析 |

信源包括公开官方博客、专业媒体、技术社区、GitHub Trending、Hugging Face Spaces 和 Product Hunt 等。并非所有目录站都有可用 API 或 RSS；平台维护动态、社区榜单和单个技能合集属于不同信息，不等同于完整榜单接入。

## 工作方式

```text
采集与判重 → AI 相关性预筛 → 两次独立评分 → 中文标题、摘要与标签
                                      ↓
                          事件归组、精选流、热点与期刊
```

- 两次评分按信源分级门槛决定入选，提示词与配置位于 `industry/`。
- 同一事实优先使用一手报道，减少不同媒体重复转载。
- 热点按事件的独立来源和时效计算，不把项目 star 数、安装量等平台指标直接等同于新闻热度。
- 日报北京时间每天 08:00、周报每周一 10:00、月报每月 1 日 10:30 生成；窗口内没有符合条件的内容时不强行出空刊。
- 网页阅读不触发模型调用；采集、处理和写作由后台 worker 执行。
- 默认只展示摘要与原文链接。内容和商标归原来源所有。

## 给 Agent 使用

所有公开内容接口匿名只读，无需本站 API Key。

- MCP：`http://47.251.118.253:911/api/mcp`
- 接入说明：`http://47.251.118.253:911/agent`
- OpenAPI：`http://47.251.118.253:911/openapi-v1.json`
- 精选 RSS：`http://47.251.118.253:911/feed.xml`
- 站点说明：`http://47.251.118.253:911/llms.txt`

MCP 工具前缀为 `guanchao`，可获取最新资讯、搜索、热点、事件和日报。若需要推送至飞书，可由支持定时任务与消息发送的 Agent 拉取本站公开内容；站内自定义机器人推送能力目前用于精选内容。

## 开发与配置

技术栈：Node.js 24、TypeScript、React Router、Fastify、PostgreSQL、pg-boss、Tailwind CSS、Docker Compose。

```bash
git clone https://github.com/Edisonzszs/AIHOT.git guanchao
cd guanchao
npm ci
node scripts/init-env.ts
```

按 [部署文档](docs/deploy.md) 设置 `.env`、数据库和模型服务后启动。开发和测试环境必须关闭 `COLLECT_ENABLED`、`MODEL_CALLS_ENABLED`、`FEISHU_*_ENABLED` 和 `INDEXNOW_SUBMIT_ENABLED`，避免访问外部服务或产生费用。

品牌、分类、主题、初始信源和提示词集中在 `industry/`。`sources.json` 只初始化不存在的信源，不自动覆盖后台已经配置的来源；线上数据与密钥不属于 GitHub 代码仓库。

| 文档 | 用途 |
|---|---|
| [架构](docs/architecture.md) | 进程职责、数据流与公开读取层 |
| [定制配置](docs/customize.md) | 品牌、分类、主题和提示词配置 |
| [信源](docs/sources.md) | RSS、网页、JSON、外部推送等接入方式 |
| [精选与校准](docs/selection.md) | 人工样本标注及评分门槛评测 |
| [事件归组](docs/grouping.md) | 事实关系、归组和评测 |
| [部署与运维](docs/deploy.md) | Docker、备份及更新 |

验证命令：

```bash
npm run typecheck
# DATABASE_URL 必须指向名字以 _test 或 _ci 结尾的独立空库，先运行 scripts/migrate.ts。
npm test
npm run build -w @aihot/web
node --test apps/web/tests/*.test.ts
node scripts/smoke.ts --base http://localhost:3000
```

## 维护与反馈

AI 观潮的定制代码在本仓库维护；网站使用问题可从[站内反馈页](http://47.251.118.253:911/feedback)提交。安全问题请先阅读 [SECURITY.md](SECURITY.md)，不要在公开页面发送密钥、密码或漏洞利用细节。GitHub Issues、Discussions 和私密漏洞报告目前未启用，不引导本站用户到上游社区反馈。

## 开源来源与许可

AI 观潮基于 [AIHOT 开源框架](https://github.com/KKKKhazix/AIHOT)进行定制，本站的品牌、内容侧重和运营配置由本项目维护，与上游运营的站点区分。

代码沿用 [MIT 许可证](LICENSE)，原作者的版权声明依法保留；这不是本站运营者署名。上游品牌及第三方字体、模型厂商和评测机构标志的归属见 [NOTICE](NOTICE)。本站没有沿用上游作者的个人介绍、联系方式或宣传经历。
