package com.yupi.springbootinit.constant;

/**
 * 通知常量
 */
public interface NoticeConstant {

    /**
     * 通知类型：预警
     */
    int TYPE_WARN = 1;

    /**
     * 通知类型：审批结果
     */
    int TYPE_APPROVAL_RESULT = 2;

    /**
     * 关联类型：审批
     */
    int REF_TYPE_APPROVAL = 1;

    /**
     * 关联类型：预警
     */
    int REF_TYPE_WARN = 2;

    /**
     * 未读
     */
    int UNREAD = 0;

    /**
     * 已读
     */
    int READ = 1;
}
