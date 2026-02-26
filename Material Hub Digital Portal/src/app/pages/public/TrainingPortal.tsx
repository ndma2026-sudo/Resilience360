import { useState } from "react";
import { GraduationCap, Calendar, MapPin, Users, Clock, CheckCircle, PlayCircle } from "lucide-react";
import { mockTrainingPrograms } from "../../data/mockData";

export function TrainingPortal() {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const selectedDetails = mockTrainingPrograms.find(p => p.id === selectedProgram);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Training & Certification Portal</h1>
        <p className="text-xl text-gray-600">
          Build skills in disaster-resilient construction techniques
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
          <GraduationCap className="h-10 w-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-2">{mockTrainingPrograms.length}</div>
          <div className="text-emerald-100">Active Programs</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <Users className="h-10 w-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-2">
            {mockTrainingPrograms.reduce((sum, p) => sum + p.enrolled, 0)}
          </div>
          <div className="text-blue-100">Total Enrolled</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
          <CheckCircle className="h-10 w-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-2">
            {mockTrainingPrograms.reduce((sum, p) => sum + p.capacity, 0)}
          </div>
          <div className="text-purple-100">Total Capacity</div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white shadow-lg">
          <PlayCircle className="h-10 w-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-2">12+</div>
          <div className="text-orange-100">Video Tutorials</div>
        </div>
      </div>

      {/* Training Programs Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Training Programs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockTrainingPrograms.map((program) => {
            const spotsLeft = program.capacity - program.enrolled;
            const enrollmentPercentage = (program.enrolled / program.capacity) * 100;

            return (
              <div 
                key={program.id} 
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                      <p className="text-gray-600 text-sm">{program.description}</p>
                    </div>
                    <div className={`flex-shrink-0 ml-4 px-3 py-1 rounded-lg text-xs font-semibold ${
                      spotsLeft > 10 ? 'bg-green-100 text-green-700' :
                      spotsLeft > 0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {program.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {program.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 col-span-2">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Starts: {new Date(program.startDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Enrollment</span>
                      <span className="font-semibold">{program.enrolled}/{program.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          enrollmentPercentage >= 90 ? 'bg-red-500' :
                          enrollmentPercentage >= 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${enrollmentPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Topics Covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {program.topics.map((topic, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProgram(program.id)}
                    disabled={spotsLeft === 0}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      spotsLeft > 0
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {spotsLeft > 0 ? 'Register Now' : 'Registration Full'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Tutorials Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 mb-12 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <PlayCircle className="h-7 w-7 mr-3 text-emerald-600" />
          Video Tutorials Library
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Bamboo Frame Installation', duration: '15 min', views: 1234 },
            { title: 'EPS Panel Fitting Basics', duration: '12 min', views: 987 },
            { title: 'CGI Sheet Roofing Complete Guide', duration: '20 min', views: 2341 },
            { title: 'Foundation Preparation', duration: '18 min', views: 876 },
            { title: 'Weatherproofing Techniques', duration: '14 min', views: 1543 },
            { title: 'Quality Control & Inspection', duration: '16 min', views: 765 },
          ].map((video, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow cursor-pointer">
              <div className="bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg h-32 flex items-center justify-center mb-4">
                <PlayCircle className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{video.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {video.duration}
                </span>
                <span>{video.views.toLocaleString()} views</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certification Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0 bg-emerald-100 p-4 rounded-xl">
            <GraduationCap className="h-12 w-12 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Earn Your Certification</h2>
            <p className="text-gray-600 mb-4">
              Complete training programs and receive official certification from NDMA Pakistan. 
              Certified builders are prioritized for reconstruction projects and community training roles.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Official Recognition</p>
                  <p className="text-sm text-gray-600">NDMA certified credentials</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Job Opportunities</p>
                  <p className="text-sm text-gray-600">Priority in reconstruction projects</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Skill Development</p>
                  <p className="text-sm text-gray-600">Continuous learning support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal (Simple) */}
      {selectedProgram && selectedDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Register for Training</h3>
            <p className="text-gray-600 mb-6">{selectedDetails.title}</p>
            
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="">Select Experience Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedProgram(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Registration submitted! You will receive a confirmation email shortly.');
                  setSelectedProgram(null);
                }}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-colors"
              >
                Submit Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
