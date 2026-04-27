import React, { useState, useEffect, useMemo } from 'react';
import { FaUser, FaUserFriends, FaCheckCircle, FaClock, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

const TrustSlider = ({ business, isHomePage = false }) => {
  const [currentTrustSlide, setCurrentTrustSlide] = useState(0);
  const [liveStats, setLiveStats] = useState({ calls: 0, whatsapp: 0 });

  // Initialize stats once based on business ID or for home page
  useEffect(() => {
    if (isHomePage) {
      // Platform-wide high numbers for home page
      setLiveStats({ calls: 122500, whatsapp: 97800 });
      return;
    }

    if (!business?._id) {
      setLiveStats({ calls: 150, whatsapp: 120 });
      return;
    }

    const seed = business._id;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const calls = 500 + (Math.abs(hash) % 1500);
    const whatsapp = Math.floor(calls * 0.75);
    setLiveStats({ calls, whatsapp });
  }, [business?._id, isHomePage]);

  // Randomly increment stats every 1-3 seconds
  useEffect(() => {
    let timeoutId;

    const incrementStats = () => {
      setLiveStats(prev => ({
        calls: prev.calls + (Math.random() > (isHomePage ? 0.1 : 0.3) ? 1 : 0), // Higher activity for home page
        whatsapp: prev.whatsapp + (Math.random() > (isHomePage ? 0.2 : 0.5) ? 1 : 0)
      }));

      const nextDelay = Math.floor(Math.random() * 2000) + 1000; // 1 to 3 seconds
      timeoutId = setTimeout(incrementStats, nextDelay);
    };

    timeoutId = setTimeout(incrementStats, 2000); // Initial delay

    return () => clearTimeout(timeoutId);
  }, [isHomePage]);

  const trustData = useMemo(() => [
    { name: 'Amit Sharma', location: 'Mumbai', time: '2 mins ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Rohit Verma', location: 'Pune', time: '5 mins ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Suresh Patil', location: 'Sangli', time: '10 mins ago', gender: 'male', type: 'Indian', status: 'enquiry' },
    { name: 'Vikram Jadhav', location: 'Satara', time: '15 mins ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Rajesh Shinde', location: 'Karad', time: '20 mins ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Ankit Yadav', location: 'Lucknow', time: '25 mins ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Manoj Tiwari', location: 'Banaras', time: '30 mins ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Deepak Chavan', location: 'Kolhapur', time: '40 mins ago', gender: 'male', type: 'Indian', status: 'enquiry' },
    { name: 'Sandeep Reddy', location: 'Bangalore', time: '50 mins ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Karthik Iyer', location: 'Kochi', time: '1 hour ago', gender: 'male', type: 'Indian', status: 'booked' },

    { name: 'Rahul Nair', location: 'Trivandrum', time: '2 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Prakash Shetty', location: 'Udupi', time: '3 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Sunil Pawar', location: 'Solapur', time: '4 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Ramesh Deshmukh', location: 'Nashik', time: '5 hours ago', gender: 'male', type: 'Indian', status: 'enquiry' },
    { name: 'Arvind Joshi', location: 'Indore', time: '6 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Nitin Agarwal', location: 'Kanpur', time: '7 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Harish Mehta', location: 'Ahmedabad', time: '8 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Ajay Bansal', location: 'Jaipur', time: '9 hours ago', gender: 'male', type: 'Indian', status: 'enquiry' },
    { name: 'Dinesh Gupta', location: 'Bhopal', time: '10 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Mahesh Yadav', location: 'Gorakhpur', time: '11 hours ago', gender: 'male', type: 'Indian', status: 'booked' },

    { name: 'Kiran Patil', location: 'Baramati', time: '12 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Santosh Mishra', location: 'Prayagraj', time: '13 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Gopal Krishnan', location: 'Madgaon', time: '14 hours ago', gender: 'male', type: 'Indian', status: 'enquiry' },
    { name: 'Ashok Naidu', location: 'Vijayapura', time: '15 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Balaji Rao', location: 'Hubballi', time: '16 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Ravi Shankar', location: 'Nagpur', time: '17 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Imran Khan', location: 'Nanded', time: '18 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Wasim Shaikh', location: 'Latur', time: '19 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Farhan Ali', location: 'Akola', time: '20 hours ago', gender: 'male', type: 'Indian', status: 'enquiry' },
    { name: 'Salman Sheikh', location: 'Chandrapur', time: '21 hours ago', gender: 'male', type: 'Indian', status: 'booked' },

    { name: 'Jitendra Yadav', location: 'Meerut', time: '22 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Mukesh Kumar', location: 'Ghaziabad', time: '23 hours ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Pankaj Singh', location: 'Ayodhya', time: '1 day ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Tarun Jain', location: 'Udaipur', time: '1 day ago', gender: 'male', type: 'Indian', status: 'enquiry' },
    { name: 'Rohit Kulkarni', location: 'Pimpri-Chinchwad', time: '2 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Ganesh More', location: 'Thane', time: '2 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Sanjay Pawar', location: 'Navi Mumbai', time: '2 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Naresh Choudhary', location: 'Jodhpur', time: '3 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Devendra Singh', location: 'Dehradun', time: '3 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Bharat Thakur', location: 'Jaisalmer', time: '3 days ago', gender: 'male', type: 'Indian', status: 'enquiry' },

    { name: 'Lokesh Gupta', location: 'Agra', time: '4 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Hemant Soni', location: 'Jabalpur', time: '4 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Rakesh Sahu', location: 'Beed', time: '5 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Satyam Dubey', location: 'Jalna', time: '5 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Naveen Reddy', location: 'Bidar', time: '6 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Sai Kumar', location: 'Ballari', time: '6 days ago', gender: 'male', type: 'Indian', status: 'booked' },
    { name: 'Vinod Pillai', location: 'Panjim', time: '6 days ago', gender: 'male', type: 'Indian', status: 'enquiry' },
    { name: 'Arun Das', location: 'Candolim', time: '7 days ago', gender: 'male', type: 'Indian', status: 'booked' },

    // FEMALE (~10%)
    { name: 'Priya Sharma', location: 'Delhi', time: '2 days ago', gender: 'female', type: 'Indian', status: 'enquiry' },
    { name: 'Neha Patel', location: 'Vadodara', time: '3 days ago', gender: 'female', type: 'Indian', status: 'booked' },
    { name: 'Kavita Nair', location: 'Trivandrum', time: '4 days ago', gender: 'female', type: 'Indian', status: 'booked' },
    { name: 'Pooja Verma', location: 'Kanpur', time: '5 days ago', gender: 'female', type: 'Indian', status: 'booked' },
    { name: 'Sneha Kulkarni', location: 'Pune', time: '6 days ago', gender: 'female', type: 'Indian', status: 'enquiry' },

  ], []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTrustSlide((prev) => (prev + 1) % trustData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [trustData.length]);

  return (
    <div className={`bg-gradient-to-b from-primary-50/30 to-white border-t-4 border-primary-600 border-x border-b border-gray-200 p-4 sm:p-5 overflow-hidden relative shadow-lg shadow-primary-50 rounded-b-lg ${isHomePage ? 'md:p-8' : ''}`}>
      <div className={`flex flex-col ${isHomePage ? 'lg:flex-row lg:items-start lg:gap-12' : 'gap-4'}`}>

        {/* Left Side: Activity Slider */}
        <div className={`flex-1 ${isHomePage ? 'lg:max-w-xl' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-100 p-2 rounded-lg">
              <FaUserFriends className="text-primary-600 text-lg" />
            </div>
            <div>
              <h3 className={`font-extrabold text-gray-900 tracking-tight ${isHomePage ? 'text-lg' : 'text-sm'}`}>
                {isHomePage ? 'Recent Booking Activity' : 'Recent Activity'}
              </h3>
              <div className="flex items-center gap-1">
                <FaCheckCircle className="text-green-500 text-[10px]" />
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Verified Transactions</p>
              </div>
            </div>
          </div>

          <div className="relative h-24 sm:h-20">
            {trustData.map((item, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${index === currentTrustSlide
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white flex-shrink-0 ${item.gender === 'male' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'
                    }`}>
                    <FaUser className="text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-sm sm:text-base font-bold text-gray-900 truncate">New Booking</span>
                        <span className="text-[10px] text-gray-400 font-normal">({item.gender})</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight flex-shrink-0 ${item.status === 'booked'
                        ? 'text-green-600 bg-green-50 border border-green-100'
                        : 'text-blue-600 bg-blue-50 border border-blue-100'
                        }`}>
                        {item.status === 'booked' ? 'Booked' : 'Enquiry'}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">
                      Confirmed from <span className="font-medium">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 font-medium">
                      <FaClock className="text-[9px]" />
                      {item.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Badge */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[11px] font-black animate-pulse border border-orange-100 shadow-sm">
          <div className="w-2 h-2 bg-orange-500 rounded-full shadow-sm"></div>
          LIVE ACTIVITY
        </div>
      </div>
    </div>
  );
};

export default TrustSlider;
