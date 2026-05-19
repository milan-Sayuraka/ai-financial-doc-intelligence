import React, { useState, useEffect } from 'react';
import {
  Card, Button, Form, Input, Select, InputNumber, Table, Tag,
  Typography, Space, Steps, Alert, Descriptions, Row, Col, Spin, Statistic
} from 'antd';
import {
  RobotOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, PlayCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { processLoan, fetchAgentsStatus } from '../store/slices/agentSlice';

const { Title, Text } = Typography;

const AgentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { agents, workflowResult, processing } = useSelector((state: RootState) => state.agents);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAgentsStatus());
  }, [dispatch]);

  const handleProcessLoan = async (values: any) => {
    dispatch(processLoan(values));
  };

  const getStepStatus = (stepName: string): 'finish' | 'process' | 'error' | 'wait' => {
    if (!workflowResult) return 'wait';
    const step = workflowResult.workflow_steps?.find((s: any) => s.step === stepName);
    if (!step) return 'wait';
    if (step.status === 'completed') return 'finish';
    if (step.status === 'failed') return 'error';
    return 'process';
  };

  return (
    <div>
      <Title level={2}><RobotOutlined /> AI Agents</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {agents.map((agent, index) => (
          <Col span={6} key={index}>
            <Card hoverable>
              <Statistic title={agent.name} value={agent.role} 
                prefix={<RobotOutlined />} valueStyle={{ fontSize: 14 }} />
              <Tag color="green" style={{ marginTop: 8 }}>{agent.status}</Tag>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={10}>
          <Card title="Process Loan Application">
            <Form form={form} layout="vertical" onFinish={handleProcessLoan}>
              <Form.Item name="customer_id" label="Customer ID" rules={[{ required: true }]}>
                <Input placeholder="CUST001" />
              </Form.Item>
              <Form.Item name="customer_name" label="Customer Name" rules={[{ required: true }]}>
                <Input placeholder="John Doe" />
              </Form.Item>
              <Form.Item name="loan_type" label="Loan Type" initialValue="personal">
                <Select options={[
                  { label: 'Personal Loan', value: 'personal' },
                  { label: 'Business Loan', value: 'business' },
                  { label: 'Mortgage', value: 'mortgage' },
                ]} />
              </Form.Item>
              <Form.Item name="loan_amount" label="Loan Amount (LKR)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={50000} max={50000000} 
                  step={10000} placeholder="500000" />
              </Form.Item>
              <Form.Item name="monthly_income" label="Monthly Income (LKR)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={10000} 
                  placeholder="100000" />
              </Form.Item>
              <Form.Item name="credit_score" label="Credit Score" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={250} max={900} 
                  placeholder="700" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={processing} 
                  icon={<PlayCircleOutlined />} block size="large">
                  Process Application
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={14}>
          {workflowResult ? (
            <>
              <Card title="Workflow Progress" style={{ marginBottom: 16 }}>
                <Steps
                  current={workflowResult.workflow_steps?.length || 0}
                  status={workflowResult.success ? 'finish' : 'error'}
                  items={[
                    { title: 'Verification', status: getStepStatus('verification') },
                    { title: 'Risk Assessment', status: getStepStatus('risk_assessment') },
                    { title: 'Loan Processing', status: getStepStatus('loan_processing') },
                    { title: 'Decision', status: workflowResult.success ? 'finish' : 'error' },
                  ]}
                />
              </Card>

              <Card title="Result">
                <Alert
                  type={workflowResult.success ? 'success' : workflowResult.requires_human_review ? 'warning' : 'error'}
                  message={workflowResult.final_summary}
                  style={{ marginBottom: 16 }}
                />
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Customer">{workflowResult.customer_name}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={workflowResult.success ? 'green' : 'orange'}>{workflowResult.status}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Approved">
                    {workflowResult.details?.loan_approved ? 
                      <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Amount">
                    LKR {workflowResult.details?.approved_amount?.toLocaleString() || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Interest Rate">
                    {workflowResult.details?.interest_rate || 'N/A'}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Risk Level">
                    <Tag color={
                      workflowResult.details?.risk_level === 'low' ? 'green' :
                      workflowResult.details?.risk_level === 'medium' ? 'orange' : 'red'
                    }>{workflowResult.details?.risk_level}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Risk Score" span={2}>
                    {workflowResult.details?.risk_score || 'N/A'}
                  </Descriptions.Item>
                  {workflowResult.requires_human_review && (
                    <Descriptions.Item label="Action Required" span={2}>
                      <Tag color="orange">Human Review Required</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                <RobotOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <p>Submit a loan application to see the multi-agent workflow in action</p>
                <Text type="secondary">
                  The Loan Agent, Risk Agent, Verification Agent, and Collection Agent 
                  will work together to process the application.
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AgentsPage;