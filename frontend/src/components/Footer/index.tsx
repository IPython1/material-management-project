import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  const defaultMessage = '物资管理系统';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'home',
          title: '系统首页',
          href: '/welcome',
          blankTarget: true,
        },
        {
          key: 'docs',
          title: '使用文档',
          href: '#',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
