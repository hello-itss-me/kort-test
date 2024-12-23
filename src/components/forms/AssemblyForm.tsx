import React, { useState } from 'react';
    import { FormField } from './FormField';
    import { supabase } from '../../lib/supabase';
    import { toast } from 'react-hot-toast';
    import { QRScanner } from '../QRScanner';

    export function AssemblyForm() {
      const [formData, setFormData] = useState({
        motorId: '',
        productName: '',
        contractor: '',
        employeeId: '',
        assemblyDate: '',
        assemblyTime: '',
        bearingId: '',
        fanId: '',
        sealId: ''
      });

      const [isScannerOpen, setIsScannerOpen] = useState(false);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // If motorId changes, fetch product data
        if (name === 'motorId' && value) {
          fetchProductData(value);
        }
      };

      const handleScanResult = (result: string) => {
        const url = new URL(result);
        const id = url.searchParams.get('id');
        if (id) {
          setFormData(prev => ({ ...prev, motorId: id }));
          fetchProductData(id);
        } else {
          toast.error('Не удалось извлечь ID из QR-кода');
        }
        setIsScannerOpen(false);
      };

      const fetchProductData = async (motorId: string) => {
        try {
          const { data, error } = await supabase
            .from('product_data')
            .select('name, contractor')
            .eq('id', parseInt(motorId))
            .single();

          if (error) throw error;

          if (data) {
            setFormData(prev => ({
              ...prev,
              productName: data.name,
              contractor: data.contractor
            }));
          }
        } catch (error) {
          toast.error('Ошибка при получении данных продукта');
        }
      };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const { error } = await supabase.from('motor_assembly').insert([
            {
              motor_id: parseInt(formData.motorId),
              employee_id: formData.employeeId,
              assembly_date: formData.assemblyDate,
              assembly_time: formData.assemblyTime,
              bearing_id: formData.bearingId || null,
              fan_id: formData.fanId || null,
              seal_id: formData.sealId || null
            }
          ]);

          if (error) throw error;
          
          toast.success('Данные успешно сохранены');
          // Reset form
          setFormData({
            motorId: '',
            productName: '',
            contractor: '',
            employeeId: '',
            assemblyDate: '',
            assemblyTime: '',
            bearingId: '',
            fanId: '',
            sealId: ''
          });
        } catch (error) {
          toast.error('Ошибка при сохранении данных');
        }
      };

      return (
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label">ID Электродвигателя</label>
            <div className="flex">
              <input
                type="text"
                name="motorId"
                value={formData.motorId}
                onChange={handleChange}
                placeholder="Введите ID электродвигателя"
                className="flex-grow mr-2"
              />
              <button
                type="button"
                onClick={() => setIsScannerOpen(!isScannerOpen)}
                className="submit-button"
              >
                {isScannerOpen ? 'Закрыть QR' : 'Сканировать QR'}
              </button>
            </div>
            {isScannerOpen && <QRScanner onResult={handleScanResult} isScannerOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />}
          </div>
          <FormField
            label="Название товара"
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Введите ID Электродвигателя в строке выше"
            disabled
          />
          <FormField
            label="Контрагент"
            type="text"
            name="contractor"
            value={formData.contractor}
            onChange={handleChange}
            placeholder="Заполнится при вводе ID электродвигателя"
            disabled
          />
          <FormField
            label="ID Сотрудника"
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="Введите ID сотрудника"
          />
          <FormField
            label="Дата Сборки"
            type="date"
            name="assemblyDate"
            value={formData.assemblyDate}
            onChange={handleChange}
          />
          <FormField
            label="Время Сборки"
            type="time"
            name="assemblyTime"
            value={formData.assemblyTime}
            onChange={handleChange}
          />
          <FormField
            label="Замена Подшипника (ID)"
            type="text"
            name="bearingId"
            value={formData.bearingId}
            onChange={handleChange}
            placeholder="Введите ID подшипника"
          />
          <FormField
            label="Замена Вентилятора (ID)"
            type="text"
            name="fanId"
            value={formData.fanId}
            onChange={handleChange}
            placeholder="Введите ID вентилятора"
          />
          <FormField
            label="Замена Уплотнение торцевое (ID)"
            type="text"
            name="sealId"
            value={formData.sealId}
            onChange={handleChange}
            placeholder="Введите ID торцевого уплотнения"
          />
          <button type="submit" className="submit-button">
            Отправить
          </button>
        </form>
      );
    }
