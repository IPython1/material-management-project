package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.material.MaterialQueryRequest;
import com.yupi.springbootinit.model.dto.material.MaterialSaveRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.MaterialVO;

/**
 * 物资管理服务
 */
public interface MaterialService {

    /**
     * 物资分页查询
     */
    Page<MaterialVO> listMaterial(MaterialQueryRequest materialQueryRequest);

    /**
     * 新增 / 编辑物资
     */
    Long saveMaterial(MaterialSaveRequest materialSaveRequest, User loginUser);

    /**
     * 逻辑删除物资
     */
    Boolean deleteMaterial(Long id, User loginUser);

    /**
     * 物资详情
     */
    MaterialVO getMaterialDetail(Long id);
}

