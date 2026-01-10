import { motion } from "motion/react"
import { MapPin, Calendar } from 'lucide-react';

const projects = [
  {
    title: 'Modern Office Complex',
    location: 'Jakarta CBD',
    year: '2024',
    image: 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Commercial',
  },
  {
    title: 'Luxury Residential Tower',
    location: 'Surabaya',
    year: '2023',
    image: 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Residential',
  },
  {
    title: 'Shopping Mall Expansion',
    location: 'Bandung',
    year: '2024',
    image: 'https://images.pexels.com/photos/2360673/pexels-photo-2360673.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Retail',
  },
  {
    title: 'Industrial Warehouse',
    location: 'Tangerang',
    year: '2023',
    image: 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Industrial',
  },
];

export function Projects() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Showcasing our commitment to excellence in every build
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl bg-gray-900 cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-8">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full mb-4 w-fit">
                  {project.category}
                </span>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {project.title}
                </h3>
                <div className="flex gap-6 text-gray-300">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{project.year}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
