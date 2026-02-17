use my_db;

-- ===========================
-- 1. 用户 & 帖子相关（可选）
-- ===========================

-- 用户表 mock
insert into user (userAccount, userPassword, userName, userRole, userPhone, userStatus)
values
('admin',   '123456', '系统管理员', 'admin', '13800000001', 1),
('user01',  '123456', '张三',       'user',  '13800000002', 1),
('user02',  '123456', '李四',       'user',  '13800000003', 1),
('user03',  '123456', '王五',       'user',  '13800000004', 1);

-- 帖子表 mock
insert into post (title, content, tags, thumbNum, favourNum, userId)
values
('库存管理经验分享', '这里是内容A', '["库存","经验"]', 10, 3, 1),
('物资出入库规范', '这里是内容B', '["物资","规范"]', 5,  2, 2);

-- 点赞 / 收藏
insert into post_thumb (postId, userId)
values
(1, 2),
(1, 3),
(2, 1);

insert into post_favour (postId, userId)
values
(1, 3),
(2, 2);


-- ===========================
-- 2. 物资信息表 material_info
-- ===========================

insert into material_info (materialName, category, location, expireDate, stockTotal, status, createBy, updateBy)
values
('医用口罩',   '防疫物资', '仓库A-01', date_add(now(), interval 180 day), 500, 1, 1, 1),
('一次性手套', '防疫物资', '仓库A-02', date_add(now(), interval 365 day), 300, 1, 1, 1),
('84消毒液',   '清洁用品', '仓库B-01', date_add(now(), interval  90 day), 100, 1, 1, 1),
('打印纸A4',   '办公用品', '仓库C-01', null,                                800, 1, 1, 1),
('矿泉水',     '后勤物资', '仓库D-01', date_add(now(), interval  30 day),  50, 1, 1, 1);


-- ===========================
-- 3. 库存信息表 inventory_info
-- ===========================
-- 假设上面 5 条物资的 id 分别为 1~5

insert into inventory_info (materialId, location, currentStock, warnThreshold)
values
(1, '仓库A-01', 500, 200),  -- 口罩，阈值 200
(2, '仓库A-02', 300, 100),  -- 手套
(3, '仓库B-01', 100,  50),  -- 消毒液
(4, '仓库C-01', 800, 100),  -- 打印纸
(5, '仓库D-01',  50,  80);  -- 矿泉水：阈值高于当前库存，便于触发库存预警


-- ===========================
-- 4. 库存审批表 inventory_approval
-- ===========================

insert into inventory_approval
(approvalNo, materialId, quantity, purpose, applicantId, approveId, applyTime, approveTime, outTime, approveRemark, status)
values
-- 待审批（status = 0），用于“待审批列表”Tab
('AP_MOCK_PENDING_001', 1, 50, '测试待审批记录', 2, null,
 now(), null, null, null, 0),
-- 已通过未出库（status = 1），用于“过往审批记录”Tab
('AP_MOCK_APPROVED_001', 1, 100, '办公室防疫物资发放', 2, 1,
 date_sub(now(), interval 2 day), date_sub(now(), interval 1 day), null, '同意发放100个口罩', 1),
-- 已驳回（status = 2），用于“过往审批记录”Tab
('AP_MOCK_REJECTED_001', 3, 20, '消毒清洁', 2, 1,
 date_sub(now(), interval 3 day), date_sub(now(), interval 2 day), null, '数量过大，驳回', 2),
-- 已完成出库（status = 3），用于“过往审批记录”和仪表盘出库统计
('AP_MOCK_OUTBOUND_001', 5, 40, '活动饮用水', 3, 1,
 date_sub(now(), interval 4 day), date_sub(now(), interval 3 day), date_sub(now(), interval 3 day), '同意，已出库', 3);


-- ===========================
-- 5. 通知表 notice
-- ===========================

insert into notice (userId, title, content, noticeType, refId, refType, isRead)
values
(2, '库存审批结果通知', '您的申请单 AP20260217001 已通过，请尽快办理出库。', 2, 1, 1, 0),
(3, '出库完成通知',   '您的申请单 AP20260217002 已完成出库。',           2, 2, 1, 1),
(1, '库存预警通知',   '物资 矿泉水 当前库存为 50，小于预警阈值 80。',     1, 1, 2, 0);


-- ===========================
-- 6. 预警规则表 warn_rule
-- ===========================

insert into warn_rule (ruleName, ruleType, materialId, thresholdValue, isEnabled, createBy, updateBy)
values
('通用库存预警规则', 1, null, 50, 1, 1, 1),   -- 全局库存预警：库存低于 50
('矿泉水库存预警',   1, 5,    80, 1, 1, 1),   -- 针对物资5：矿泉水
('临期预警-防疫物资', 2, 1,   15, 1, 1, 1);  -- 口罩：有效期 15 天内预警


-- ===========================
-- 7. 出入库流水表 stock_flow
-- ===========================

insert into stock_flow
(materialId, flowType, quantity, beforeStock, afterStock, operatorId, relatedApprovalNo, remark)
values
(1, 'MANUAL_IN',  500,   0, 500, 1, null,           '期初入库'),
(5, 'MANUAL_IN',   50,   0,  50, 1, null,           '期初入库'),
(1, 'APPLY_OUT',  100, 500, 400, 1, 'AP20260217001', '根据审批单发放口罩'),
(5, 'APPLY_OUT',   40,  50,  10, 1, 'AP20260217002', '根据审批单发放矿泉水');


-- ===========================
-- 8. 预警记录表 warn_record
-- ===========================

insert into warn_record
(ruleId, materialId, warnType, currentValue, thresholdValue, content, handled, handledBy, handledTime)
values
(2, 5, 1, 50, 80, '矿泉水当前库存 50，小于预警阈值 80。', 0, null, null),
(3, 1, 2, 10, 15, '医用口罩距离到期仅剩 10 天，小于阈值 15 天。', 1, 1, now());

