import React, { useState, useEffect } from 'react';
import {
  Card, Input, Button, List, Tag, Typography, Space, Spin,
  Statistic, Row, Col, Empty
} from 'antd';
import {
  SearchOutlined, DatabaseOutlined, FileTextOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { searchDocuments, fetchRAGStats, ragChat } from '../store/slices/ragSlice';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const RAGPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { results, totalDocuments, loading } = useSelector((state: RootState) => state.rag);
  const [ragResponse, setRagResponse] = useState('');
  const [searchMode, setSearchMode] = useState<'search' | 'chat'>('search');

  useEffect(() => {
    dispatch(fetchRAGStats());
  }, [dispatch]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    if (searchMode === 'search') {
      dispatch(searchDocuments({ query, nResults: 5 }));
    } else {
      try {
        const result = await dispatch(ragChat({ message: query, useRag: true })).unwrap();
        setRagResponse(result.response || result.data?.response);
      } catch (error) {
        console.error('RAG chat failed:', error);
      }
    }
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      );
    }

    if (results.length === 0) {
      return <Empty description="Search for documents" />;
    }

    return (
      <List
        dataSource={results}
        renderItem={(item, i) => (
          <List.Item
            key={item.id}
            extra={
              item.relevance !== undefined ? (
                <Tag color="blue">
                  <StarOutlined /> {(item.relevance * 100).toFixed(0)}%
                </Tag>
              ) : null
            }
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>Result {i + 1}</Text>
                  {item.metadata?.category && (
                    <Tag color="purple">{item.metadata.category}</Tag>
                  )}
                </Space>
              }
              description={
                <Paragraph
                  ellipsis={{ rows: 3, expandable: true }}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {item.content}
                </Paragraph>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div>
      <Title level={2}>
        <DatabaseOutlined /> RAG Semantic Search
      </Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Documents"
              value={totalDocuments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Search Results"
              value={results.length}
              prefix={<SearchOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Vector DB"
              value="ChromaDB"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type={searchMode === 'search' ? 'primary' : 'default'}
            onClick={() => setSearchMode('search')}
          >
            Document Search
          </Button>
          <Button
            type={searchMode === 'chat' ? 'primary' : 'default'}
            onClick={() => setSearchMode('chat')}
          >
            RAG Chat
          </Button>
        </Space>
        <Search
          placeholder={searchMode === 'search' ? "Search documents..." : "Ask about documents..."}
          enterButton="Search"
          size="large"
          onSearch={handleSearch}
          loading={loading}
        />
      </Card>

      {ragResponse && searchMode === 'chat' && (
        <Card title="RAG Enhanced Response" style={{ marginBottom: 24, background: '#f6ffed' }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 15 }}>
            {ragResponse}
          </Paragraph>
        </Card>
      )}

      <Card title={`Results (${results.length})`}>
        {renderResults()}
      </Card>
    </div>
  );
};

export default RAGPage;