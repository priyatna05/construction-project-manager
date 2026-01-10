import React, { useState } from 'react';
import { Download } from 'lucide-react';

const ConstructionPMTimeline = () => {
  const [activeTab, setActiveTab] = useState('timeline');

  // Data Sprint 0
  const sprint0 = [
    { no: 1, activity: "Identifikasi Kebutuhan Sistem (Wawancara, Observasi, Analisis Masalah)", startDate: "06/11/2023", dueDate: "10/11/2023", duration: 5, bobot: 1.45, status: "Done", m1: 1.45 },
    { no: 2, activity: "Mencari Studi Pustaka sebagai referensi", startDate: "13/11/2023", dueDate: "24/04/2024", duration: 105, bobot: 30.43, status: "Done", m2: 3.04, m3: 3.04, m4: 3.04, m5: 3.04, m6: 3.04, m7: 3.04, m8: 3.04, m9: 3.04, m10: 6.15 },
    { no: 3, activity: "Perancangan Alur Sistem (Flowchart, UML)", startDate: "25/04/2024", dueDate: "29/05/2024", duration: 20, bobot: 5.80, status: "Done", m6: 2.90, m7: 2.90 },
    { no: 4, activity: "Perancangan Database (Normalisasi, ERD, LRS, Spesifikasi Database)", startDate: "30/05/2024", dueDate: "12/07/2024", duration: 30, bobot: 8.70, status: "Done", m7: 2.90, m8: 2.90, m9: 2.90 },
    { no: 5, activity: "Perancangan UI", startDate: "15/07/2024", dueDate: "23/08/2024", duration: 30, bobot: 8.70, status: "Done", m9: 2.90, m10: 5.80 },
    { no: 6, activity: "Perancangan Product Backlog", startDate: "26/08/2024", dueDate: "02/09/2024", duration: 6, bobot: 1.74, status: "Done", m10: 0.87, m11: 0.87 }
  ];

  // Data Sprint 1
  const sprint1 = [
    { no: 1, activity: "Pembuatan Database, Tabel Akses, User, dan Level", startDate: "03/09/2024", dueDate: "03/09/2024", duration: 1, bobot: 0.29, status: "Done", m11: 0.29 },
    { no: 2, activity: "Pembuatan UI Login", startDate: "04/09/2024", dueDate: "10/09/2024", duration: 5, bobot: 1.45, status: "Done", m11: 1.45 },
    { no: 3, activity: "Implementasi autentikasi", startDate: "11/09/2024", dueDate: "18/09/2024", duration: 5, bobot: 1.45, status: "Done", m11: 1.45 },
    { no: 4, activity: "Pembuatan Menu logout", startDate: "19/09/2024", dueDate: "19/09/2024", duration: 1, bobot: 0.29, status: "Done", m11: 0.29 },
    { no: 5, activity: "Pembuatan tampilan dashboard", startDate: "20/09/2024", dueDate: "26/09/2024", duration: 5, bobot: 1.45, status: "Done", m11: 1.45 },
    { no: 6, activity: "Blackbox Testing Sprint 1", startDate: "27/09/2024", dueDate: "30/09/2024", duration: 2, bobot: 0.58, status: "Done", m11: 0.58 },
    { no: 7, activity: "UAT, Review & Retrospective", startDate: "01/10/2024", dueDate: "03/10/2024", duration: 2, bobot: 0.58, status: "Done", m12: 0.58 }
  ];

  // Data Sprint 2
  const sprint2 = [
    { no: 1, activity: "Pembuatan Tabel Database Customer", startDate: "03/10/2024", dueDate: "03/10/2024", duration: 1, bobot: 0.29, status: "Done", m12: 0.29 },
    { no: 2, activity: "Pembuatan UI Halaman Customer", startDate: "04/10/2024", dueDate: "10/10/2024", duration: 5, bobot: 1.45, status: "Done", m12: 1.45 },
    { no: 3, activity: "Implementasi Backend (CRUD) Modul Customer", startDate: "11/10/2024", dueDate: "17/10/2024", duration: 5, bobot: 1.45, status: "Done", m12: 1.45 },
    { no: 4, activity: "Pembuatan UI Halaman User", startDate: "18/10/2024", dueDate: "24/10/2024", duration: 5, bobot: 1.45, status: "Done", m12: 1.45 },
    { no: 5, activity: "Implementasi Backend (CRUD) Modul User", startDate: "25/10/2024", dueDate: "31/10/2024", duration: 5, bobot: 1.45, status: "Done", m12: 1.45 }
  ];

  // Data Sprint 3
  const sprint3 = [
    { no: 1, activity: "Pembuatan Tabel Database Project", startDate: "01/11/2024", dueDate: "01/11/2024", duration: 1, bobot: 0.29, status: "To Do", m12: 0.29 },
    { no: 2, activity: "Pembuatan UI Halaman Project", startDate: "04/11/2024", dueDate: "08/11/2024", duration: 5, bobot: 1.45, status: "To Do", m12: 1.45 },
    { no: 3, activity: "Implementasi Backend (CRUD) Modul Project", startDate: "11/11/2024", dueDate: "15/11/2024", duration: 5, bobot: 1.45, status: "To Do", m12: 1.45 },
    { no: 4, activity: "Pembuatan UI Upload & Parsing File MS Project", startDate: "18/11/2024", dueDate: "22/11/2024", duration: 5, bobot: 1.45, status: "To Do", m13: 1.45 },
    { no: 5, activity: "Implementasi Backend Parsing File MS Project", startDate: "25/11/2024", dueDate: "29/11/2024", duration: 5, bobot: 1.45, status: "To Do", m13: 1.45 },
    { no: 6, activity: "Blackbox Testing Sprint 3", startDate: "02/12/2024", dueDate: "06/12/2024", duration: 5, bobot: 1.45, status: "To Do", m13: 1.45 },
    { no: 7, activity: "UAT, Review & Retrospective", startDate: "09/12/2024", dueDate: "13/12/2024", duration: 5, bobot: 1.45, status: "To Do", m13: 1.45 }
  ];

  // Data Sprint 4 - Implementasi EVM
  const sprint4 = [
    { no: 1, activity: "Pembuatan Tabel Database EVM (PV, EV, AC)", startDate: "16/12/2024", dueDate: "20/12/2024", duration: 5, bobot: 1.45, status: "To Do", m13: 1.45 },
    { no: 2, activity: "Implementasi Perhitungan PV (Planned Value)", startDate: "23/12/2024", dueDate: "27/12/2024", duration: 5, bobot: 1.45, status: "To Do", m13: 1.45 },
    { no: 3, activity: "Implementasi Perhitungan EV (Earned Value)", startDate: "30/12/2024", dueDate: "03/01/2025", duration: 5, bobot: 1.45, status: "To Do", m14: 1.45 },
    { no: 4, activity: "Implementasi Perhitungan AC (Actual Cost)", startDate: "06/01/2025", dueDate: "10/01/2025", duration: 5, bobot: 1.45, status: "To Do", m14: 1.45 },
    { no: 5, activity: "Implementasi Perhitungan SV, CV, SPI, CPI", startDate: "13/01/2025", dueDate: "17/01/2025", duration: 5, bobot: 1.45, status: "To Do", m14: 1.45 },
    { no: 6, activity: "Pembuatan UI Dashboard EVM", startDate: "20/01/2025", dueDate: "24/01/2025", duration: 5, bobot: 1.45, status: "To Do", m14: 1.45 },
    { no: 7, activity: "Blackbox Testing Sprint 4", startDate: "27/01/2025", dueDate: "31/01/2025", duration: 5, bobot: 1.45, status: "To Do", m14: 1.45 }
  ];

  // Data Sprint 5 - Monitoring Real-time
  const sprint5 = [
    { no: 1, activity: "Implementasi Real-time Update Progress", startDate: "03/02/2025", dueDate: "07/02/2025", duration: 5, bobot: 1.45, status: "To Do", m15: 1.45 },
    { no: 2, activity: "Pembuatan Grafik Kurva S", startDate: "10/02/2025", dueDate: "14/02/2025", duration: 5, bobot: 1.45, status: "To Do", m15: 1.45 },
    { no: 3, activity: "Implementasi Alert & Notifikasi", startDate: "17/02/2025", dueDate: "21/02/2025", duration: 5, bobot: 1.45, status: "To Do", m15: 1.45 },
    { no: 4, activity: "Pembuatan Report Generator", startDate: "24/02/2025", dueDate: "28/02/2025", duration: 5, bobot: 1.45, status: "To Do", m15: 1.45 },
    { no: 5, activity: "Blackbox Testing Sprint 5", startDate: "03/03/2025", dueDate: "07/03/2025", duration: 5, bobot: 1.45, status: "To Do", m16: 1.45 }
  ];

  // Data Sprint 6 - Testing & Deployment
  const sprint6 = [
    { no: 1, activity: "Integration Testing Seluruh Modul", startDate: "10/03/2025", dueDate: "14/03/2025", duration: 5, bobot: 1.45, status: "To Do", m16: 1.45 },
    { no: 2, activity: "User Acceptance Testing (UAT) Lengkap", startDate: "17/03/2025", dueDate: "21/03/2025", duration: 5, bobot: 1.45, status: "To Do", m16: 1.45 },
    { no: 3, activity: "Perbaikan Bug & Enhancement", startDate: "24/03/2025", dueDate: "28/03/2025", duration: 5, bobot: 1.45, status: "To Do", m16: 1.45 },
    { no: 4, activity: "Deployment ke Server Production", startDate: "31/03/2025", dueDate: "04/04/2025", duration: 5, bobot: 1.45, status: "To Do", m17: 1.45 },
    { no: 5, activity: "Dokumentasi Sistem & User Manual", startDate: "07/04/2025", dueDate: "11/04/2025", duration: 5, bobot: 1.45, status: "To Do", m17: 1.45 }
  ];

  // Penyusunan Laporan
  const laporan = [
    { no: 1, activity: "Penyusunan Bab 1 - Pendahuluan", startDate: "14/04/2025", dueDate: "18/04/2025", duration: 5, bobot: 1.16, status: "To Do", m17: 1.16 },
    { no: 2, activity: "Penyusunan Bab 2 - Landasan Teori", startDate: "21/04/2025", dueDate: "25/04/2025", duration: 5, bobot: 1.16, status: "To Do", m17: 1.16 },
    { no: 3, activity: "Penyusunan Bab 3 - Metodologi", startDate: "28/04/2025", dueDate: "02/05/2025", duration: 5, bobot: 1.16, status: "To Do", m18: 1.16 },
    { no: 4, activity: "Penyusunan Bab 4 - Hasil & Pembahasan", startDate: "05/05/2025", dueDate: "09/05/2025", duration: 5, bobot: 1.16, status: "To Do", m18: 1.16 },
    { no: 5, activity: "Penyusunan Bab 5 - Kesimpulan & Saran", startDate: "12/05/2025", dueDate: "16/05/2025", duration: 5, bobot: 1.16, status: "To Do", m18: 1.16 },
    { no: 6, activity: "Revisi & Finalisasi Laporan", startDate: "19/05/2025", dueDate: "23/05/2025", duration: 5, bobot: 1.16, status: "To Do", m18: 1.16 }
  ];

  const allActivities = [
    ...sprint0.map(a => ({ ...a, sprint: 'Sprint 0' })),
    ...sprint1.map(a => ({ ...a, sprint: 'Sprint 1' })),
    ...sprint2.map(a => ({ ...a, sprint: 'Sprint 2' })),
    ...sprint3.map(a => ({ ...a, sprint: 'Sprint 3' })),
    ...sprint4.map(a => ({ ...a, sprint: 'Sprint 4' })),
    ...sprint5.map(a => ({ ...a, sprint: 'Sprint 5' })),
    ...sprint6.map(a => ({ ...a, sprint: 'Sprint 6' })),
    ...laporan.map(a => ({ ...a, sprint: 'Penyusunan Laporan' }))
  ];

  // Kurva S Data
  const kurvaData = [
    { month: 'M1', plan: 1.45, actual: 1.45, cumPlan: 1.45, cumActual: 1.45 },
    { month: 'M2', plan: 3.04, actual: 3.04, cumPlan: 4.49, cumActual: 4.49 },
    { month: 'M3', plan: 3.04, actual: 3.04, cumPlan: 7.53, cumActual: 7.53 },
    { month: 'M4', plan: 3.04, actual: 3.04, cumPlan: 10.57, cumActual: 10.57 },
    { month: 'M5', plan: 3.04, actual: 3.04, cumPlan: 13.61, cumActual: 13.61 },
    { month: 'M6', plan: 5.94, actual: 5.94, cumPlan: 19.55, cumActual: 19.55 },
    { month: 'M7', plan: 5.94, actual: 5.94, cumPlan: 25.49, cumActual: 25.49 },
    { month: 'M8', plan: 2.90, actual: 2.90, cumPlan: 28.39, cumActual: 28.39 },
    { month: 'M9', plan: 5.80, actual: 5.80, cumPlan: 34.19, cumActual: 34.19 },
    { month: 'M10', plan: 6.67, actual: 6.67, cumPlan: 40.86, cumActual: 40.86 },
    { month: 'M11', plan: 5.51, actual: 5.51, cumPlan: 46.37, cumActual: 46.37 },
    { month: 'M12', plan: 6.38, actual: 6.38, cumPlan: 52.75, cumActual: 52.75 },
    { month: 'M13', plan: 7.25, actual: 0, cumPlan: 60.00, cumActual: 52.75 },
    { month: 'M14', plan: 7.25, actual: 0, cumPlan: 67.25, cumActual: 52.75 },
    { month: 'M15', plan: 5.80, actual: 0, cumPlan: 73.05, cumActual: 52.75 },
    { month: 'M16', plan: 5.80, actual: 0, cumPlan: 78.85, cumActual: 52.75 },
    { month: 'M17', plan: 5.77, actual: 0, cumPlan: 84.62, cumActual: 52.75 },
    { month: 'M18', plan: 4.64, actual: 0, cumPlan: 100.00, cumActual: 52.75 }
  ];

  const downloadExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "TIMELINE PENELITIAN - CONSTRUCTION PROJECT MANAGER DENGAN EVM\n";
    csvContent += "Periode: Semester 8 - Semester 11\n\n";

    csvContent += "NO,SPRINT,ACTIVITY,START DATE,DUE DATE,DURATION (Days),BOBOT (%),STATUS,M1,M2,M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13,M14,M15,M16,M17,M18\n";

    allActivities.forEach((activity) => {
      csvContent += `${activity.no},${activity.sprint},"${activity.activity}",${activity.startDate},${activity.dueDate},${activity.duration},${activity.bobot},${activity.status},`;
      csvContent += `${activity.m1 || ''},${activity.m2 || ''},${activity.m3 || ''},${activity.m4 || ''},${activity.m5 || ''},${activity.m6 || ''},${activity.m7 || ''},${activity.m8 || ''},${activity.m9 || ''},${activity.m10 || ''},${activity.m11 || ''},${activity.m12 || ''},${activity.m13 || ''},${activity.m14 || ''},${activity.m15 || ''},${activity.m16 || ''},${activity.m17 || ''},${activity.m18 || ''}\n`;
    });

    csvContent += "\n\nKURVA S DATA\n";
    csvContent += "MONTH,PLAN (%),ACTUAL (%),CUMULATIVE PLAN (%),CUMULATIVE ACTUAL (%)\n";
    kurvaData.forEach(data => {
      csvContent += `${data.month},${data.plan},${data.actual},${data.cumPlan},${data.cumActual}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Timeline_Kurva_S_Construction_PM.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Timeline & Kurva S Penelitian
              </h1>
              <p className="text-gray-600">
                Perancangan Aplikasi Construction Project Manager untuk Monitoring Real-time Kinerja Proyek Konstruksi Menggunakan EVM
              </p>
            </div>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
            >
              <Download size={20} />
              Download Excel
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-gray-600">Periode</p>
              <p className="font-bold text-gray-800">Semester 8 - 11</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-gray-600">Total Aktivitas</p>
              <p className="font-bold text-gray-800">{allActivities.length} Tasks</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-gray-600">Progress Saat Ini</p>
              <p className="font-bold text-gray-800">52.75%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-gray-600">Status</p>
              <p className="font-bold text-gray-800">Semester 11</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'timeline'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Timeline Detail
            </button>
            <button
              onClick={() => setActiveTab('kurva')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'kurva'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Kurva S
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'timeline' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border text-left">No</th>
                      <th className="p-2 border text-left">Sprint</th>
                      <th className="p-2 border text-left">Activity</th>
                      <th className="p-2 border text-left">Start</th>
                      <th className="p-2 border text-left">Due</th>
                      <th className="p-2 border text-center">Days</th>
                      <th className="p-2 border text-center">Bobot %</th>
                      <th className="p-2 border text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allActivities.map((activity, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 border">{activity.no}</td>
                        <td className="p-2 border font-semibold text-blue-600">{activity.sprint}</td>
                        <td className="p-2 border">{activity.activity}</td>
                        <td className="p-2 border">{activity.startDate}</td>
                        <td className="p-2 border">{activity.dueDate}</td>
                        <td className="p-2 border text-center">{activity.duration}</td>
                        <td className="p-2 border text-center">{activity.bobot}%</td>
                        <td className="p-2 border text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            activity.status === 'Done'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'kurva' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Kurva S - Progress Penelitian</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border">Bulan</th>
                        <th className="p-2 border">Plan (%)</th>
                        <th className="p-2 border">Actual (%)</th>
                        <th className="p-2 border">Cumulative Plan (%)</th>
                        <th className="p-2 border">Cumulative Actual (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kurvaData.map((data, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-2 border font-semibold">{data.month}</td>
                          <td className="p-2 border text-center">{data.plan.toFixed(2)}</td>
                          <td className="p-2 border text-center">{data.actual.toFixed(2)}</td>
                          <td className="p-2 border text-center font-bold text-blue-600">{data.cumPlan.toFixed(2)}</td>
                          <td className="p-2 border text-center font-bold text-green-600">{data.cumActual.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-bold mb-4 text-center">Grafik Kurva S (Kumulatif)</h4>
                  <div className="relative h-64">
                    <svg viewBox="0 0 800 300" className="w-full h-full">
                      {[0, 25, 50, 75, 100].map((y) => (
                        <line
                          key={y}
                          x1="50"
                          y1={250 - (y * 2)}
                          x2="750"
                          y2={250 - (y * 2)}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      ))}

                      {[0, 25, 50, 75, 100].map((y) => (
                        <text
                          key={y}
                          x="30"
                          y={255 - (y * 2)}
                          fontSize="12"
                          fill="#6b7280"
                        >
                          {y}%
                        </text>
                      ))}

                      <polyline
                        points={kurvaData.map((d, i) => `${50 + (i * 40)},${250 - (d.cumPlan * 2)}`).join(' ')}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                      />

                      <polyline
                        points={kurvaData.map((d, i) => `${50 + (i * 40)},${250 - (d.cumActual * 2)}`).join(' ')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                      />

                      {kurvaData.map((d, i) => (
                        <text
                          key={i}
                          x={45 + (i * 40)}
                          y="275"
                          fontSize="10"
                          fill="#6b7280"
                        >
                          {d.month}
                        </text>
                      ))}
                    </svg>
                  </div>

                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">Cumulative Plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Cumulative Actual</span>
                    </div>
                  </div>
