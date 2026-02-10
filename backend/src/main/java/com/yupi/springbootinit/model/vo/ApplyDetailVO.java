package com.yupi.springbootinit.model.vo;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批详情视图
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ApplyDetailVO extends ApplyVO {

    /**
     * 流程时间轴
     */
    private List<ApplyTimelineItemVO> timeline = new ArrayList<>();
}
