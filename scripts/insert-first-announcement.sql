-- Insert first announcement: 高强度学习期第2次直播分享
INSERT INTO "announcement" (
  "id",
  "title",
  "content",
  "type",
  "is_pinned",
  "status",
  "event_date",
  "event_link",
  "views",
  "created_by",
  "created_at",
  "updated_at"
) VALUES (
  'announcement_001',
  '高强度学习期第2次直播分享',
  '@所有人 大家好呀～

高强度学习期第2次直播分享即将开始，请大家提前锁定时间：

【分享时间】 11月5日（周三）晚20:00
【分享人】刘小排
【分享的主题】内功篇导学
【分享地点】小鹅通

点击下方链接预约直播间，明晚20:00不见不散～
https://fllv5.xetslk.com/sl/2wui8Q',
  'event',
  true,
  'published',
  '2025-11-05 20:00:00',
  'https://fllv5.xetslk.com/sl/2wui8Q',
  0,
  'test_user_001',
  NOW(),
  NOW()
);
