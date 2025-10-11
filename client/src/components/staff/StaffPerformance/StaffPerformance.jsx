import React, { useState } from 'react'
import { Card, Button, Badge, Tabs } from '../../common'
import { StatCard, StatCardGrid } from '../../charts'
import { LineChart, BarChart, DonutChart } from '../../charts'

const StaffPerformance = ({ 
  staff,
  performanceData = {},
  onViewDetails,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(0)

  if (!staff) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-lg font-medium">No staff selected</p>
          <p className="text-sm">Select a staff member to view their performance</p>
        </div>
      </div>
    )
  }

  const {
    name,
    role,
    totalAppointments,
    totalRevenue,
    rating,
    completionRate,
    customerSatisfaction,
    monthlyStats = [],
    serviceBreakdown = [],
    performanceTrends = [],
    goals = [],
    achievements = []
  } = performanceData

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPerformanceColor = (value, type) => {
    if (type === 'rating') {
      if (value >= 4.5) return 'success'
      if (value >= 3.5) return 'warning'
      return 'danger'
    }
    if (type === 'percentage') {
      if (value >= 90) return 'success'
      if (value >= 70) return 'warning'
      return 'danger'
    }
    return 'default'
  }

  const tabs = [
    { label: 'Overview', content: 'overview' },
    { label: 'Analytics', content: 'analytics' },
    { label: 'Goals & Achievements', content: 'goals' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
        <StatCardGrid
          stats={[
            {
              title: 'Total Appointments',
              value: totalAppointments || 0,
              change: 12.5,
              changeType: 'positive',
              format: 'number',
              color: 'blue',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              title: 'Total Revenue',
              value: totalRevenue || 0,
              change: 8.3,
              changeType: 'positive',
              format: 'currency',
              color: 'green',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              )
            },
            {
              title: 'Average Rating',
              value: rating || 0,
              change: 0.2,
              changeType: 'positive',
              format: 'number',
              color: 'yellow',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )
            },
            {
              title: 'Completion Rate',
              value: completionRate || 0,
              change: 5.1,
              changeType: 'positive',
              format: 'percentage',
              color: 'purple',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            }
          ]}
          columns={4}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction</h4>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {customerSatisfaction || 0}%
              </div>
              <Badge variant={getPerformanceColor(customerSatisfaction, 'percentage')}>
                {customerSatisfaction >= 90 ? 'Excellent' : 
                 customerSatisfaction >= 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h4>
            {serviceBreakdown.length > 0 ? (
              <DonutChart
                data={serviceBreakdown}
                centerText="Services"
                centerValue={serviceBreakdown.length.toString()}
                showLegend={true}
                width="200px"
                height="200px"
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No service data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Monthly Performance Trend */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance Trend</h4>
          {performanceTrends.length > 0 ? (
            <LineChart
              data={[
                {
                  label: 'Appointments',
                  data: performanceTrends.map(trend => trend.appointments),
                  labels: performanceTrends.map(trend => trend.month)
                },
                {
                  label: 'Revenue',
                  data: performanceTrends.map(trend => trend.revenue),
                  labels: performanceTrends.map(trend => trend.month)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No trend data available</p>
            </div>
          )}
        </div>
      </Card>

      {/* Monthly Stats */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Statistics</h4>
          {monthlyStats.length > 0 ? (
            <BarChart
              data={monthlyStats.map(stat => ({
                label: stat.month,
                value: stat.appointments
              }))}
              height="300px"
              showLegend={true}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No monthly data available</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )

  const renderGoalsAndAchievements = () => (
    <div className="space-y-6">
      {/* Goals */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Goals</h4>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{goal.title}</h5>
                    <Badge variant={goal.status === 'completed' ? 'success' : 'warning'}>
                      {goal.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progress: {goal.progress}%</span>
                    <span className="text-sm text-gray-500">Due: {formatDate(goal.dueDate)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No goals set</p>
            </div>
          )}
        </div>
      </Card>

      {/* Achievements */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h4>
          {achievements.length > 0 ? (
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(achievement.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No achievements yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <p className="text-gray-600">
            {name} - {role}
          </p>
        </div>
        {onViewDetails && (
          <Button
            variant="outline"
            onClick={() => onViewDetails(staff)}
          >
            View Details
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        defaultActiveTab={0}
        onTabChange={(index) => setActiveTab(index)}
      >
        {renderOverview()}
        {renderAnalytics()}
        {renderGoalsAndAchievements()}
      </Tabs>
    </div>
  )
}

export default StaffPerformance
