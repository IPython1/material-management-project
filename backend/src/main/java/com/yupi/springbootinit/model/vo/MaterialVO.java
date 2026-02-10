package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 物资信息展示视图
 */
@Data
public class MaterialVO implements Serializable {

    private Long id;

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 物资分类
     */
    private String category;

    /**
     * 存放位置
     */
    private String location;

    /**
     * 有效期
     */
    private Date expireDate;

    /**
     * 当前库存总量
     */
    private Integer stockTotal;

    /**
     * 状态：1正常 0停用
     */
    private Integer status;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    private static final long serialVersionUID = 1L;
}

