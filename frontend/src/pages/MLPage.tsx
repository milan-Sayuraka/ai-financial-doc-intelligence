import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Form, InputNumber, Button, Select, Descriptions, Tag,
  Typography, Space, Alert, Progress, Row, Col, Statistic, Spin
} from 'antd';
import {
  ExperimentOutlined, SafetyCertificateOutlined, DollarOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { 
  predictCreditRisk, detectFraud, predictRepayment,
  fetchMLStatus, clearAllResults 
} from '../store/slices/mlSlice';

const { Title, Text } = Typography;

const MLPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { creditRiskResult, fraudDetectionResult, repaymentResult, modelsStatus, loading } = 
    useSelector((state: RootState) => state.ml);

  useEffect(() => {
    dispatch(fetchMLStatus());
  }, [dispatch]);

  const handleCreditRisk = (values: any) => {
    dispatch(predictCreditRisk(values));
  };

  const handleFraudDetection = (values: any) => {
    dispatch(detectFraud(values));
  };

  const handleRepayment = (values: any) => {
    dispatch(predictRepayment(values));
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      case 'critical': return '#cf1322';
      default: return 'blue';
    }
  };

  const tabItems = [
    {
      key: 'credit-risk',
      label: <span><SafetyCertificateOutlined /> Credit Risk</span>,
      children: (
        <Row gutter={16}>
          <Col span={10}>
            <Card title="Input Parameters">
              <Form layout="vertical" onFinish={handleCreditRisk}>
                <Form.Item name="monthly_income" label="Monthly Income (LKR)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={10000} placeholder="150000" />
                </Form.Item>
                <Form.Item name="loan_amount" label="Loan Amount (LKR)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={50000} placeholder="1000000" />
                </Form.Item>
                <Form.Item name="credit_score" label="Credit Score" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={250} max={900} placeholder="720" />
                </Form.Item>
                <Form.Item name="age" label="Age"><InputNumber style={{ width: '100%' }} min={18} max={80} /></Form.Item>
                <Form.Item name="employment_years" label="Employment Years"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
                <Form.Item name="existing_loans" label="Existing Loans"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
                <Form.Item name="dependents" label="Dependents"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<ThunderboltOutlined />} block>
                    Predict Risk
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={14}>
            {creditRiskResult ? (
              <Card title="Prediction Result">
                <Alert type={creditRiskResult.risk_level === 'low' ? 'success' : 
                  creditRiskResult.risk_level === 'critical' ? 'error' : 'warning'}
                  message={creditRiskResult.recommendation} style={{ marginBottom: 16 }} />
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Risk Score">
                    <Progress percent={creditRiskResult.risk_score} 
                      strokeColor={getRiskColor(creditRiskResult.risk_level)} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Risk Level">
                    <Tag color={getRiskColor(creditRiskResult.risk_level)}>{creditRiskResult.risk_level?.toUpperCase()}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Default Probability">{creditRiskResult.default_probability}%</Descriptions.Item>
                  <Descriptions.Item label="Recommendation">{creditRiskResult.recommendation}</Descriptions.Item>
                </Descriptions>
                {creditRiskResult.factors && (
                  <Card title="Risk Factors" size="small" style={{ marginTop: 16 }}>
                    {Object.entries(creditRiskResult.factors).map(([key, value]) => (
                      <Tag key={key} color={value === 'positive' || value === 'stable' || value === 'low' ? 'green' : 'red'}>
                        {key}: {String(value)}
                      </Tag>
                    ))}
                  </Card>
                )}
              </Card>
            ) : <EmptyState message="Submit parameters to predict credit risk" />}
          </Col>
        </Row>
      ),
    },
    {
      key: 'fraud-detection',
      label: <span><SafetyCertificateOutlined /> Fraud Detection</span>,
      children: (
        <Row gutter={16}>
          <Col span={10}>
            <Card title="Transaction Details">
              <Form layout="vertical" onFinish={handleFraudDetection}>
                <Form.Item name="amount" label="Amount (LKR)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="500000" />
                </Form.Item>
                <Form.Item name="transaction_count" label="Transaction Count"><InputNumber style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="avg_transaction_amount" label="Avg Transaction Amount"><InputNumber style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="account_age_days" label="Account Age (Days)"><InputNumber style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="login_frequency" label="Login Frequency"><InputNumber style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="device_changes" label="Device Changes"><InputNumber style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="transaction_type" label="Transaction Type" initialValue="transfer">
                  <Select options={[
                    { label: 'Transfer', value: 'transfer' },
                    { label: 'Payment', value: 'payment' },
                    { label: 'Withdrawal', value: 'withdrawal' },
                  ]} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} danger icon={<ThunderboltOutlined />} block>
                    Detect Fraud
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={14}>
            {fraudDetectionResult ? (
              <Card title="Detection Result">
                <Alert type={fraudDetectionResult.is_fraud ? 'error' : 'success'}
                  message={fraudDetectionResult.is_fraud ? 'FRAUD DETECTED!' : 'Transaction appears normal'}
                  description={fraudDetectionResult.action_required} style={{ marginBottom: 16 }} />
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Fraud Probability">
                    <Progress percent={Math.round(fraudDetectionResult.fraud_probability)} 
                      status={fraudDetectionResult.is_fraud ? 'exception' : 'success'} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Fraud Score">{fraudDetectionResult.fraud_score}</Descriptions.Item>
                  <Descriptions.Item label="Action Required" span={2}>
                    <Tag color={fraudDetectionResult.is_fraud ? 'red' : 'green'}>
                      {fraudDetectionResult.action_required}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
                {fraudDetectionResult.risk_factors && (
                  <Card title="Risk Factors" size="small" style={{ marginTop: 16 }}>
                    {fraudDetectionResult.risk_factors.map((factor: string, i: number) => (
                      <Tag color="red" key={i}>{factor}</Tag>
                    ))}
                  </Card>
                )}
              </Card>
            ) : <EmptyState message="Submit transaction details to detect fraud" />}
          </Col>
        </Row>
      ),
    },
    {
      key: 'repayment',
      label: <span><DollarOutlined /> Repayment</span>,
      children: (
        <Row gutter={16}>
          <Col span={10}>
            <Card title="Loan Details">
              <Form layout="vertical" onFinish={handleRepayment}>
                <Form.Item name="loan_amount" label="Loan Amount" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={10000} />
                </Form.Item>
                <Form.Item name="interest_rate" label="Interest Rate (%)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={1} max={30} />
                </Form.Item>
                <Form.Item name="tenure_months" label="Tenure (Months)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={6} max={300} />
                </Form.Item>
                <Form.Item name="monthly_income" label="Monthly Income" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={10000} />
                </Form.Item>
                <Form.Item name="credit_score" label="Credit Score" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={250} max={900} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<ThunderboltOutlined />} block>
                    Predict Repayment
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={14}>
            {repaymentResult ? (
              <Card title="Prediction Result">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Repayment Probability">
                    <Progress percent={repaymentResult.repayment_probability} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Prediction">
                    <Tag color={repaymentResult.prediction === 'on_time' ? 'green' : 
                      repaymentResult.prediction === 'default' ? 'red' : 'orange'}>
                      {repaymentResult.prediction?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Days to Payment">{repaymentResult.predicted_days_to_payment}</Descriptions.Item>
                  <Descriptions.Item label="Monthly Installment">LKR {repaymentResult.monthly_installment?.toLocaleString()}</Descriptions.Item>
                </Descriptions>
              </Card>
            ) : <EmptyState message="Submit loan details to predict repayment" />}
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}><ExperimentOutlined /> ML Models (PyTorch)</Title>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <Card>
    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
      <ExperimentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
      <p>{message}</p>
    </div>
  </Card>
);

export default MLPage;