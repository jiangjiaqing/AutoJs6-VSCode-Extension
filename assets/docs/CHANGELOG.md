******

### Changelog

******

# v1.0.12

###### 2025/04/14

* `修复` 服务端模式因版本判断失误导致无法连接的问题 _[`issue #27`](http://vscext-project.autojs6.com/issues/27)_
* `优化` 新建项目支持使用 `dts-link` 脚本任务自动创建 [AutoJs6 声明文件](http://dts-project.autojs6.com/) 软链接 _[`issue #8`](http://vscext-project.autojs6.com/issues/8)_

# v1.0.11

###### 2025/04/14

* `修复` VSCode 编辑器菜单栏运行项目及保存项目按钮功能失效的问题 (Ref to [terwer](https://github.com/terwer)) _[`pr #25`](https://github.com/SuperMonster003/AutoJs6-VSCode-Extension/pull/25)_ _[`issue #26`](http://vscext-project.autojs6.com/issues/26)_ _[`issue #24`](http://vscext-project.autojs6.com/issues/24)_ _[`issue #23`](http://vscext-project.autojs6.com/issues/23)_

# v1.0.10

###### 2024/12/28

* `新增` VSCode 编辑器菜单栏增加支持插件基本操作的图标按钮
* `新增` VSCode 资源管理器增加支持插件基本操作的右键菜单项
* `优化` 选择窗口未勾选任何项目时按下回车键将选择光标所在项目
* `优化` 连接选择窗口标题显示可用的 IP 地址信息兼容更多可用的地址
* `优化` 使用服务端局域网连接方式时, 将显示全部可用的网络接口并展示详细信息
* `优化` 新建项目时, 项目配置文件的项目名称及包名后缀自动适配目录名称 (支持拼音转换)

# v1.0.9

###### 2023/11/15

* `修复` 执行 npm install 可能出现 Not Found 的问题 _[`issue #1`](https://github.com/SuperMonster003/AutoJs6-TypeScript-Declarations/issues/1#issuecomment-1758808581)_
* `修复` 新建项目时存在目录时可能出现文件遗漏复制的问题
* `优化` 新建项目后执行 npm install 或 npm run dts 可完成声明文件部署

# v1.0.8

###### 2023/10/31

* `修复` 执行任何命令均无效的问题

# v1.0.7

###### 2023/10/30

* `修复` 输入 AutoJs6 服务端地址有效且部分匹配历史记录时无法按输入值建立连接的问题
* `优化` 增加 AutoJs6 项目实例的必要文件检测及提示
* `优化` 未命名文件保存到设备时自动识别文件类型并添加扩展名

# v1.0.6

###### 2023/07/21

* `修复` 服务端发送消息长度超过四位十进制数时长度数据被截断的问题 _[`issue #7`](http://vscext-project.autojs6.com/issues/7)_ _[`issue #9`](http://vscext-project.autojs6.com/issues/9)_

# v1.0.5

###### 2023/07/06

* `新增` 支持通过 HTTP 协议携带参数执行插件命令 _[`issue #6`](http://vscext-project.autojs6.com/issues/6)_
* `新增` 已建立连接的历史客户端支持显示最近连接时间
* `修复` 无法保存文件到设备以及无法运行或保存项目的问题 _[`issue #5`](http://vscext-project.autojs6.com/issues/5)_
* `优化` 插件命令选择窗口增加详细说明便于用户了解并选择合适的连接方式
* `优化` 实现 VSCode 插件与 AutoJs6 的双向版本检测并提示异常检测结果
* `优化` 支持同一设备使用同一方式重复连接的行为检测及提示
* `优化` 清除连接设备历史记录时增加确认操作提示

# v1.0.4

###### 2022/02/05

* `修复` 当 AutoJs6 单次生成日志长度较大时无法正常拼接的问题  _[`issue #4`](http://vscext-project.autojs6.com/issues/4)_
* `修复` 新设备建立连接后焦点自动转移至输出面板 (OUTPUT) 的问题

# v1.0.3

###### 2022/01/05

* `修复` VSCode 焦点位于输出面板 (OUTPUT) 时无法运行脚本的问题

# v1.0.2

###### 2022/01/02

* `修复` VSCode 无设备连接历史时无法建立连接的问题

# v1.0.1

###### 2022/01/01

* `新增` 支持客户端 (LAN) 及服务端 (LAN/ADB) 连接方式 (Ref to [Auto.js Pro](http://www.autojs.cc/))

# v1.0.0

###### 2021/12/07

* `优化` 在 VSCode 的 OUTPUT (输出) 面板显示实时日志 (Ref to [710850609](https://github.com/710850609))