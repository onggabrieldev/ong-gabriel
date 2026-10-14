---
title: Comments
tags:
  - api
  - comments
aliases:
  - Comentários
---

# Comments

> [!info] New
> The old Django schema has no comment table. See [[legacy-database|Legacy database]]. This is an addition.

Comments start on blog posts. Events and the agenda are possible later targets. Static pages do not take comments.

One comment belongs to one target. The first target is a post. An event or an agenda entry, if added, uses the same comment shape rather than a second system.

A comment is created by a logged-in user and is visible immediately. An editor can remove it. The permission for that removal is RBAC, not a check written only in the client.

Still open: replies and notifications.

Back to [[CONTEXT|Product context]].
