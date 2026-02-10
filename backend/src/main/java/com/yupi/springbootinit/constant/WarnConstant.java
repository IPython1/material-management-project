package com.yupi.springbootinit.constant;

/**
 * 预警常量
 */
public interface WarnConstant {

    /**
     * 库存预警
     */
    int TYPE_STOCK_LOW = 1;

    /**
     * 有效期预警
     */
    int TYPE_EXPIRE_NEAR = 2;

    /**
     * 启用
     */
    int ENABLED = 1;

    /**
     * 停用
     */
    int DISABLED = 0;

    /**
     * 未处理
     */
    int UNHANDLED = 0;

    /**
     * 已处理
     */
    int HANDLED = 1;

    /**
     * 临期天数阈值
     */
    int EXPIRE_WARN_DAYS = 7;
}
