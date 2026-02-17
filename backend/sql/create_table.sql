# 数据库初始化
# @author <a href="https://github.com/liyupi">程序员鱼皮</a>
# @from <a href="https://yupi.icu">编程导航知识星球</a>

-- 创建库
create database if not exists my_db;

-- 切换库
use my_db;

-- 用户表
create table if not exists user
(
    id           bigint auto_increment comment 'id' primary key,
    userAccount  varchar(256)                           not null comment '账号',
    userPassword varchar(512)                           not null comment '密码',
    unionId      varchar(256)                           null comment '微信开放平台id',
    mpOpenId     varchar(256)                           null comment '公众号openId',
    userName     varchar(256)                           null comment '用户昵称',
    userAvatar   varchar(1024)                          null comment '用户头像',
    userProfile  varchar(512)                           null comment '用户简介',
    userRole     varchar(256) default 'user'            not null comment '用户角色：user/admin/ban',
    userPhone    varchar(32)                            null comment '手机号',
    userStatus   tinyint      default 1                 not null comment '账号状态：1启用 0禁用',
    createTime   datetime     default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime   datetime     default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    isDelete     tinyint      default 0                 not null comment '是否删除',
    index idx_unionId (unionId),
    index idx_userPhone (userPhone),
    index idx_userStatus (userStatus)
) comment '用户' collate = utf8mb4_unicode_ci;

-- 帖子表
create table if not exists post
(
    id         bigint auto_increment comment 'id' primary key,
    title      varchar(512)                       null comment '标题',
    content    text                               null comment '内容',
    tags       varchar(1024)                      null comment '标签列表（json 数组）',
    thumbNum   int      default 0                 not null comment '点赞数',
    favourNum  int      default 0                 not null comment '收藏数',
    userId     bigint                             not null comment '创建用户 id',
    createTime datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    isDelete   tinyint  default 0                 not null comment '是否删除',
    index idx_userId (userId)
) comment '帖子' collate = utf8mb4_unicode_ci;

-- 帖子点赞表（硬删除）
create table if not exists post_thumb
(
    id         bigint auto_increment comment 'id' primary key,
    postId     bigint                             not null comment '帖子 id',
    userId     bigint                             not null comment '创建用户 id',
    createTime datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    index idx_postId (postId),
    index idx_userId (userId)
) comment '帖子点赞';

-- 帖子收藏表（硬删除）
create table if not exists post_favour
(
    id         bigint auto_increment comment 'id' primary key,
    postId     bigint                             not null comment '帖子 id',
    userId     bigint                             not null comment '创建用户 id',
    createTime datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    index idx_postId (postId),
    index idx_userId (userId)
) comment '帖子收藏';

-- 物资信息表
create table if not exists material_info
(
    id           bigint auto_increment comment '物资ID' primary key,
    materialName varchar(100)                       not null comment '物资名称',
    category     varchar(50)                        not null comment '物资分类',
    location     varchar(100)                       null comment '存放位置',
    expireDate   datetime                           null comment '有效期（精确到时间）',
    stockTotal   int      default 0                 not null comment '当前库存总量（冗余字段，加快查询）',
    status       tinyint  default 1                 not null comment '状态：1正常 0停用',
    createBy     bigint                             null comment '创建人ID',
    createTime   datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateBy     bigint                             null comment '更新人ID',
    updateTime   datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    isDelete     tinyint  default 0                 not null comment '逻辑删除：0未删 1已删',
    index idx_category (category),
    index idx_status (status)
) comment '物资信息表' collate = utf8mb4_unicode_ci;

-- 库存信息表
create table if not exists inventory_info
(
    id            bigint auto_increment comment '库存ID' primary key,
    materialId    bigint                             not null comment '物资ID',
    location      varchar(100)                       null comment '存放位置',
    currentStock  int      default 0                 not null comment '当前库存',
    warnThreshold int      default 0                 not null comment '预警阈值',
    createTime    datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime    datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    isDelete      tinyint  default 0                 not null comment '逻辑删除：0未删 1已删',
    index idx_materialId (materialId)
) comment '库存表' collate = utf8mb4_unicode_ci;

