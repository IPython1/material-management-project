package com.yupi.springbootinit.model.dto.material;

import com.yupi.springbootinit.common.PageRequest;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 物资分页查询请求
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class MaterialQueryRequest extends PageRequest implements Serializable {

    /**
     * 物资名称（模糊查询）
     */
    private String materialName;

    /**
     * 物资分类
     */
    private String category;

    /**
     * 状态：1正常 0停用
     */
    private Integer status;

    private static final long serialVersionUID = 1L;
}

