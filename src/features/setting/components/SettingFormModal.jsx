import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Radio,
  ColorPicker,
  Typography,
  Divider,
  Space,
} from 'antd';
import { SettingOutlined, EditOutlined } from '@ant-design/icons';
import { SETTING_TYPES } from '../services/settingApi';

const { Text } = Typography;
const { TextArea } = Input;

const TYPE_HINTS = {
  text: 'Any text, e.g. shop name or receipt footer.',
  number: 'A number, e.g. tax percent or exchange rate.',
  boolean: 'On / off switch, e.g. enable loyalty points.',
  email: 'An email address, e.g. support email.',
  url: 'A link starting with http:// or https://',
  color: 'A brand color.',
  json: 'Structured data, e.g. {"open": "08:00", "close": "21:00"}',
};

const label = (text, required = false) => (
  <Text strong style={{ fontSize: 13 }}>
    {text} {required && <span style={{ color: '#ff4d4f' }}>*</span>}
  </Text>
);

// Stored value (string) → form field value for the given type
function toFormValue(value, type) {
  if (value === null || value === undefined) {
    return type === 'boolean' ? false : type === 'color' ? '#1677ff' : undefined;
  }
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true';
    case 'json':
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

// Form field value → value sent to the API
function toApiValue(value, type) {
  if (value === undefined || value === null || value === '') return null;
  switch (type) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'color':
      return typeof value === 'string' ? value : value.toHexString();
    case 'number':
      return String(value);
    default:
      return String(value);
  }
}

function ValueInput({ type }) {
  switch (type) {
    case 'number':
      return <InputNumber size="large" style={{ width: '100%' }} />;
    case 'boolean':
      return <Switch checkedChildren="True" unCheckedChildren="False" />;
    case 'color':
      return <ColorPicker showText format="hex" disabledAlpha />;
    case 'json':
      return <TextArea rows={5} style={{ fontFamily: 'monospace' }} maxLength={500} showCount />;
    case 'email':
      return <Input size="large" type="email" maxLength={500} />;
    case 'url':
      return <Input size="large" maxLength={500} placeholder="https://" />;
    default:
      return <TextArea rows={2} maxLength={500} showCount />;
  }
}

function valueRules(type) {
  switch (type) {
    case 'email':
      return [{ type: 'email', message: 'Please enter a valid email' }];
    case 'url':
      return [{ type: 'url', message: 'Please enter a valid URL' }];
    case 'json':
      return [
        {
          validator: (_, value) => {
            if (!value) return Promise.resolve();
            try {
              JSON.parse(value);
              return Promise.resolve();
            } catch {
              return Promise.reject(new Error('Invalid JSON'));
            }
          },
        },
      ];
    default:
      return [];
  }
}

export function SettingFormModal({ open = false, setting = null, loading = false, onSubmit, onCancel }) {
  const [form] = Form.useForm();
  const type = Form.useWatch('setting_type', form) || 'text';
  const scope = Form.useWatch('scope', form) || 'global';
  const isEditMode = Boolean(setting && setting.setting_id);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (setting) {
      form.setFieldsValue({
        setting_key: setting.setting_key,
        setting_type: setting.setting_type,
        setting_value: toFormValue(setting.setting_value, setting.setting_type),
        scope: setting.store_id ? 'store' : 'global',
        store_id: setting.store_id || undefined,
      });
    } else {
      form.setFieldsValue({ setting_type: 'text', scope: 'global' });
    }
  }, [open, setting, form]);

  // Reset the value when the type changes, so a number field never receives "true" etc.
  const handleValuesChange = (changed) => {
    if (changed.setting_type) {
      form.setFieldsValue({ setting_value: toFormValue(null, changed.setting_type) });
    }
  };

  const handleFinish = async (values) => {
    await onSubmit({
      setting_key: values.setting_key.trim(),
      setting_type: values.setting_type,
      setting_value: toApiValue(values.setting_value, values.setting_type),
      store_id: values.scope === 'store' ? values.store_id : null,
    });
  };

  return (
    <Modal
      open={open}
      title={
        <Space size="small" style={{ fontSize: 16 }}>
          {isEditMode ? <EditOutlined style={{ color: '#1677ff' }} /> : <SettingOutlined style={{ color: '#1677ff' }} />}
          <span style={{ fontWeight: 600 }}>
            {isEditMode ? `Edit Setting: ${setting.setting_key}` : 'Create New Setting'}
          </span>
        </Space>
      }
      okText={isEditMode ? 'Save Changes' : 'Create Setting'}
      cancelText="Cancel"
      confirmLoading={loading}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={560}
      centered
    >
      <Divider style={{ margin: '12px 0 20px 0' }} />
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        requiredMark="optional"
      >
        <Form.Item
          name="setting_key"
          label={label('Setting Key', true)}
          extra="Letters, numbers, _ . - (start with a letter). Example: store.name, tax_percent"
          rules={[
            { required: true, message: 'Please enter setting key' },
            {
              pattern: /^[a-zA-Z][a-zA-Z0-9_.-]{1,99}$/,
              message: '2-100 characters, start with a letter, only letters, numbers, _ . -',
            },
          ]}
        >
          <Input size="large" maxLength={100} showCount style={{ fontFamily: 'monospace' }} />
        </Form.Item>

        <Form.Item name="setting_type" label={label('Value Type', true)} extra={TYPE_HINTS[type]}>
          <Select
            size="large"
            options={SETTING_TYPES.map((t) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }))}
          />
        </Form.Item>

        <Form.Item
          name="setting_value"
          label={label('Value')}
          valuePropName={type === 'boolean' ? 'checked' : 'value'}
          rules={valueRules(type)}
        >
          <ValueInput type={type} />
        </Form.Item>

        <Form.Item name="scope" label={label('Scope')}>
          <Radio.Group>
            <Radio value="global">Global (all stores)</Radio>
            <Radio value="store">Specific store</Radio>
          </Radio.Group>
        </Form.Item>

        {scope === 'store' && (
          <Form.Item
            name="store_id"
            label={label('Store ID', true)}
            extra="A store setting overrides the global setting with the same key."
            rules={[{ required: true, message: 'Please enter store ID' }]}
          >
            <InputNumber size="large" min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default SettingFormModal;
