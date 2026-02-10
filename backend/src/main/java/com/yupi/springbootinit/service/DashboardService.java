package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.vo.ApplyVO;
import com.yupi.springbootinit.model.vo.DashboardPieItemVO;
import com.yupi.springbootinit.model.vo.DashboardStatVO;
import com.yupi.springbootinit.model.vo.DashboardTrendItemVO;
import com.yupi.springbootinit.model.vo.WarnVO;
import java.util.List;

/**
 * 首页看板服务
 */
public interface DashboardService {

    /**
     * 关键指标
     */
    DashboardStatVO getStat();

    /**
     * 趋势图（最近 7 天）
     */
    List<DashboardTrendItemVO> getTrend();

    /**
     * 分类占比
     */
    List<DashboardPieItemVO> getPie();

    /**
     * 待审批列表（Top N）
     */
    Page<ApplyVO> getTodo(int pageSize);

    /**
     * 预警列表（Top N，未处理）
     */
    Page<WarnVO> getWarn(int pageSize);
}

