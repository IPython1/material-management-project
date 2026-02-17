package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.apply.ApplyAddRequest;
import com.yupi.springbootinit.model.dto.apply.ApplyQueryRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.ApplyDetailVO;
import com.yupi.springbootinit.model.vo.ApplyVO;

/**
 * 审批服务
 */
public interface ApplyService {

    /**
     * 提交申请
     */
    Long createApply(ApplyAddRequest applyAddRequest, User loginUser);

    /**
     * 我的申请
     */
    Page<ApplyVO> listMyApply(ApplyQueryRequest applyQueryRequest, User loginUser);

    /**
     * 待审批列表
     */
    Page<ApplyVO> listPendingApply(ApplyQueryRequest applyQueryRequest);

    /**
     * 历史审批列表（不含待审批）
     */
    Page<ApplyVO> listHistoryApply(ApplyQueryRequest applyQueryRequest);

    /**
     * 通过审批
     */
    Boolean approveApply(Long applyId, String approveRemark, User adminUser);

    /**
     * 驳回审批
     */
    Boolean rejectApply(Long applyId, String approveRemark, User adminUser);

    /**
     * 获取审批详情
     */
    ApplyDetailVO getApplyDetail(Long applyId, User loginUser);
}
