import React from 'react';
import { Link } from '@inertiajs/react';
import { useLayout } from '../../Contexts/LayoutContext';
import { 
  Heart,
  Globe,
  Shield,
  HelpCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Footer = () => {
  const { sidebarCollapsed, headerAsSidebar } = useLayout();

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analytics', href: '/erp/analytics' },
    { name: 'Reports', href: '/erp/reports' },
    { name: 'Settings', href: '/erp/settings' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help', icon: HelpCircle },
    { name: 'Documentation', href: '/docs', icon: Globe },
    { name: 'API Reference', href: '/api-docs', icon: Shield },
    { name: 'Contact Support', href: '/support', icon: Mail },
  ];

  const contactInfo = [
    { type: 'email', value: 'support@erpsystem.com', icon: Mail },
    { type: 'phone', value: '+1 (555) 123-4567', icon: Phone },
    { type: 'address', value: 'Enterprise District, Business City', icon: MapPin },
  ];

  return (
    <footer className={`
      bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700
      transition-all duration-300
     
    `}>
      <div className="mx-auto px-4 py-8 lg:px-6">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 md:grid-cols-2">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                ERP
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Enterprise System
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Professional SAAS ERP solution designed to streamline your business operations 
              and enhance productivity with cutting-edge technology.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for businesses worldwide</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Support & Resources
            </h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Get in Touch
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((contact) => {
                const Icon = contact.icon;
                return (
                  <li key={contact.type} className="flex items-start space-x-3">
                    <Icon className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {contact.value}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* System Status */}
            <div className="pt-2">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          
          {/* Copyright */}
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              © {currentYear} ERP Enterprise System. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs">
              <Link 
                href="/privacy" 
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href="/security" 
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                Security
              </Link>
            </div>
          </div>

          {/* Version & Build Info */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Build 2024.001</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Globe className="h-3 w-3" />
              <span>Laravel + React</span>
            </span>
          </div>
        </div>

        {/* Performance Stats (Optional) */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <span>SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;