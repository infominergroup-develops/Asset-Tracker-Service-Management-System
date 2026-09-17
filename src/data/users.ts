import { UserRole, UserProfile } from '../types';

export const USER_PROFILES: Record<UserRole, UserProfile> = {
  employee: {
    id: 'EMP-GUEST',
    name: 'Self-Service Employee',
    email: 'employee@infominer.in',
    role: 'employee',
    designation: 'Staff Member (Public No-Login Access)',
  },
  // Guest user does not need password

  manager: {
    id: 'MGR-01',
    name: 'Swati Katiyar',
    email: 'swati.katiyar@infominer.in',
    role: 'manager',
    password: 'password',
    department: 'Operations & Service Delivery',
    designation: 'Operations Manager',
  },
  director: {
    id: 'DIR-01',
    name: 'Krishna Mittal',
    email: 'krishna.mittal@infominer.in',
    role: 'director',
    password: 'password',
    designation: 'Managing Director',
  },
  admin: {
    id: 'ADM-01',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@infominer.in',
    role: 'admin',
    password: 'password',
    department: 'Technology & IT Infrastructure',
    designation: 'System Administrator',
  },
  vendor: {
    id: 'VND-001',
    name: 'Suresh Verma',
    email: 'service@abctechnologies.in',
    role: 'vendor',
    password: 'password',
    vendorId: 'VND-001',
    designation: 'Authorized Service Lead (ABC Technologies)',
  },
};
