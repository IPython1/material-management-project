package com.yupi.springbootinit.model.dto.apply;

import java.io.Serializable;
import lombok.Data;

/**
 * 新建审批请求
 */
@Data
public class ApplyAddRequest implements Serializable {

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 申请数量
     */
    private Integer quantity;

    /**
     * 用途/去向
     */
    private String purpose;

    private static final long serialVersionUID = 1L;
}
