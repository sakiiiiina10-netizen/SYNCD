import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { SCHOOL_NAME } from '@/lib/constants';

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/30 px-4 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
          <GraduationCap className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {SCHOOL_NAME}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          School Management System
        </p>

        <div className="mt-8 space-y-3">
          <Link to="/login" className="btn-primary w-full justify-center py-3 text-base">
            Login
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/signup" className="btn-secondary w-full justify-center py-3 text-base">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
