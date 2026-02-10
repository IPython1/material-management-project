package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.constant.NoticeConstant;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.mapper.NoticeMapper;
import com.yupi.springbootinit.model.dto.notice.NoticeQueryRequest;
import com.yupi.springbootinit.model.entity.Notice;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.NoticeVO;
import com.yupi.springbootinit.service.NoticeService;
import java.util.List;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

/**
 * 通知服务实现
 */
@Service
public class NoticeServiceImpl implements NoticeService {

    @Resource
    private NoticeMapper noticeMapper;

    @Override
    public Page<NoticeVO> listNotice(NoticeQueryRequest noticeQueryRequest, User loginUser) {
        NoticeQueryRequest queryRequest = noticeQueryRequest == null ? new NoticeQueryRequest() : noticeQueryRequest;
        QueryWrapper<Notice> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", loginUser.getId());
        queryWrapper.eq(queryRequest.getIsRead() != null, "isRead", queryRequest.getIsRead());
        queryWrapper.orderByDesc("createTime");
        Page<Notice> noticePage = noticeMapper.selectPage(new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize()),
                queryWrapper);

        Page<NoticeVO> voPage = new Page<>(noticePage.getCurrent(), noticePage.getSize(), noticePage.getTotal());
        List<NoticeVO> noticeVOList = noticePage.getRecords().stream().map(notice -> {
            NoticeVO noticeVO = new NoticeVO();
            BeanUtils.copyProperties(notice, noticeVO);
            return noticeVO;
        }).collect(Collectors.toList());
        voPage.setRecords(noticeVOList);
        return voPage;
    }

    @Override
    public Boolean readNotice(Long noticeId, User loginUser) {
        if (noticeId == null || noticeId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Notice notice = noticeMapper.selectById(noticeId);
        if (notice == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "通知不存在");
        }
        if (!notice.getUserId().equals(loginUser.getId())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        if (notice.getIsRead() != null && notice.getIsRead() == NoticeConstant.READ) {
            return true;
        }
        notice.setIsRead(NoticeConstant.READ);
        return noticeMapper.updateById(notice) > 0;
    }
}
