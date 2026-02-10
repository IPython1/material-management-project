package com.yupi.springbootinit.model.dto.material;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 物资新增 / 编辑请求
 */
@Data
public class MaterialSaveRequest implements Serializable {

    /**
     * 物资ID，编辑时必填
     */
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
     * 状态：1正常 0停用
     */
    private Integer status;

    private static final long serialVersionUID = 1L;
}

