import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    appointmentId: '',
    items: [{ service: '', serviceId: '', quantity: 1, price: 0, discount: 0 }],
    dueDate: '',
    notes: '',
    termsAndConditions: '',
    discountCode: '',
    discountType: 'percentage',
    discountValue: 0,
    taxRate: 18
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await adminService.getBusinesses();
        if (response.success) {
          setBusinesses(response.data || []);
          if (!selectedBusinessId && response.data && response.data.length > 0) {
            const firstBusinessId = response.data[0]._id;
            setSelectedBusinessId(firstBusinessId);
            localStorage.setItem('selectedBusinessId', firstBusinessId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null') {
        return;
      }

      try {
        const [customersRes, servicesRes] = await Promise.all([
          adminService.getCustomers({ businessId: selectedBusinessId }),
          adminService.getServices({ businessId: selectedBusinessId, isActive: true })
        ]);

        if (customersRes.success) {
          setCustomers(customersRes.data || []);
        }
        if (servicesRes.success) {
          setServices(servicesRes.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (selectedBusinessId) {
      fetchData();
    }
  }, [selectedBusinessId]);

  // Fetch appointments when customer is selected
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!formData.customerId || !selectedBusinessId) return;
      
      try {
        const response = await adminService.getAppointments({
          businessId: selectedBusinessId,
          customerId: formData.customerId,
          status: 'completed',
          limit: 50
        });
        if (response.success) {
          setAppointments(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    fetchAppointments();
  }, [formData.customerId, selectedBusinessId]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { service: '', serviceId: '', quantity: 1, price: 0, discount: 0 }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...formData.items];
    items[index] = { ...items[index], [field]: value };
    
    // If service is selected, update price
    if (field === 'serviceId' && value) {
      const selectedService = services.find(s => s._id === value);
      if (selectedService) {
        items[index].price = selectedService.price || 0;
        items[index].service = selectedService.name || '';
      }
    }
    
    setFormData({ ...formData, items });
  };

  const subtotal = formData.items.reduce((sum, item) => {
    const itemSubtotal = (item.price || 0) * (item.quantity || 1);
    const itemDiscount = item.discount || 0;
    return sum + itemSubtotal - itemDiscount;
  }, 0);
  
  const discountAmount = formData.discountType === 'percentage'
    ? (subtotal * (formData.discountValue || 0)) / 100
    : (formData.discountValue || 0);
  
  const taxAmount = ((subtotal - discountAmount) * (formData.taxRate || 18)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const validateForm = () => {
    const errors = {};
    if (!formData.customerId) errors.customerId = 'Customer is required';
    if (!formData.items || formData.items.length === 0) {
      errors.items = 'At least one item is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.serviceId) {
          errors[`item-${index}-service`] = 'Service is required';
        }
        if (!item.quantity || item.quantity <= 0) {
          errors[`item-${index}-quantity`] = 'Quantity must be greater than 0';
        }
        if (!item.price || item.price <= 0) {
          errors[`item-${index}-price`] = 'Price must be greater than 0';
        }
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null') {
      toast.error('Please select a business');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        businessId: selectedBusinessId,
        customerId: formData.customerId,
        items: formData.items.map(item => ({
          service: item.serviceId,
          name: item.service,
          quantity: Number(item.quantity),
          price: Number(item.price),
          discount: Number(item.discount) || 0
        })),
        dueDate: formData.dueDate || undefined,
        notes: formData.notes.trim() || undefined,
        termsAndConditions: formData.termsAndConditions.trim() || undefined,
        discountCode: formData.discountCode.trim() || undefined,
        discountType: formData.discountType || 'percentage',
        discountValue: formData.discountValue || 0,
        taxRate: formData.taxRate || 18
      };

      if (formData.appointmentId) {
        payload.appointmentId = formData.appointmentId;
      }

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await adminService.createInvoice(payload);

      if (response.success) {
        toast.success('Invoice created successfully!');
        navigate('/admin/invoices');
      } else {
        toast.error(response.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/admin/invoices')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
          <HiOutlineArrowLeft className="w-5 h-5" />Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600 mt-1">Create a new invoice for a customer</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Business Selector */}
          {businesses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">Select a business</option>
                {businesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer <span className="text-red-500">*</span></label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value, appointmentId: '' })}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.customerId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {`${customer.firstName || ''} ${customer.lastName || ''}`.trim()} - {customer.phone || 'N/A'}
                  </option>
                ))}
              </select>
              {formErrors.customerId && <p className="mt-1 text-sm text-red-600">{formErrors.customerId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appointment (Optional)</label>
              <select
                name="appointmentId"
                value={formData.appointmentId}
                onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={!formData.customerId}
              >
                <option value="">Select appointment</option>
                {appointments.map((appointment) => (
                  <option key={appointment._id} value={appointment._id}>
                    {appointment.bookingNumber || appointment._id} - {appointment.service?.name || 'N/A'} - {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Invoice Items <span className="text-red-500">*</span></h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-primary-700"
              >
                <HiOutlinePlus className="w-4 h-4" />Add Item
              </button>
            </div>
            {formErrors.items && <p className="text-sm text-red-600 mb-2">{formErrors.items}</p>}
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-5">
                    <select
                      value={item.serviceId}
                      onChange={(e) => updateItem(index, 'serviceId', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors[`item-${index}-service`] ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select service</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name} - ₹{service.price?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                    {formErrors[`item-${index}-service`] && <p className="mt-1 text-xs text-red-600">{formErrors[`item-${index}-service`]}</p>}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors[`item-${index}-quantity`] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors[`item-${index}-quantity`] && <p className="mt-1 text-xs text-red-600">{formErrors[`item-${index}-quantity`]}</p>}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors[`item-${index}-price`] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors[`item-${index}-price`] && <p className="mt-1 text-xs text-red-600">{formErrors[`item-${index}-price`]}</p>}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Discount"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <HiOutlineTrash className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount and Tax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 18 })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code (Optional)</label>
              <input
                type="text"
                name="discountCode"
                value={formData.discountCode}
                onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Additional notes for the invoice..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Terms and conditions..."
            />
          </div>

          {/* Summary */}
          <div className="border-t pt-6">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/invoices')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
          >
            <HiOutlineSave className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;

