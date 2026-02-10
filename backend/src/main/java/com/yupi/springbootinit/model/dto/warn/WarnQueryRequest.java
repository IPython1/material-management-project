package com.yupi.springbootinit.model.dto.warn;

import com.yupi.springbootinit.common.PageRequest;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 预警查询请求
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class WarnQueryRequest extends PageRequest implements Serializable {

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 预警类型：1库存 2临期
     */
    private Integer warnType;

    /**
     * 是否已处理：0未处理 1已处理
     */
    private Integer handled;

    private static final long serialVersionUID = 1L;
}
