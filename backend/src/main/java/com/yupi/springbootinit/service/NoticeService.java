package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.notice.NoticeQueryRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.NoticeVO;

/**
 * 通知服务
 */
public interface NoticeService {

    /**
     * 通知列表
     */
    Page<NoticeVO> listNotice(NoticeQueryRequest noticeQueryRequest, User loginUser);

    /**
     * 标记已读
     */
    Boolean readNotice(Long noticeId, User loginUser);
}
