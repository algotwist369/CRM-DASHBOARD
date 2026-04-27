import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaCopy,
  FaGlobe,
  FaImage,
  FaVideo,
  FaShareAlt,
  FaFileAlt,
  FaClock,
  FaCog,
  FaTags,
  FaChartBar,
  FaUsers,
  FaCalendar,
  FaStar,
  FaBuffer,
  FaBell,
  FaCreditCard,
  FaGlobeAsia,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';

const TABS = [
  { key: 'overview', label: 'Overview', icon: FaBuilding },
  { key: 'contact', label: 'Contact & Location', icon: FaMapMarkerAlt },
  { key: 'media', label: 'Media', icon: FaImage },
  { key: 'social', label: 'Social & Registration', icon: FaShareAlt },
  { key: 'operations', label: 'Operations', icon: FaClock },
  { key: 'settings', label: 'Settings', icon: FaCog },
  { key: 'marketing', label: 'Marketing', icon: FaTags },
  { key: 'analytics', label: 'Analytics', icon: FaChartBar },
];

const InfoItem = memo(({ label, value, children, className = '' }) => (
  <div className={className}>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    {children || <p className="text-base font-medium text-gray-900 mt-1">{value || '—'}</p>}
  </div>
));

const SectionCard = memo(({ title, icon: Icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
      {Icon && <Icon className="text-primary-600" />}
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
));

const TagBadge = memo(({ children }) => (
  <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full mr-1 mb-1">
    {children}
  </span>
));

const StatusBadge = memo(({ isActive }) => (
  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
));

const DayBadge = memo(({ days }) => {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {days.map(day => (
        <span key={day} className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded">
          {dayLabels.includes(day) ? dayLabels.find(d => d.toLowerCase() === day.slice(0, 3).toLowerCase()) || day : day}
        </span>
      ))}
    </div>
  );
});

const BooleanBadge = memo(({ value }) => (
  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
    {value ? 'Yes' : 'No'}
  </span>
));

const OverviewTab = memo(({ business }) => (
  <div>
    <SectionCard title="Basic Information" icon={FaBuilding}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Business Name" value={business.name} />
        <InfoItem label="Business Type" value={business.type} className="capitalize" />
        <InfoItem label="Branch" value={business.branch} />
        <InfoItem label="Business Link" value={business.businessLink} />
        <InfoItem label="Status">
          <StatusBadge isActive={business.isActive} />
        </InfoItem>
        <InfoItem label="Category" value={business.category} />
        <InfoItem label="Sub Category" value={business.subCategory} />
      </div>
    </SectionCard>

    <SectionCard title="Subscription & Plan" icon={FaBuffer}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Plan">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
            {business.subscription?.plan || 'N/A'}
          </span>
        </InfoItem>
        <InfoItem label="Plan Status">
          <BooleanBadge value={business.subscription?.isActive} />
        </InfoItem>
        <InfoItem label="Plan Start Date" value={business.subscription?.startDate ? new Date(business.subscription.startDate).toLocaleDateString() : '—'} />
        <InfoItem label="Plan End Date" value={business.subscription?.endDate ? new Date(business.subscription.endDate).toLocaleDateString() : '—'} />
      </div>
      {business.subscription?.features?.length > 0 && (
        <div className="mt-3">
          <label className="text-sm font-medium text-gray-500">Plan Features</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {business.subscription.features.map((feature, idx) => (
              <TagBadge key={idx}>{feature}</TagBadge>
            ))}
          </div>
        </div>
      )}
    </SectionCard>

    <SectionCard title="Admin Info" icon={FaUsers}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Company Name" value={business.admin?.companyName} />
        <InfoItem label="Admin Name" value={business.admin?.name} />
        <InfoItem label="Admin Email" value={business.admin?.email} />
      </div>
    </SectionCard>
  </div>
));

const ContactTab = memo(({ business }) => (
  <div>
    <SectionCard title="Contact Information" icon={FaPhoneAlt}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Phone" value={business.phone} />
        <InfoItem label="Email" value={business.email} />
        <InfoItem label="Website" value={business.website} />
      </div>
    </SectionCard>

    <SectionCard title="Location Information" icon={FaMapMarkerAlt}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Address" value={business.address} className="md:col-span-2" />
        <InfoItem label="City" value={business.city} />
        <InfoItem label="State" value={business.state} />
        <InfoItem label="Country" value={business.country} />
        <InfoItem label="ZIP Code" value={business.zipCode} />
      </div>
      {business.location?.coordinates && business.location.coordinates[0] !== 0 && (
        <div className="mt-3">
          <label className="text-sm font-medium text-gray-500">Coordinates</label>
          <p className="text-sm text-gray-700 mt-1">
            Lat: {business.location.coordinates[1]}, Long: {business.location.coordinates[0]}
          </p>
        </div>
      )}
    </SectionCard>

    <SectionCard title="Description" icon={FaFileAlt}>
      <p className="text-sm text-gray-700 whitespace-pre-line">{business.description || '—'}</p>
    </SectionCard>
  </div>
));

