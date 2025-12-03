import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import apiClient from '../../../services/api/client';
import { endpoints } from '../../../constants/api/endpoints';
import { toast } from 'react-hot-toast';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    staffId: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    customerNotes: '',
    specialRequests: '',
    bookingSource: 'walk-in',
    paymentMethod: 'cash',
    advanceAmount: 0
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
        
        // Fetch staff using business endpoint
        try {
          const staffResponse = await apiClient.get(endpoints.business.getStaff(selectedBusinessId));
          if (staffResponse.data?.success) {
            setStaff(staffResponse.data.data || []);
          }
        } catch (error) {
          console.error('Failed to fetch staff:', error);
          // Staff is optional, so we don't need to show error
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (selectedBusinessId) {
      fetchData();
    }
  }, [selectedBusinessId]);

  // Calculate end time based on service duration
  useEffect(() => {
    if (formData.serviceId && formData.startTime) {
      const selectedService = services.find(s => s._id === formData.serviceId);
      if (selectedService && selectedService.duration) {
        const [hours, minutes] = formData.startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
        const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, endTime }));
      }
    }
  }, [formData.serviceId, formData.startTime, services]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customerId) errors.customerId = 'Customer is required';
    if (!formData.serviceId) errors.serviceId = 'Service is required';
    if (!formData.appointmentDate) errors.appointmentDate = 'Date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
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
        serviceId: formData.serviceId,
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        customerNotes: formData.customerNotes.trim() || undefined,
        specialRequests: formData.specialRequests.trim() || undefined,
        bookingSource: formData.bookingSource || 'walk-in',
        paymentMethod: formData.paymentMethod || 'cash',
        advanceAmount: Number(formData.advanceAmount) || 0
      };

      if (formData.staffId) {
        payload.staffId = formData.staffId;
      }

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await adminService.createAppointment(payload);

      if (response.success) {
        toast.success('Appointment created successfully!');
        navigate('/admin/appointments');
      } else {
        toast.error(response.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/admin/appointments')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
          <HiOutlineArrowLeft className="w-5 h-5" />Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600 mt-1">Create a new appointment booking</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white   border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Business Selector */}
          {businesses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200  p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
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
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 ${formErrors.customerId ? 'border-red-500' : 'border-gray-300'}`}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Service <span className="text-red-500">*</span></label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 ${formErrors.serviceId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - ₹{service.price?.toLocaleString()} ({service.duration} min)
                  </option>
                ))}
              </select>
              {formErrors.serviceId && <p className="mt-1 text-sm text-red-600">{formErrors.serviceId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Staff (Optional)</label>
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select staff</option>
                {staff.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name || member.firstName} {member.lastName || ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Source</label>
              <select
                name="bookingSource"
                value={formData.bookingSource}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
              >
                <option value="walk-in">Walk-in</option>
                <option value="online">Online</option>
                <option value="phone">Phone</option>
                <option value="app">App</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 ${formErrors.appointmentDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.appointmentDate && <p className="mt-1 text-sm text-red-600">{formErrors.appointmentDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 ${formErrors.startTime ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.startTime && <p className="mt-1 text-sm text-red-600">{formErrors.startTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 ${formErrors.endTime ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.endTime && <p className="mt-1 text-sm text-red-600">{formErrors.endTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Advance Amount (₹)</label>
              <input
                type="number"
                name="advanceAmount"
                value={formData.advanceAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
            <textarea
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
              placeholder="Any special notes from the customer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
              placeholder="Any special requests or requirements..."
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/appointments')}
            className="px-6 py-2 border border-gray-300  text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
          >
            <HiOutlineSave className="w-5 h-5" />
            {loading ? 'Creating...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;

