import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4'
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ProfitabilityChart = ({
    data = [],
    type = 'line', // 'line', 'bar', 'pie'
    dataKeys = { x: 'name', y: 'value' },
    title = '',
    height = 300,
    showLegend = true,
    showGrid = true,
    colors = COLORS
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200" style={{ height: `${height}px` }}>
                <div className="text-center">
                    <p className="text-gray-400 text-sm">No data available</p>
                </div>
            </div>
        );
    }

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                            <XAxis
                                dataKey={dataKeys.x}
                                tick={{ fontSize: 12 }}
                                stroke="#9ca3af"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                stroke="#9ca3af"
                                tickFormatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                formatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            {showLegend && <Legend />}
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke={colors.primary}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Revenue"
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                stroke={colors.danger}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Expenses"
                            />
                            <Line
                                type="monotone"
                                dataKey="profit"
                                stroke={colors.success}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Net Profit"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                            <XAxis
                                dataKey={dataKeys.x}
                                tick={{ fontSize: 12 }}
                                stroke="#9ca3af"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                stroke="#9ca3af"
                                tickFormatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                formatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            {showLegend && <Legend />}
                            <Bar dataKey="revenue" fill={colors.primary} radius={[4, 4, 0, 0]} name="Revenue" />
                            <Bar dataKey="expenses" fill={colors.danger} radius={[4, 4, 0, 0]} name="Expenses" />
                            <Bar dataKey="profit" fill={colors.success} radius={[4, 4, 0, 0]} name="Net Profit" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey={dataKeys.y}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => `₹${value.toLocaleString()}`}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            {showLegend && <Legend />}
                        </PieChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            {title && (
                <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
            )}
            {renderChart()}
        </div>
    );
};

ProfitabilityChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    type: PropTypes.oneOf(['line', 'bar', 'pie']),
    dataKeys: PropTypes.shape({
        x: PropTypes.string,
        y: PropTypes.string
    }),
    title: PropTypes.string,
    height: PropTypes.number,
    showLegend: PropTypes.bool,
    showGrid: PropTypes.bool,
    colors: PropTypes.object
};

export default ProfitabilityChart;
