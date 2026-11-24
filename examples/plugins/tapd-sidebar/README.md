# TAPD 侧栏插件

在 Orca 右侧边栏浏览 TAPD 需求、缺陷和任务。插件适用于 Orca 1.4.260 及以上的桌面版。

## 安装与连接

1. 在 Orca 的「设置 → 插件 → 添加插件」选择构建后的本地插件文件夹。
2. 审核并启用插件。TAPD 访问和工作区操作在插件的 Node worker 中执行。访问令牌保存在 Orca 的加密插件密钥库。
3. 打开右侧栏的 TAPD，填写个人访问令牌并点击「验证并保存」。选择一个有权限的项目。
4. 在工单详情点击「开始」，选择 Orca Git 项目、基准分支和 Agent，再确认创建。输入始终可编辑，只有勾选「同时发送上下文给 Agent」才会提交上下文。下一次打开同一工单时可以直接进入已关联的工作区。

需要为令牌授予相应的 TAPD 访问权限才能新建、编辑、流转和评论。要求填写额外字段的流转可在 TAPD 网页完成。侧栏以纯文本安全展示描述和评论，评论输入接受 Markdown。

工单关联保存在插件自身的存储中。标准版内置「任务」页和工作区引用列表属于 Orca 核心界面。

## 从源码构建

在 Orca 仓库根目录安装仓库依赖后执行以下命令。

```sh
node examples/plugins/tapd-sidebar/build.mjs
orca plugin validate examples/plugins/tapd-sidebar/dist --json
orca plugin install examples/plugins/tapd-sidebar/dist --json
```

也可以把绝对输出目录作为 `build.mjs` 的第一个参数。构建结果包含清单、侧栏文件和打包后的 worker，安装时无需 Node 或仓库依赖。
