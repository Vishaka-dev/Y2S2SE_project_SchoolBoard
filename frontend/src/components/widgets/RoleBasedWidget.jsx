import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, TrendingUp, Calendar, Award, FileText, GraduationCap, Building } from 'lucide-react';

const RoleBasedWidget = () => {
  const { user } = useAuth();

  if (!user || !user.role) return null;

  // Student Widget
  if (user.role === 'STUDENT') {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Welcome back, {user.fullName?.split(' ')[0]}!</h2>
            <p className="text-blue-100 text-sm">Continue your learning journey</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium text-blue-100">Active Courses</span>
            </div>
            <p className="text-2xl font-bold">5</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-xs font-medium text-blue-100">Achievements</span>
            </div>
            <p className="text-2xl font-bold">12</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium text-blue-100">Upcoming Exams</span>
            </div>
            <p className="text-2xl font-bold">3</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium text-blue-100">Avg. Score</span>
            </div>
            <p className="text-2xl font-bold">85%</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20">
          <h3 className="text-sm font-semibold mb-3">Recommended Teachers</h3>
          <div className="space-y-2">
            {[
              { name: 'Dr. Sarah Johnson', subject: 'Advanced Mathematics' },
              { name: 'Prof. Michael Lee', subject: 'Physics' }
            ].map((teacher, index) => (
              <div key={index} className="flex items-center justify-between bg-white/10 backdrop-blur rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{teacher.name}</p>
                  <p className="text-xs text-blue-100">{teacher.subject}</p>
                </div>
                <button className="px-3 py-1 bg-white text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Teacher Widget
  if (user.role === 'TEACHER') {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Hello, {user.fullName?.split(' ')[0]}!</h2>
            <p className="text-purple-100 text-sm">Manage your teaching activities</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-medium text-purple-100">Active Courses</span>
            </div>
            <p className="text-2xl font-bold">3</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium text-purple-100">Total Students</span>
            </div>
            <p className="text-2xl font-bold">87</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium text-purple-100">This Week</span>
            </div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-purple-100 mt-1">Classes</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-xs font-medium text-purple-100">Pending</span>
            </div>
            <p className="text-2xl font-bold">15</p>
            <p className="text-xs text-purple-100 mt-1">Assignments</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20">
          <h3 className="text-sm font-semibold mb-3">Student Requests</h3>
          <div className="space-y-2">
            {[
              { name: 'Alice Johnson', request: 'Extension request for assignment' },
              { name: 'Bob Smith', request: 'Question about lecture 5' }
            ].map((student, index) => (
              <div key={index} className="flex items-center justify-between bg-white/10 backdrop-blur rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-xs text-purple-100">{student.request}</p>
                </div>
                <button className="px-3 py-1 bg-white text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-50 transition">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Institute Widget
  if (user.role === 'INSTITUTE') {
    return (
      <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Welcome, {user.fullName || 'Institute'}!</h2>
            <p className="text-green-100 text-sm">Manage your institution</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium text-green-100">Total Staff</span>
            </div>
            <p className="text-2xl font-bold">45</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4" />
              <span className="text-xs font-medium text-green-100">Students</span>
            </div>
            <p className="text-2xl font-bold">1,234</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium text-green-100">Programs</span>
            </div>
            <p className="text-2xl font-bold">18</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium text-green-100">Enrollment</span>
            </div>
            <p className="text-2xl font-bold">+12%</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20">
          <h3 className="text-sm font-semibold mb-3">Recent Announcements</h3>
          <div className="space-y-2">
            {[
              { title: 'New Semester Registration', date: 'Mar 1' },
              { title: 'Faculty Meeting Schedule', date: 'Mar 3' }
            ].map((announcement, index) => (
              <div key={index} className="flex items-center justify-between bg-white/10 backdrop-blur rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{announcement.title}</p>
                  <p className="text-xs text-green-100">{announcement.date}</p>
                </div>
                <button className="px-3 py-1 bg-white text-green-600 rounded-lg text-xs font-medium hover:bg-green-50 transition">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RoleBasedWidget;
