package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import lombok.Data;

/**
 * 首页分类占比数据项
 */
@Data
public class DashboardPieItemVO implements Serializable {

    /**
     * 分类名称
     */
    private String category;

    /**
     * 库存总量
     */
    private Integer value;

    private static final long serialVersionUID = 1L;
}

