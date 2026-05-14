# Release {{version}}

发布日期：{{date}}

## 发布概述

{{overview}}

本次版本主要包含以下方面的更新：
{{#highlights}}
- {{.}}
{{/highlights}}

## 💥 破坏性变更

{{#breaking}}
### {{number}}、{{title}}

**影响范围**: {{scope}}

{{description}}

**迁移指南**:
{{migration_guide}}
{{/breaking}}

## 🆕 新增功能

{{#features}}
### {{number}}、{{title}} {{#issue}}#{{issue}}{{/issue}}

{{description}}

**使用方式**:
```
{{usage}}
```

{{#image}}
![{{title}}](../assets/{{image}})
{{/image}}
{{/features}}

## 🆙 功能优化

{{#improvements}}
### {{number}}、{{title}}

{{description}}

**优化效果**: {{effect}}
{{/improvements}}

## 🐛 Bug 修复

{{#fixes}}
### {{number}}、{{description}}

**影响**: {{impact}}
{{/fixes}}

## 📚 文档更新

{{#docs}}
- {{.}}
{{/docs}}

## 🔧 代码重构

{{#refactor}}
- {{description}}
{{/refactor}}

## 📊 文件变更统计

| 类型 | 数量 | 行数变化 |
|------|------|----------|
| 新增文件 | {{files_added}} | +{{lines_added}} |
| 删除文件 | {{files_deleted}} | -{{lines_deleted}} |
| 修改文件 | {{files_modified}} | ~{{lines_changed}} |

## 👥 贡献者

感谢以下贡献者对本版本的贡献：
{{#contributors}}
- @{{name}} ({{commits}} commits)
{{/contributors}}

---

**完整变更日志**: {{compare_url}}
**查阅全文**: {{wiki_url}}