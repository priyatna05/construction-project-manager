import { motion } from "motion/react"
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={32} className="text-blue-400" />
              <span className="text-2xl font-bold">CV AJAT</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Building excellence in construction project management since 2009.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-gray-400 hover:text-white transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#projects" className="text-gray-400 hover:text-white transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Project Management</li>
              <li className="text-gray-400">Team Coordination</li>
              <li className="text-gray-400">Quality Assurance</li>
              <li className="text-gray-400">Consultation</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400">
                <Mail size={20} className="mt-1 flex-shrink-0" />
                <span>contact@cvajat.com</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone size={20} className="mt-1 flex-shrink-0" />
                <span>+62 123 4567 890</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CV Ajat Construction. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