const MediaTab = memo(({ business }) => (
  <div>
    <SectionCard title="Images" icon={FaImage}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">Logo</label>
          {business.images?.logo ? (
            <img src={business.images.logo} alt="Logo" className="w-24 h-24 object-contain border rounded-lg" />
          ) : (
            <div className="w-24 h-24 border rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
              No Logo
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">Banner</label>
          {business.images?.banner ? (
            <img src={business.images.banner} alt="Banner" className="w-full h-24 object-cover border rounded-lg" />
          ) : (
            <div className="w-full h-24 border rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
              No Banner
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">Thumbnail</label>
          {business.images?.thumbnail ? (
            <img src={business.images.thumbnail} alt="Thumbnail" className="w-24 h-24 object-cover border rounded-lg" />
          ) : (
            <div className="w-24 h-24 border rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
              No Thumbnail
            </div>
          )}
        </div>
      </div>
      {business.images?.gallery?.length > 0 && (
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-500 block mb-2">Gallery ({business.images.gallery.length})</label>
          <div className="flex flex-wrap gap-2">
            {business.images.gallery.map((img, idx) => (
              <img key={idx} src={img} alt={`Gallery ${idx + 1}`} className="w-20 h-20 object-cover border rounded" />
            ))}
          </div>
        </div>
      )}
    </SectionCard>

    <SectionCard title="360° Images" icon={FaImage}>
      {business.google360ImageUrl?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {business.google360ImageUrl.map((url, idx) => (
            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">
              Image {idx + 1}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No 360° images available</p>
      )}
    </SectionCard>

    <SectionCard title="Videos" icon={FaVideo}>
      {business.videos?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {business.videos.map((video, idx) => (
            <a key={idx} href={video} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">
              Video {idx + 1}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No videos available</p>
      )}
    </SectionCard>
  </div>
));

const SocialTab = memo(({ business }) => (
  <div>
    <SectionCard title="Social Media" icon={FaShareAlt}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoItem label="Facebook">
          {business.socialMedia?.facebook ? (
            <a href={business.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm truncate block">
              <FaFacebook className="inline mr-1" /> Facebook
            </a>
          ) : '—'}
        </InfoItem>
        <InfoItem label="Instagram">
          {business.socialMedia?.instagram ? (
            <a href={business.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm truncate block">
              <FaInstagram className="inline mr-1" /> Instagram
            </a>
          ) : '—'}
        </InfoItem>
        <InfoItem label="Twitter">
          {business.socialMedia?.twitter ? (
            <a href={business.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm truncate block">
              <FaTwitter className="inline mr-1" /> Twitter
            </a>
          ) : '—'}
        </InfoItem>
        <InfoItem label="LinkedIn">
          {business.socialMedia?.linkedin ? (
            <a href={business.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm truncate block">
              <FaLinkedin className="inline mr-1" /> LinkedIn
            </a>
          ) : '—'}
        </InfoItem>
        <InfoItem label="YouTube">
          {business.socialMedia?.youtube ? (
            <a href={business.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm truncate block">
              <FaYoutube className="inline mr-1" /> YouTube
            </a>
          ) : '—'}
        </InfoItem>
        <InfoItem label="WhatsApp" value={business.socialMedia?.whatsapp} />
        <InfoItem label="Telegram" value={business.socialMedia?.telegram} />
      </div>
    </SectionCard>

    <SectionCard title="Registration Details" icon={FaFileAlt}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="GST Number" value={business.registration?.gstNumber} />
        <InfoItem label="PAN Number" value={business.registration?.panNumber} />
        <InfoItem label="Registration Number" value={business.registration?.registrationNumber} />
        <InfoItem label="License Number" value={business.registration?.licenseNumber} />
        <InfoItem label="Tax ID" value={business.registration?.taxId} />
        <InfoItem label="Registration Date" value={business.registration?.registrationDate ? new Date(business.registration.registrationDate).toLocaleDateString() : '—'} />
        <InfoItem label="Expiry Date" value={business.registration?.expiryDate ? new Date(business.registration.expiryDate).toLocaleDateString() : '—'} />
      </div>
    </SectionCard>
  </div>
));

const OperationsTab = memo(({ business }) => (
  <div>
    <SectionCard title="Working Hours" icon={FaClock}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Opens At" value={business.settings?.workingHours?.open} />
        <InfoItem label="Closes At" value={business.settings?.workingHours?.close} />
      </div>
      {business.settings?.workingHours?.days && (
        <div className="mt-3">
          <label className="text-sm font-medium text-gray-500">Working Days</label>
          <DayBadge days={business.settings.workingHours.days} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Capacity" icon={FaBuffer}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoItem label="Seating Capacity" value={business.capacity?.seatingCapacity} />
        <InfoItem label="Parking Spaces" value={business.capacity?.parkingSpaces} />
        <InfoItem label="Number of Rooms" value={business.capacity?.numberOfRooms} />
        <InfoItem label="Number of Floors" value={business.capacity?.numberOfFloors} />
        <InfoItem label="Total Area" value={business.capacity?.totalArea} className="md:col-span-2" />
      </div>
    </SectionCard>

    <SectionCard title="Days Off & Holidays" icon={FaCalendar}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Days Off ({business.daysOff?.length || 0})</label>
          {business.daysOff?.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {business.daysOff.map((day, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded">
                  {new Date(day).toLocaleDateString()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">No days off configured</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Holidays ({business.holidays?.length || 0})</label>
          {business.holidays?.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {business.holidays.map((holiday, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-700 rounded">
                  {new Date(holiday).toLocaleDateString()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">No holidays configured</p>
          )}
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Languages" icon={FaGlobeAsia}>
      {business.languages?.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {business.languages.map((lang, idx) => (
            <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
              {lang}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No languages specified</p>
      )}
    </SectionCard>
  </div>
));

const SettingsTab = memo(({ business }) => (
  <div>
    <SectionCard title="Appointment Settings" icon={FaCog}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoItem label="Advance Booking Days" value={business.settings?.appointmentSettings?.advanceBookingDays} />
        <InfoItem label="Min Advance Booking (Hours)" value={business.settings?.appointmentSettings?.minAdvanceBookingHours} />
        <InfoItem label="Max Advance Booking (Hours)" value={business.settings?.appointmentSettings?.maxAdvanceBookingHours} />
        <InfoItem label="Slot Duration (min)" value={business.settings?.appointmentSettings?.slotDuration} />
        <InfoItem label="Buffer Time (min)" value={business.settings?.appointmentSettings?.bufferTime} />
        <InfoItem label="Allow Online Booking">
          <BooleanBadge value={business.settings?.appointmentSettings?.allowOnlineBooking} />
        </InfoItem>
        <InfoItem label="Require Advance Payment">
          <BooleanBadge value={business.settings?.appointmentSettings?.requireAdvancePayment} />
        </InfoItem>
        <InfoItem label="Advance Payment %" value={business.settings?.appointmentSettings?.advancePaymentPercentage} />
      </div>
      <div className="mt-4 border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Cancellation Policy</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoItem label="Allow Cancellation">
            <BooleanBadge value={business.settings?.appointmentSettings?.cancellationPolicy?.allowCancellation} />
          </InfoItem>
          <InfoItem label="Min Cancellation Hours" value={business.settings?.appointmentSettings?.cancellationPolicy?.minCancellationHours} />
          <InfoItem label="Refund Percentage" value={`${business.settings?.appointmentSettings?.cancellationPolicy?.refundPercentage}%`} />
        </div>
      </div>
      <div className="mt-4 border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Reminder Settings</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem label="SMS Reminder">
            <BooleanBadge value={business.settings?.appointmentSettings?.reminderSettings?.sendSMSReminder} />
          </InfoItem>
          <InfoItem label="Email Reminder">
            <BooleanBadge value={business.settings?.appointmentSettings?.reminderSettings?.sendEmailReminder} />
          </InfoItem>
          <InfoItem label="WhatsApp Reminder">
            <BooleanBadge value={business.settings?.appointmentSettings?.reminderSettings?.sendWhatsappReminder} />
          </InfoItem>
          <InfoItem label="Reminder Hours" value={business.settings?.appointmentSettings?.reminderSettings?.reminderHours} />
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Payment Methods" icon={FaCreditCard}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <InfoItem label="Cash">
          <BooleanBadge value={business.paymentMethods?.cash} />
        </InfoItem>
        <InfoItem label="Card">
          <BooleanBadge value={business.paymentMethods?.card} />
        </InfoItem>
        <InfoItem label="UPI">
          <BooleanBadge value={business.paymentMethods?.upi} />
        </InfoItem>
        <InfoItem label="Net Banking">
          <BooleanBadge value={business.paymentMethods?.netBanking} />
        </InfoItem>
        <InfoItem label="Wallet">
          <BooleanBadge value={business.paymentMethods?.wallet} />
        </InfoItem>
      </div>
    </SectionCard>

    <SectionCard title="Bank Details" icon={FaCreditCard}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Account Name" value={business.bankDetails?.accountName} />
        <InfoItem label="Account Number" value={business.bankDetails?.accountNumber} />
        <InfoItem label="Bank Name" value={business.bankDetails?.bankName} />
        <InfoItem label="IFSC Code" value={business.bankDetails?.ifscCode} />
        <InfoItem label="Branch" value={business.bankDetails?.branch} />
        <InfoItem label="UPI ID" value={business.bankDetails?.upiId} />
      </div>
      {business.bankDetails?.qrCode && (
        <div className="mt-3">
          <label className="text-sm font-medium text-gray-500 block mb-2">QR Code</label>
          <img src={business.bankDetails.qrCode} alt="QR Code" className="w-32 h-32 object-contain border rounded" />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Notifications" icon={FaBell}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoItem label="Email Notifications">
          <BooleanBadge value={business.notifications?.emailNotifications} />
        </InfoItem>
        <InfoItem label="SMS Notifications">
          <BooleanBadge value={business.notifications?.smsNotifications} />
        </InfoItem>
        <InfoItem label="WhatsApp Notifications">
          <BooleanBadge value={business.notifications?.whatsappNotifications} />
        </InfoItem>
        <InfoItem label="Push Notifications">
          <BooleanBadge value={business.notifications?.pushNotifications} />
        </InfoItem>
      </div>
    </SectionCard>

    <SectionCard title="General Settings" icon={FaCog}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Currency" value={business.settings?.currency} />
        <InfoItem label="Timezone" value={business.settings?.timezone} />
      </div>
    </SectionCard>
  </div>
));

const MarketingTab = memo(({ business }) => (
  <div>
    <SectionCard title="SEO Settings" icon={FaGlobe}>
      <div className="space-y-4">
        <InfoItem label="Meta Title" value={business.seo?.metaTitle} />
        <InfoItem label="Meta Description" value={business.seo?.metaDescription} className="md:col-span-2" />
        {business.seo?.ogImage && (
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">OG Image</label>
            <img src={business.seo.ogImage} alt="OG" className="w-48 h-24 object-cover border rounded" />
          </div>
        )}
        {business.seo?.keywords?.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">Keywords</label>
            <div className="flex flex-wrap gap-1">
              {business.seo.keywords.map((kw, idx) => (
                <TagBadge key={idx}>{kw}</TagBadge>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>

    <SectionCard title="Tags" icon={FaTags}>
      {business.tags?.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {business.tags.map((tag, idx) => (
            <TagBadge key={idx}>{tag}</TagBadge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No tags configured</p>
      )}
    </SectionCard>

    <SectionCard title="Specialties" icon={FaStar}>
      {business.specialties?.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {business.specialties.map((spec, idx) => (
            <span key={idx} className="inline-block px-3 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full mr-1 mb-1">
              {spec}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No specialties configured</p>
      )}
    </SectionCard>

    <SectionCard title="Features & Amenities" icon={FaCheckCircle}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {business.features?.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">Features</label>
            <ul className="space-y-1">
              {business.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCheckCircle className="text-green-500 text-xs" /> {feat}
                </li>
              ))}
            </ul>
          </div>
        )}
        {business.amenities?.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">Amenities</label>
            <ul className="space-y-1">
              {business.amenities.map((am, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCheckCircle className="text-blue-500 text-xs" /> {am}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionCard>
  </div>
));

const AnalyticsTab = memo(({ business }) => (
  <div>
    <SectionCard title="Ratings & Reviews" icon={FaStar}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-3xl font-bold text-yellow-600">{business.ratings?.average?.toFixed(1) || '0.0'}</p>
          <p className="text-sm text-gray-600">Average Rating</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-600">{business.ratings?.totalReviews || 0}</p>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{business.ratings?.fiveStars || 0}</p>
          <p className="text-sm text-gray-600">5 Star Reviews</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{business.ratings?.oneStar || 0}</p>
          <p className="text-sm text-gray-600">1 Star Reviews</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <InfoItem label="5 Stars" value={business.ratings?.fiveStars || 0} />
        <InfoItem label="4 Stars" value={business.ratings?.fourStars || 0} />
        <InfoItem label="3 Stars" value={business.ratings?.threeStars || 0} />
        <InfoItem label="2 Stars" value={business.ratings?.twoStars || 0} />
        <InfoItem label="1 Star" value={business.ratings?.oneStar || 0} />
      </div>
    </SectionCard>

    <SectionCard title="Business Statistics" icon={FaChartBar}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-primary-50 rounded-lg">
          <p className="text-3xl font-bold text-primary-600">{business.stats?.totalCustomers || 0}</p>
          <p className="text-sm text-gray-600">Customers</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-600">{business.stats?.totalAppointments || 0}</p>
          <p className="text-sm text-gray-600">Appointments</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">₹{business.stats?.totalRevenue?.toLocaleString() || 0}</p>
          <p className="text-sm text-gray-600">Revenue</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-3xl font-bold text-orange-600">{business.stats?.totalOrders || 0}</p>
          <p className="text-sm text-gray-600">Orders</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-3xl font-bold text-purple-600">{business.stats?.averageRating?.toFixed(1) || '0.0'}</p>
          <p className="text-sm text-gray-600">Avg Rating</p>
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Team Members" icon={FaUsers}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Managers" value={business.managers?.length || 0} />
        <InfoItem label="Staff Members" value={business.staff?.length || 0} />
      </div>
    </SectionCard>
  </div>
));

const BusinessDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [businessLink, setBusinessLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const abortControllerRef = useRef(null);
  const isFetchingRef = useRef(false);

  const fetchBusiness = useCallback(async (signal) => {
    try {
      const result = await adminService.getBusinessById(id, { signal });
      if (result.success) {
        setBusiness(result.data);
      } else {
        alert('Failed to load business details');
        navigate('/admin/businesses');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch business:', error);
        alert('Failed to load business details');
        navigate('/admin/businesses');
      }
    }
  }, [id, navigate]);

  const fetchBusinessLink = useCallback(async (signal) => {
    try {
      const result = await adminService.getBusinessLink(id, { signal });
      if (result.success) {
        setBusinessLink(result.data?.publicLink || result.data?.link);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch business link:', error);
      }
    }
  }, [id]);

  const loadData = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      await Promise.all([
        fetchBusiness(abortControllerRef.current.signal),
        fetchBusinessLink(abortControllerRef.current.signal)
      ]);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchBusiness, fetchBusinessLink]);

  useEffect(() => {
    loadData(true);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData(false);
  }, [loadData]);

  const handleEdit = () => {
    navigate(`/admin/businesses/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${business?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await adminService.deleteBusiness(id);
      if (result.success) {
        alert('Business deleted successfully!');
        navigate('/admin/businesses');
      } else {
        alert(result.error || 'Failed to delete business');
      }
    } catch (error) {
      console.error('Failed to delete business:', error);
      alert('Failed to delete business');
    }
  };

  const handleCopyLink = () => {
    if (businessLink) {
      navigator.clipboard.writeText(businessLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Business not found</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab business={business} />;
      case 'contact':
        return <ContactTab business={business} />;
      case 'media':
        return <MediaTab business={business} />;
      case 'social':
        return <SocialTab business={business} />;
      case 'operations':
        return <OperationsTab business={business} />;
      case 'settings':
        return <SettingsTab business={business} />;
      case 'marketing':
        return <MarketingTab business={business} />;
      case 'analytics':
        return <AnalyticsTab business={business} />;
      default:
        return <OverviewTab business={business} />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="bg-white p-5 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-600 flex items-center justify-center">
                  <FaBuilding className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {business.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {business.type}
                    </span>
                    <StatusBadge isActive={business.isActive} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/admin/businesses')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <HiRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
              >
                <FaEdit />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
              >
                <FaTrash />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {businessLink && (
        <div className="mb-6 bg-gradient-to-r from-primary-50 to-blue-50 p-5 border border-primary-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Public Business Link
              </label>
              <div className="flex items-center gap-2">
                <code className="text-sm text-primary-700 font-mono bg-white px-3 py-2 border border-primary-200 flex-1">
                  {businessLink}
                </code>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 text-sm font-medium whitespace-nowrap"
                >
                  {copiedLink ? (
                    <>
                      <FaCheckCircle />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg mb-6 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="text-sm" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BusinessDetails;