import React, { useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

const WhatsappLead = () => {
  const [openSection, setOpenSection] = useState("managers");
  const [activeItem, setActiveItem] = useState("all-managers");

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="flex h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-4 text-lg font-semibold border-b">
          WhatsApp Leads
        </div>

        <nav className="p-3 space-y-2">
          {/* Managers */}
          <DropdownSection
            title="Managers"
            isOpen={openSection === "managers"}
            onToggle={() => toggleSection("managers")}
          >
            <SidebarItem
              label="All Managers"
              active={activeItem === "all-managers"}
              onClick={() => setActiveItem("all-managers")}
            />
            <SidebarItem
              label="Add Manager"
              active={activeItem === "add-manager"}
              onClick={() => setActiveItem("add-manager")}
            />
          </DropdownSection>

          {/* Leads */}
          <DropdownSection
            title="Leads"
            isOpen={openSection === "leads"}
            onToggle={() => toggleSection("leads")}
          >
            <SidebarItem
              label="All Leads"
              active={activeItem === "all-leads"}
              onClick={() => setActiveItem("all-leads")}
            />
            <SidebarItem
              label="Add Lead"
              active={activeItem === "add-lead"}
              onClick={() => setActiveItem("add-lead")}
            />
          </DropdownSection>

          {/* Analytics */}
          <DropdownSection
            title="Analytics"
            isOpen={openSection === "analytics"}
            onToggle={() => toggleSection("analytics")}
          >
            <SidebarItem
              label="Overview"
              active={activeItem === "analytics"}
              onClick={() => setActiveItem("analytics")}
            />
          </DropdownSection>
        </nav>
      </aside>

      {/* Content */}
      <section className="flex-1 p-6 overflow-y-auto">
        {activeItem === "all-managers" && <Managers />}
        {activeItem === "add-manager" && <AddManager />}

        {activeItem === "all-leads" && <Leads />}
        {activeItem === "add-lead" && <AddLead />}

        {activeItem === "analytics" && <Analytics />}
      </section>
    </div>
  );
};

export default WhatsappLead;

/* ---------------- Sidebar Dropdown ---------------- */

const DropdownSection = ({ title, isOpen, onToggle, children }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-100 rounded-md"
    >
      {title}
      <span
        className={`transform transition ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
      >
        <RiArrowDropDownLine className="w-6 h-6" />
      </span>
    </button>

    {isOpen && <div className="mt-1 space-y-1 pl-3">{children}</div>}
  </div>
);

const SidebarItem = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded-md text-sm transition
      ${
        active
          ? "bg-green-500 text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
  >
    {label}
  </button>
);

/* ---------------- Managers ---------------- */

const Managers = () => (
  <div>
    <h1 className="text-xl font-semibold mb-4">All Managers</h1>

    <div className="bg-white rounded-lg shadow divide-y">
      <ManagerItem name="Karan Mehta" role="Team Lead" />
      <ManagerItem name="Pooja Patel" role="Sales Manager" />
      <ManagerItem name="Arjun Kumar" role="Support Manager" />
    </div>
  </div>
);

const AddManager = () => (
  <div>
    <h1 className="text-xl font-semibold mb-4">Add Manager</h1>

    <div className="bg-white rounded-lg shadow p-4 space-y-3 max-w-md">
      <input className="w-full border p-2 rounded" placeholder="Name" />
      <input className="w-full border p-2 rounded" placeholder="Role" />
      <button className="bg-green-500 text-white px-4 py-2 rounded">
        Save Manager
      </button>
    </div>
  </div>
);

const ManagerItem = ({ name, role }) => (
  <div className="flex justify-between items-center p-4">
    <p className="font-medium">{name}</p>
    <span className="text-sm text-gray-500">{role}</span>
  </div>
);

/* ---------------- Leads ---------------- */

const Leads = () => (
  <div>
    <h1 className="text-xl font-semibold mb-4">All Leads</h1>

    <div className="bg-white rounded-lg shadow divide-y">
      <LeadItem name="Rahul Sharma" phone="+91 98765 43210" status="New" />
      <LeadItem name="Amit Verma" phone="+91 91234 56789" status="Follow-up" />
    </div>
  </div>
);

const AddLead = () => (
  <div>
    <h1 className="text-xl font-semibold mb-4">Add Lead</h1>

    <div className="bg-white rounded-lg shadow p-4 space-y-3 max-w-md">
      <input className="w-full border p-2 rounded" placeholder="Name" />
      <input className="w-full border p-2 rounded" placeholder="Phone" />
      <button className="bg-green-500 text-white px-4 py-2 rounded">
        Save Lead
      </button>
    </div>
  </div>
);

const LeadItem = ({ name, phone, status }) => (
  <div className="flex justify-between items-center p-4">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-gray-500">{phone}</p>
    </div>
    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
      {status}
    </span>
  </div>
);

/* ---------------- Analytics ---------------- */

const Analytics = () => (
  <div>
    <h1 className="text-xl font-semibold mb-4">Analytics Overview</h1>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="Total Leads" value="245" />
      <StatCard title="Converted" value="98" />
      <StatCard title="Pending" value="147" />
    </div>
  </div>
);

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow p-5 text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-2xl font-bold text-green-600 mt-1">{value}</p>
  </div>
);
