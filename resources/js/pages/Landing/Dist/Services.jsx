
import { motion } from "motion/react"
import { Building2, Users, ClipboardCheck, Rocket } from 'lucide-react';

const services = [
  {
    icon: Building2,
    title: 'Project Management',
    description: 'End-to-end construction project management with real-time tracking and reporting.',
  },
  {
    icon: Users,
    title: 'Team Coordination',
    description: 'Seamless collaboration tools for architects, engineers, and construction teams.',
  },
  {
    icon: ClipboardCheck,
    title: 'Quality Assurance',
    description: 'Rigorous quality control processes ensuring excellence at every stage.',
  },
  {
    icon: Rocket,
    title: 'Fast Delivery',
    description: 'Optimized workflows and resource management for on-time project completion.',
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive construction management solutions tailored to your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
