import React, { useState } from 'react';
import { Card, Alert } from 'antd';
import { Header } from '@/components/layout/Header';
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/useModal';
import { useNotification } from '@/hooks/useNotification';
import { useSettings } from '../hooks/useSettings';
import { SettingFilter } from '../components/SettingFilter';
import { SettingTable } from '../components/SettingTable';
import { SettingFormModal } from '../components/SettingFormModal';

export function GeneralSetting() {
  const { notifySuccess, notifyError } = useNotification();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [scope, setScope] = useState('all');
  const [selectedSetting, setSelectedSetting] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const { isOpen, open, close } = useModal();

  const { settings, total, loading, submitting, error, refetch, addSetting, editSetting, removeSetting } =
    useSettings({
      search: debouncedSearch,
      setting_type: type,
      store_id: scope,
    });

  const handleOpenCreateModal = () => {
    setSelectedSetting(null);
    open();
  };

  const handleOpenEditModal = (setting) => {
    setSelectedSetting(setting);
    open();
  };

  const handleCloseModal = () => {
    close();
    setSelectedSetting(null);
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (selectedSetting && selectedSetting.setting_id) {
        const res = await editSetting(selectedSetting.setting_id, payload);
        notifySuccess('Success', res?.message || 'Setting updated successfully!');
      } else {
        const res = await addSetting(payload);
        notifySuccess('Success', res?.message || 'Setting created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      notifyError('Error', err.message || 'Operation failed. Please try again.');
    }
  };

  const handleDeleteSetting = async (id) => {
    try {
      const res = await removeSetting(id);
      notifySuccess('Deleted', res?.message || 'Setting deleted successfully!');
    } catch (err) {
      notifyError('Error', err.message || 'Failed to delete setting.');
    }
  };

  return (
    <div className="setting-management-container">
      <Header
        title="General Settings"
        subtitle="Configure system-wide or per-store values such as shop info, tax, contact and display options"
      />

      {error && (
        <Alert
          type="error"
          message="Failed to load settings"
          description={error}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Card style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #f0f0f0' }}>
        <SettingFilter
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
          scope={scope}
          onScopeChange={setScope}
          onRefresh={refetch}
          onAddClick={handleOpenCreateModal}
          loading={loading}
          totalCount={total}
        />
      </Card>

      <Card
        styles={{ body: { padding: 0 } }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <SettingTable
          settings={settings}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteSetting}
        />
      </Card>

      <SettingFormModal
        open={isOpen}
        setting={selectedSetting}
        loading={submitting}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseModal}
      />
    </div>
  );
}

export default GeneralSetting;
