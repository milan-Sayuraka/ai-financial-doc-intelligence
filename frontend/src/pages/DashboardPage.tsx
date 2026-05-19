import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import {
  MessageOutlined,
  FileTextOutlined,
  RobotOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    conversations: 0,
    documents: 0,
    ragDocuments: 0,
    agents: 4,
    mlModels: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [convRes, ragStats] = await Promise.allSettled([
        apiService.getConversations(),
        apiService.getRAGStats(),
      ]);

      const newStats = { ...stats };
      
      if (convRes.status === 'fulfilled') {
        newStats.conversations = convRes.value.data?.length || 0;
      }
      if (ragStats.status === 'fulfilled') {
        newStats.ragDocuments = ragStats.value.total_documents || 0;
      }

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'AI Chat Assistant',
      icon: <MessageOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      value: stats.conversations,
      suffix: 'conversations',
      path: '/chat',
      color: '#e6f7ff',
    },
    {
      title: 'Document AI',
      icon: <FileTextOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      value: stats.documents,
      suffix: 'documents',
      path: '/documents',
      color: '#f6ffed',
    },
    {
      title: 'RAG System',
      icon: <DatabaseOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      value: stats.ragDocuments,
      suffix: 'knowledge docs',
      path: '/rag',
      color: '#f9f0ff',
    },
    {
      title: 'AI Agents',
      icon: <RobotOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      value: stats.agents,
      suffix: 'active agents',
      path: '/agents',
      color: '#fff7e6',
    },
    {
      title: 'ML Models',
      icon: <ExperimentOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
      value: stats.mlModels,
      suffix: 'models ready',
      path: '/ml-models',
      color: '#fff0f6',
    },
    {
      title: 'System Status',
      icon: <CheckCircleOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
      value: 'All',
      suffix: 'systems operational',
      path: '/',
      color: '#e6fffb',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              hoverable
              onClick={() => navigate(feature.path)}
              style={{ background: feature.color, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {feature.icon}
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{feature.title}</div>
                  <Statistic 
                    value={feature.value} 
                    suffix={feature.suffix}
                    valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DashboardPage;