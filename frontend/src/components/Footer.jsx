const Footer = () => {
    return (
        <footer className="bg-unihub-bg border-t border-gray-200 text-unihub-textMuted py-8 mt-auto">
            <div className="container mx-auto px-6 text-center">
                <p className="text-sm font-medium">
                    &copy; {new Date().getFullYear()} UniHub Platform. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
