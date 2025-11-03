import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ customerName: '', phone: '', email: '', items: [{ service: '', quantity: 1, price: 0 }], discount: 0, tax: 18 });

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { service: '', quantity: 1, price: 0 }] });
  const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  
  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const discountAmount = (subtotal * formData.discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * formData.tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { alert('Invoice created!'); navigate('/admin/invoices'); }, 1000);
  };

  return (
    <div className="space-y-6">
      <div><button onClick={() => navigate('/admin/invoices')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"><HiOutlineArrowLeft />Back</button><h1 className="text-2xl font-bold">Create Invoice</h1></div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="block text-sm font-medium mb-2">Customer Name *</label><input type="text" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Phone *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
        </div>
        <div><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Items</h2><button type="button" onClick={addItem} className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 text-sm"><HiOutlinePlus />Add Item</button></div>{formData.items.map((item, index) => (<div key={index} className="grid grid-cols-12 gap-4 mb-3"><div className="col-span-5"><input type="text" placeholder="Service" value={item.service} onChange={(e) => {const items = [...formData.items]; items[index].service = e.target.value; setFormData({...formData, items});}} className="w-full px-4 py-2 border rounded-lg" /></div><div className="col-span-2"><input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => {const items = [...formData.items]; items[index].quantity = parseInt(e.target.value) || 1; setFormData({...formData, items});}} className="w-full px-4 py-2 border rounded-lg" /></div><div className="col-span-3"><input type="number" placeholder="Price" value={item.price} onChange={(e) => {const items = [...formData.items]; items[index].price = parseFloat(e.target.value) || 0; setFormData({...formData, items});}} className="w-full px-4 py-2 border rounded-lg" /></div><div className="col-span-2"><button type="button" onClick={() => removeItem(index)} className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"><HiOutlineTrash /></button></div></div>))}</div>
        <div className="border-t pt-6"><div className="max-w-md ml-auto space-y-3"><div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div><div className="flex justify-between items-center"><span>Discount (%):</span><input type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} className="w-20 px-2 py-1 border rounded" /></div><div className="flex justify-between"><span>Discount Amount:</span><span>-₹{discountAmount.toFixed(2)}</span></div><div className="flex justify-between items-center"><span>Tax (%):</span><input type="number" value={formData.tax} onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value) || 0})} className="w-20 px-2 py-1 border rounded" /></div><div className="flex justify-between"><span>Tax Amount:</span><span>₹{taxAmount.toFixed(2)}</span></div><div className="flex justify-between text-lg font-bold border-t pt-3"><span>Total:</span><span>₹{total.toFixed(2)}</span></div></div></div>
        <div className="flex justify-end gap-4"><button type="button" onClick={() => navigate('/admin/invoices')} className="px-6 py-2 border rounded-lg">Cancel</button><button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2"><HiOutlineSave />{loading ? 'Creating...' : 'Create Invoice'}</button></div>
      </form>
    </div>
  );
};

export default InvoiceForm;

