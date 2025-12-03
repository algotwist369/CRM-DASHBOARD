import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Button, Card, Input } from '../../../components'
import adminService from '../../../services/admin/adminService'

const AdminProfile = () => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        companyName: ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await adminService.getProfile()
            if (res.success && res.data) {
                setProfile({
                    name: res.data.data.name || '',
                    email: res.data.data.email || '',
                    companyName: res.data.data.companyName || ''
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await adminService.updateProfile({
                name: profile.name,
                email: profile.email
            })

            if (res.success) {
                toast.success('Profile updated successfully')
                // Update local state if needed, though we're already binding to it
            } else {
                toast.error(res.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setSaving(true)
        try {
            const res = await adminService.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })

            if (res.success) {
                toast.success('Password changed successfully')
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            } else {
                toast.error(res.error || 'Failed to change password')
            }
        } catch (error) {
            console.error('Error changing password:', error)
            toast.error('Failed to change password')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Details */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <Input
                            label="Full Name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            placeholder="Enter your name"
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            placeholder="Enter your email"
                            required
                        />
                        <Input
                            label="Company Name"
                            value={profile.companyName}
                            disabled
                            className="bg-gray-50"
                            helpText="Company name cannot be changed directly"
                        />
                        <div className="pt-2">
                            <Button type="submit" isLoading={saving}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Change Password */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            required
                        />
                        <Input
                            label="New Password"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Enter new password"
                            required
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            required
                        />
                        <div className="pt-2">
                            <Button type="submit" variant="outline" isLoading={saving}>
                                Update Password
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default AdminProfile
