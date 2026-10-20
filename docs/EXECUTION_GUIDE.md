# Codex 执行说明书

## 交接方式

将项目整个目录交给 Codex，先让它阅读 `docs/CODEX_PROMPT.md` 和 `docs/SCIENTIFIC_NOTES.md`。推荐附一句：“请基于现有项目继续实现和验证，保持已确认方法；未核实交叉配对保留标记。部署前请使用我指定的目标仓库。”提示词同时支持从零重建和在此基础上继续开发。

## 文件与修改入口

| 路径 | 用途 |
| --- | --- |
| `index.html` | 五章完整中文叙事、静态结果占位、方法边界 |
| `styles.css` | 大屏、移动端、演示模式、打印、减少动态 |
| `app.js` | 柱图切换、空间同步、高亮、P1–P4、全局动画控制与切页 |
| `data/research-data.js` | 五队列、方法核对状态、四条配对及 P1–P4 配置 |
| `data/cohorts.csv` | 原计数和六位小数百分比 |
| `data/results-template.csv` | 真实结果登记空模板；网页不会自动导入此表 |
| `assets/` | 原创 SVG 和对应 PNG，可直接插入 PPT/文档；另见素材说明 |
| `.github/workflows/pages.yml` | 静态打包、数据检查、GitHub Pages 部署 |
| `scripts/check.py` | 算术、资源路径、SVG 与关键科学结构检查 |
| `scripts/serve.py` | 本地预览服务器，默认仅监听本机 |
| `docs/VALIDATION.md` | 实际检查范围与已知边界 |

`research-data.js` 用经典脚本暴露配置，不用 fetch，支持双击打开和离线展示。修改数据后，概览摘要、说明、表格静态总数、独立 SVG 以及本文中的计数也需同步核对；不能只改配置。当前交付面向这批固定计数，未实现任意数据集的自动文案生成。

## 本地运行

最简单：直接双击 `index.html`。核心交互与所有素材均不依赖互联网。

推荐用本地服务器预览，以接近 Pages 环境：

```sh
cd bright-flash-report
python3 scripts/check.py
node --check app.js
node --check data/research-data.js
python3 scripts/serve.py
```

打开终端给出的 `http://127.0.0.1:4173/`。`--port 4174` 可更换端口；停止用 Ctrl+C。没有 Python/Node 时，双击仍可展示，但需在具备运行时的环境完成检查。

## 汇报操作

- 默认是纵向阅读，顶部章节导航定位。
- 点击“演示模式”一章一页；按钮和方向键/PageUp/PageDown 切换，Home/End 首尾，Esc 退出。表单、空间图块和按钮焦点下保留组件自己的键盘行为；切页仍可用底部前后按钮。
- 点击“全屏”进入浏览器全屏；部分嵌入预览不支持，应在独立浏览器打开。Esc 可先退出浏览器全屏，再退出演示。
- 16:9 屏幕优先；较短屏幕允许竖向滚动，未裁切研究内容。手机版可按章阅读，表格只在自己的容器中横向滚动。
- 点击“暂停动画”冻结 SVG 粒子及 CSS 路径。系统减少动态偏好会默认暂停；用户可主动播放低强度 SVG 粒子。减少动态的 CSS 规则仍保留。
- 浏览器打印可保存横版 PDF，打印样式会显示全部五章；最终打印分页需在使用的浏览器中复核。本次未交付经逐页验证的 PDF。

## 填入真实实验结果

1. 复制 `data/results-template.csv` 作为真实记录，补充任务、队列、指标、数值、CI、样本数、种子、Top-N、协议标识和来源。
2. 先确认同一指标定义、测试患者和统计单位一致。缺失留空，不用 0 替代。
3. 当前页面结果表是静态占位，CSV 不是上传接口，也不会驱动网页结果。请让 Codex 根据已核验结果更新结果表或建立单独的安全数据渲染模块，同时添加来源与日期。
4. CI 与差异必须来自真实统计，不能由前端随机生成。无结果的行继续显示“待测”。
5. 对隐私敏感的患者 ID、原始坐标、图像和模型权重不能作为网页素材提交。

## GitHub Pages 部署步骤

本交付已按用户授权部署到 `Anglejuebi/BRIGHT-Distillation`，线上地址 <https://anglejuebi.github.io/BRIGHT-Distillation/>，Pages Source 已设为 GitHub Actions，工作流执行成功。以下步骤保留作为复现与迁移说明。工作流参考 [GitHub 官方自定义 Pages 工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)，2026-10-20 查阅。

1. 在已授权的账户下选定仓库，把**项目目录中的内容**作为仓库根目录。不要把压缩包外层目录一起作为额外一层上传；必须包含隐藏的 `.github/workflows/pages.yml`。
2. 默认工作流监听 `main`。若实际默认分支不同，改工作流中的 `branches` 后再推送。
3. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。账户与仓库类型需符合 Pages 可用条件。
4. 推送到目标分支，或在 Actions 中手动运行 `Publish research report to Pages`。打包脚本只复制 HTML/CSS/JS、data、assets 到临时 `site/`；页面中的开发提示词链接也会定向复制到 `site/docs/`。不会打包临时文件、检查脚本或整个工作目录。
5. 工作流先执行检查和 JS 语法验证，再上传 Pages artifact，最后部署到 `github-pages` 环境。等待成功后使用部署步骤返回的真实 URL；不要仅根据用户名与仓库名猜测成功。
6. 打开实际部署地址，刷新 `#method` 和 `#experiments`，确认相对资源无 404。仓库子路径已通过本地模拟验证，仍需上线后检查。
7. 若仓库环境要求审批，让仓库管理员在 GitHub 完成；不要绕过。无需另设第三方托管账号或 API Key。

在已明确授权推送且 Git 已配置的环境，可运行以下示例。`YOUR_OWNER/YOUR_REPO` 必须替换为研究者确认的仓库，不能猜测，也不把凭据写入文件。

```sh
git init -b main
git add .
git commit -m "Add BRIGHT-Flash research report"
git remote add origin https://github.com/YOUR_OWNER/YOUR_REPO.git
git push -u origin main
```

若目录已经是 Git 仓库，先检查状态和远端，沿用现有仓库；不要重复初始化、覆盖远端或强制推送。CLI 工具没有认证时，使用 GitHub 网页上传或由拥有权限的用户配置认证。无需把密钥交给本网页。

## 发布前验收

- 总数为 18,756；最小组 192 保持真实柱宽，文字仍可读。
- 学生 1 CLS + 16 Patch、教师 16 CLS 聚合为 1 的表述准确；另两条交叉关系尚未核实时保留星号与说明。
- P1–P4 映射准确，Top-N 是统一预算演示，不产生性能数值。
- 实测五章、交互、手机、减少动态与无障碍键盘；没有运行的检查如实标记。
- 公开包仅含研究者允许公开的内容；全部结果待测时不出现假图或虚构数值。
- 远端工作流及真实 URL 只有在实际部署成功后才能标记“上线”。
