import React, { useState, useEffect } from 'react';
import {
  Card, Upload, Button, Table, Tag, Space, Typography, Select,
  message, Progress, Descriptions, Modal
} from 'antd';
import {
  UploadOutlined, FileTextOutlined, FilePdfOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchDocuments, uploadDocument } from '../store/slices/documentSlice';

const { Title } = Typography;
const { Dragger } = Upload;

const DocumentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { documents, loading, uploading } = useSelector((state: RootState) => state.documents);
  const [documentType, setDocumentType] = useState('payslip');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleUpload: UploadProps['customRequest'] = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      await dispatch(uploadDocument({ file, documentType })).unwrap();
      message.success(`${file.name} uploaded and processed successfully`);
      onSuccess(null, file);
    } catch (error) {
      message.error(`Failed to process ${file.name}`);
      onError(error);
    }
  };

  const columns = [
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
      render: (text: string, record: any) => (
        <Space>
          {record.file_type === 'pdf' ? <FilePdfOutlined style={{ color: '#ff4d4f' }} /> : <FileTextOutlined />}
          {text}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'document_type',
      key: 'document_type',
      render: (type: string) => (
        <Tag color="blue">{type?.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence_score',
      key: 'confidence_score',
      render: (score: number) => (
        <Progress
          percent={Math.round((score || 0) * 100)}
          size="small"
          status={score > 0.7 ? 'success' : score > 0.4 ? 'active' : 'exception'}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'validation_status',
      key: 'validation_status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
          validated: { color: 'green', icon: <CheckCircleOutlined /> },
          pending: { color: 'orange', icon: <ClockCircleOutlined /> },
          rejected: { color: 'red', icon: <CloseCircleOutlined /> },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color} icon={config.icon}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedDoc(record);
            setModalVisible(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <FileTextOutlined /> Document AI
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space>
            <Select
              value={documentType}
              onChange={setDocumentType}
              style={{ width: 200 }}
              options={[
                { label: 'Payslip', value: 'payslip' },
                { label: 'NIC', value: 'nic' },
                { label: 'Bank Statement', value: 'bank_statement' },
              ]}
            />
          </Space>
          
          <Dragger
            customRequest={handleUpload}
            showUploadList={true}
            accept=".pdf,.jpg,.jpeg,.png,.tiff"
            disabled={uploading}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag document to upload</p>
            <p className="ant-upload-hint">
              Supports PDF, JPG, PNG, TIFF files
            </p>
          </Dragger>
        </Space>
      </Card>

      <Card title="Processed Documents">
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Document Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedDoc && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Filename">{selectedDoc.filename}</Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color="blue">{selectedDoc.document_type?.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Confidence">
              <Progress percent={Math.round((selectedDoc.confidence_score || 0) * 100)} />
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedDoc.validation_status === 'validated' ? 'green' : 'orange'}>
                {selectedDoc.validation_status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Extracted Data" span={2}>
              <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                {JSON.stringify(selectedDoc.extracted_data, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="Upload Date" span={2}>
              {new Date(selectedDoc.created_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default DocumentsPage;