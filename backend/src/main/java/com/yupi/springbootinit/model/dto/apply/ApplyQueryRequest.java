package com.yupi.springbootinit.model.dto.apply;

import com.yupi.springbootinit.common.PageRequest;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批查询请求
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ApplyQueryRequest extends PageRequest implements Serializable {

    /**
     * 审批状态
     */
    private Integer status;

    /**
     * 申请单号
     */
    private String approvalNo;

    /**
     * 物资名称
     */
    private String materialName;

    private static final long serialVersionUID = 1L;
}
