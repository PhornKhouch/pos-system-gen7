import React from 'react';
import { Card, List, Tag, Space, Button } from 'antd';
import { PlusOutlined, FolderOutlined } from '@ant-design/icons';
import { Header } from '@/components/layout/Header';

export function CategoryList() {
  const categories = [
    { name: 'Accessories', count: '45 items', status: 'Active' },
    { name: 'Monitors', count: '12 items', status: 'Active' },
    { name: 'Charging', count: '28 items', status: 'Active' },
    { name: 'Audio', count: '16 items', status: 'Active' },
  ];

  return (
    <div>
      <Header
        title="Product Categories"
        subtitle="Submenu Sample: Manage inventory categories and tags"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            New Category
          </Button>
        }
      />
      <Card>
        <List
          itemLayout="horizontal"
          dataSource={categories}
          renderItem={(item) => (
            <List.Item
              actions={[<Button type="link" key="edit">Edit</Button>]}
            >
              <List.Item.Meta
                avatar={<FolderOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                title={<span style={{ fontWeight: 600 }}>{item.name}</span>}
                description={item.count}
              />
              <Tag color="success">{item.status}</Tag>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

export default CategoryList;
