const ProtectedFooter = ({
    appName = "SpaAdvisor CRM",
    version = "1.0.0",
}) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">

                {/* Left Section */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span>© {currentYear} {appName}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Version {version}</span>
                </div>

                {/* Right Section */}
                <div className="flex flex-wrap items-center gap-4">
                    <a href="/admin/help" className="hover:text-gray-900 transition">
                        Help
                    </a>
                    <a href="/admin/support" className="hover:text-gray-900 transition">
                        Support
                    </a>
                    <a href="/admin/privacy" className="hover:text-gray-900 transition">
                        Privacy
                    </a>
                </div>

            </div>
        </footer>
    );
};

export default ProtectedFooter;
