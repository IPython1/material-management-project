package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.warn.WarnQueryRequest;
import com.yupi.springbootinit.model.dto.warn.WarnRuleSaveRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.WarnRuleVO;
import com.yupi.springbootinit.model.vo.WarnVO;
import java.util.List;

/**
 * 预警服务
 */
public interface WarnService {

    /**
     * 预警列表
     */
    Page<WarnVO> listWarn(WarnQueryRequest warnQueryRequest);

    /**
     * 预警规则列表
     */
    List<WarnRuleVO> listWarnRule();

    /**
     * 新增/修改预警规则
     */
    Long saveWarnRule(WarnRuleSaveRequest warnRuleSaveRequest, User loginUser);

    /**
     * 预警记录标记已处理
     */
    Boolean markWarnHandled(Long warnRecordId, User loginUser);

    /**
     * 按规则执行预警扫描并落库
     */
    void syncWarnRecordsByRules();

    /**
     * 指定物资库存变化后执行预警
     */
    void syncStockWarnForMaterial(Long materialId, Integer currentStock);
}
