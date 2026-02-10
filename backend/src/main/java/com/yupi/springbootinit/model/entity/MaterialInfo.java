package com.yupi.springbootinit.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 物资信息表
 */
@TableName(value = "material_info")
@Data
public class MaterialInfo implements Serializable {

    /**
     * 物资ID
     */
    @TableId(type = IdType.ASSIGN_ID)
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
     * 创建人ID
     */
    private Long createBy;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新人ID
     */
    private Long updateBy;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 逻辑删除：0未删 1已删
     */
    @TableLogic
    private Integer isDelete;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
