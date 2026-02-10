package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 审批流程时间轴节点
 */
@Data
public class ApplyTimelineItemVO implements Serializable {

    /**
     * 节点名称
     */
    private String nodeName;

    /**
     * 操作人
     */
    private String operatorName;

    /**
     * 节点时间
     */
    private Date actionTime;

    /**
     * 备注
     */
    private String remark;

    private static final long serialVersionUID = 1L;
}
