import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Typography, Space, Spin, Tag, List } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiService from '../services/api';
import { ChatMessage } from '../types';

const { Title, Text } = Typography;

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await apiService.sendMessage(inputValue, conversationId || undefined);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || response.data?.response,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Title level={2}>
        <RobotOutlined /> AI Chat Assistant
      </Title>
      
      <Card 
        style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}
        bodyStyle={{ padding: 16 }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <RobotOutlined style={{ fontSize: 48 }} />
            <p>Start a conversation with the AI Assistant</p>
            <Space>
              <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => setInputValue('What loans do you offer?')}>
                What loans do you offer?
              </Tag>
              <Tag color="green" style={{ cursor: 'pointer' }} onClick={() => setInputValue('What documents are required?')}>
                What documents are required?
              </Tag>
              <Tag color="orange" style={{ cursor: 'pointer' }} onClick={() => setInputValue('Tell me about repayment')}>
                Tell me about repayment
              </Tag>
            </Space>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: 12,
                background: msg.role === 'user' ? '#1890ff' : '#f0f2f5',
                color: msg.role === 'user' ? 'white' : 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {msg.role === 'assistant' ? <RobotOutlined /> : <UserOutlined />}
                <Text strong style={{ color: msg.role === 'user' ? 'white' : 'inherit', fontSize: 12 }}>
                  {msg.role === 'assistant' ? 'AI Assistant' : user?.full_name}
                </Text>
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ textAlign: 'center' }}>
            <Spin size="small" /> Thinking...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </Card>

      <div style={{ display: 'flex', gap: 8 }}>
        <Input.TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
          size="large"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;