-- 库存审批表
create table if not exists inventory_approval
(
    id             bigint auto_increment comment '审批ID' primary key,
    approvalNo     varchar(50)                        not null comment '申请单号',
    materialId     bigint                             not null comment '物资ID',
    quantity       int                                not null comment '申请数量',
    purpose        varchar(255)                       null comment '用途/去向',
    applicantId    bigint                             not null comment '申请人ID',
    applyTime      datetime default CURRENT_TIMESTAMP not null comment '提交时间',
    approveId      bigint                             null comment '审批人ID',
    approveTime    datetime                           null comment '审批时间',
    outTime        datetime                           null comment '出库时间',
    approveRemark  varchar(255)                       null comment '审批意见',
    status         tinyint  default 0                 not null comment '审批状态：0待审批 1已通过 2已驳回 3已完成出库',
    createTime     datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime     datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    isDelete       tinyint  default 0                 not null comment '逻辑删除：0未删 1已删',
    index idx_approvalNo (approvalNo),
    index idx_materialId (materialId),
    index idx_applicantId (applicantId),
    index idx_status (status)
) comment '库存审批表' collate = utf8mb4_unicode_ci;

-- 预警通知消息表
create table if not exists notice
(
    id         bigint auto_increment comment '通知ID' primary key,
    userId     bigint                             not null comment '接收用户ID',
    title      varchar(100)                       not null comment '标题',
    content    varchar(500)                       null comment '内容',
    noticeType tinyint                            not null comment '类型：1预警通知 2审批结果',
    refId      bigint                             null comment '关联业务ID',
    refType    tinyint                            null comment '关联业务类型：1审批 2预警',
    isRead     tinyint  default 0                 not null comment '是否已读：0未读 1已读',
    createTime datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    index idx_userId (userId),
    index idx_noticeType (noticeType),
    index idx_isRead (isRead)
) comment '通知消息表' collate = utf8mb4_unicode_ci;

-- 预警规则表
create table if not exists warn_rule
(
    id             bigint auto_increment comment '规则ID' primary key,
    ruleName       varchar(100)                       not null comment '规则名称',
    ruleType       tinyint                            not null comment '规则类型：1库存预警 2临期预警',
    materialId     bigint                             null comment '物资ID（为空表示全局规则）',
    thresholdValue int                                not null comment '阈值（库存值或临期天数）',
    isEnabled      tinyint  default 1                 not null comment '是否启用：0停用 1启用',
    createBy       bigint                             null comment '创建人ID',
    createTime     datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateBy       bigint                             null comment '更新人ID',
    updateTime     datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    isDelete       tinyint  default 0                 not null comment '逻辑删除：0未删 1已删',
    index idx_ruleType (ruleType),
    index idx_materialId (materialId),
    index idx_isEnabled (isEnabled)
) comment '预警规则表' collate = utf8mb4_unicode_ci;

-- 出入库流水表
create table if not exists stock_flow
(
    id                bigint auto_increment comment '流水ID' primary key,
    materialId        bigint                             not null comment '物资ID',
    flowType          varchar(20)                        not null comment '流水类型：MANUAL_IN调整入库/MANUAL_OUT调整出库/APPLY_OUT审批出库',
    quantity          int                                not null comment '数量（正数）',
    beforeStock       int                                null comment '变动前库存',
    afterStock        int                                null comment '变动后库存',
    operatorId        bigint                             null comment '操作人ID',
    relatedApprovalNo varchar(50)                        null comment '关联申请单号',
    remark            varchar(255)                       null comment '备注',
    createTime        datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    index idx_materialId (materialId),
    index idx_flowType (flowType),
    index idx_createTime (createTime)
) comment '出入库流水表' collate = utf8mb4_unicode_ci;

-- 预警记录表
create table if not exists warn_record
(
    id             bigint auto_increment comment '预警记录ID' primary key,
    ruleId         bigint                             null comment '规则ID',
    materialId     bigint                             not null comment '物资ID',
    warnType       tinyint                            not null comment '预警类型：1库存预警 2临期预警',
    currentValue   int                                not null comment '当前值（库存或剩余天数）',
    thresholdValue int                                not null comment '阈值',
    content        varchar(500)                       null comment '预警内容',
    handled        tinyint  default 0                 not null comment '是否已处理：0未处理 1已处理',
    handledBy      bigint                             null comment '处理人ID',
    handledTime    datetime                           null comment '处理时间',
    createTime     datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime     datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    index idx_ruleId (ruleId),
    index idx_materialId (materialId),
    index idx_warnType (warnType),
    index idx_handled (handled)
) comment '预警记录表' collate = utf8mb4_unicode_ci;
