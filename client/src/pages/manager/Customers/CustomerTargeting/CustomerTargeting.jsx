import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaBullseye,
  FaSearch,
  FaUsers,
  FaSpinner,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaFilter,
  FaTimes,
  FaCheck,
  FaDollarSign,
  FaCalendarAlt,
  FaMapMarkerAlt
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const CustomerTargeting = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [targetCustomers, setTargetCustomers] = useState([])
  const [criteria, setCriteria] = useState({
    customerType: '',
    minVisits: '',
    maxVisits: '',
    minSpent: '',
    maxSpent: '',
    lastVisitDays: '',
    preferredServices: [],
    gender: [],
    ageRange: {
      min: '',
      max: ''
    },
    location: {
      city: '',
      state: '',
      pincode: ''
    }
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCriteriaChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setCriteria(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setCriteria(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleArrayToggle = (field, value) => {
    setCriteria(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      
      // Build criteria object, excluding empty values
      const searchCriteria = {}
      
      if (criteria.customerType) searchCriteria.customerType = criteria.customerType
      if (criteria.minVisits) searchCriteria.minVisits = parseInt(criteria.minVisits)
      if (criteria.maxVisits) searchCriteria.maxVisits = parseInt(criteria.maxVisits)
      if (criteria.minSpent) searchCriteria.minSpent = parseFloat(criteria.minSpent)
      if (criteria.maxSpent) searchCriteria.maxSpent = parseFloat(criteria.maxSpent)
      if (criteria.lastVisitDays) searchCriteria.lastVisitDays = parseInt(criteria.lastVisitDays)
      if (criteria.preferredServices.length > 0) searchCriteria.preferredServices = criteria.preferredServices
      if (criteria.gender.length > 0) searchCriteria.gender = criteria.gender
      
      if (criteria.ageRange.min || criteria.ageRange.max) {
        searchCriteria.ageRange = {}
        if (criteria.ageRange.min) searchCriteria.ageRange.min = parseInt(criteria.ageRange.min)
        if (criteria.ageRange.max) searchCriteria.ageRange.max = parseInt(criteria.ageRange.max)
      }
      
      if (criteria.location.city || criteria.location.state || criteria.location.pincode) {
        searchCriteria.location = {}
        if (criteria.location.city) searchCriteria.location.city = criteria.location.city
        if (criteria.location.state) searchCriteria.location.state = criteria.location.state
        if (criteria.location.pincode) searchCriteria.location.pincode = criteria.location.pincode
      }

      const result = await managerService.getTargetCustomers(searchCriteria)
      
      if (result.success) {
        const customers = result.data?.data?.customers || result.data?.customers || []
        setTargetCustomers(customers)
        
        if (customers.length === 0) {
          toast.success('No customers found matching the criteria')
        } else {
          toast.success(`Found ${customers.length} customers`)
        }
      } else {
        toast.error(result.error || 'Failed to search customers')
        setTargetCustomers([])
      }
    } catch (error) {
      toast.error('Failed to search customers')
      console.error(error)
      setTargetCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCriteria({
      customerType: '',
      minVisits: '',
      maxVisits: '',
      minSpent: '',
      maxSpent: '',
      lastVisitDays: '',
      preferredServices: [],
      gender: [],
      ageRange: {
        min: '',
        max: ''
      },
      location: {
        city: '',
        state: '',
        pincode: ''
      }
    })
    setTargetCustomers([])
    setSearchTerm('')
  }

  const filteredCustomers = searchTerm
    ? targetCustomers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      )
    : targetCustomers

  const commonServices = ['Haircut', 'Facial', 'Massage', 'Manicure', 'Pedicure', 'Hair Spa', 'Hair Color', 'Beard Trim', 'Waxing', 'Nail Art']

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/customers')}
            className="p-2 hover:bg-gray-100  transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaBullseye className="text-primary-600" />
              Customer Targeting
            </h1>
            <p className="text-gray-600 mt-1">Find and target specific customer segments</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
        >
          <FaFilter />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Targeting Criteria</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
              <select
                value={criteria.customerType}
                onChange={(e) => handleCriteriaChange('customerType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="new">New Customers</option>
                <option value="returning">Returning Customers</option>
                <option value="loyalty">Loyal Customers</option>
                <option value="inactive">Inactive Customers</option>
                <option value="high_value">High Value Customers</option>
              </select>
            </div>

            {/* Visit Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Visits</label>
              <input
                type="number"
                min="0"
                value={criteria.minVisits}
                onChange={(e) => handleCriteriaChange('minVisits', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Minimum"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Visits</label>
              <input
                type="number"
                min="0"
                value={criteria.maxVisits}
                onChange={(e) => handleCriteriaChange('maxVisits', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Maximum"
              />
            </div>

            {/* Spending Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Spent (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={criteria.minSpent}
                onChange={(e) => handleCriteriaChange('minSpent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Minimum"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Spent (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={criteria.maxSpent}
                onChange={(e) => handleCriteriaChange('maxSpent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Maximum"
              />
            </div>

            {/* Last Visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Visit (Days)</label>
              <input
                type="number"
                min="0"
                value={criteria.lastVisitDays}
                onChange={(e) => handleCriteriaChange('lastVisitDays', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 30"
              />
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
              <input
                type="number"
                min="0"
                max="100"
                value={criteria.ageRange.min}
                onChange={(e) => handleCriteriaChange('ageRange.min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Minimum"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
              <input
                type="number"
                min="0"
                max="100"
                value={criteria.ageRange.max}
                onChange={(e) => handleCriteriaChange('ageRange.max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Maximum"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={criteria.location.city}
                onChange={(e) => handleCriteriaChange('location.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="City name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={criteria.location.state}
                onChange={(e) => handleCriteriaChange('location.state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="State name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={criteria.location.pincode}
                onChange={(e) => handleCriteriaChange('location.pincode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Pincode"
              />
            </div>
          </div>

          {/* Preferred Services */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Services</label>
            <div className="flex flex-wrap gap-2">
              {commonServices.map(service => (
                <button
                  key={service}
                  onClick={() => handleArrayToggle('preferredServices', service)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    criteria.preferredServices.includes(service)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div className="flex gap-2">
              {['male', 'female', 'other'].map(gender => (
                <button
                  key={gender}
                  onClick={() => handleArrayToggle('gender', gender)}
                  className={`px-4 py-2  text-sm capitalize transition-colors ${
                    criteria.gender.includes(gender)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch />
                  Search Customers
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
            >
              <FaTimes />
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {targetCustomers.length > 0 && (
        <div className="bg-white   border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Target Customers ({targetCustomers.length})
            </h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => {
                  const formatCurrency = (amount) => {
                    return new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    }).format(amount || 0)
                  }
                  
                  const formatDate = (dateString) => {
                    if (!dateString) return 'Never'
                    const date = new Date(dateString)
                    return date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  }
                  
                  return (
                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <FaUsers className="text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            {customer.preferences?.preferredServices?.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {customer.preferences.preferredServices.slice(0, 2).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-gray-400" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaEnvelope className="text-gray-400" />
                          {customer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.stats?.totalVisits || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(customer.stats?.totalSpent || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(customer.stats?.lastVisit)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => navigate(`/manager/customers/${customer._id}`)}
                          className="p-2 text-primary-600 hover:bg-primary-50  transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && searchTerm && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No customers match your search</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {targetCustomers.length === 0 && !loading && (
        <div className="bg-white   border border-gray-200 p-12 text-center">
          <FaBullseye className="mx-auto text-gray-400 text-4xl mb-4" />
          <p className="text-gray-600 mb-2">No target customers found</p>
          <p className="text-sm text-gray-500">Use the filters above to search for customers</p>
        </div>
      )}
    </div>
  )
}

export default CustomerTargeting

